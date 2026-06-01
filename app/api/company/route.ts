import { NextRequest, NextResponse } from "next/server";
import { searchTicker, getQuoteSummary, extractFinancials } from "@/lib/yahoo-finance";
import { getCIKByTicker, getRecentFilingText, detectKeywordsInText, getXBRLFinancials } from "@/lib/sec-edgar";
import { fetchNews } from "@/lib/news";
import { detectTechStack } from "@/lib/tech-detect";
import { computeScore, detectRedFlags, detectOpportunities } from "@/lib/scoring";
import type { HealthCheckResult, CompanyOverview, Financials, TechSignals } from "@/types/company";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const ticker = await searchTicker(query);
  if (!ticker) return NextResponse.json({ error: `No public company found for "${query}"` }, { status: 404 });

  const [summary, cik] = await Promise.all([
    getQuoteSummary(ticker),
    getCIKByTicker(ticker),
  ]);

  const yahooData = extractFinancials(summary);

  const [filingText, news, techStack, xbrl] = await Promise.all([
    cik ? getRecentFilingText(cik) : Promise.resolve(null),
    fetchNews(query),
    yahooData?.website ? detectTechStack(yahooData.website) : Promise.resolve([]),
    cik ? getXBRLFinancials(cik) : Promise.resolve(null),
  ]);

  const { digitalKeywords, competitorSoftware } = filingText
    ? detectKeywordsInText(filingText)
    : { digitalKeywords: [], competitorSoftware: [] };

  // Merge: prefer Yahoo Finance, fall back to SEC EDGAR XBRL
  const revenue = yahooData?.revenue ?? xbrl?.revenue ?? null;
  const rdSpend = yahooData?.rdSpend ?? xbrl?.rdSpend ?? null;
  const revenueHistory = yahooData?.revenueHistory?.length
    ? yahooData.revenueHistory
    : xbrl?.revenueHistory ?? [];
  const rdHistory = yahooData?.rdHistory?.length
    ? yahooData.rdHistory
    : xbrl?.rdHistory ?? [];

  // Compute YoY from history if Yahoo Finance didn't provide it
  let revenueGrowthYoy = yahooData?.revenueGrowthYoy ?? null;
  if (revenueGrowthYoy === null && revenueHistory.length >= 2) {
    const [latest, prev] = revenueHistory;
    if (prev.value) revenueGrowthYoy = (latest.value - prev.value) / prev.value;
  }

  const operatingMargin =
    yahooData?.operatingMargin ??
    xbrl?.operatingMargin ??
    null;

  const grossMargin =
    yahooData?.grossMargin ??
    xbrl?.grossMargin ??
    null;

  const overview: CompanyOverview = {
    name: query,
    ticker,
    exchange: yahooData?.exchange ?? "",
    industry: yahooData?.industry ?? "Unknown",
    sector: yahooData?.sector ?? "Unknown",
    description: yahooData?.description ?? "",
    website: yahooData?.website ?? "",
    headquarters: yahooData?.headquarters ?? "",
    founded: "",
    employees: yahooData?.employees ?? xbrl?.employees ?? null,
    employeeGrowthYoy: null,
  };

  const financials: Financials = {
    marketCap: yahooData?.marketCap ?? null,
    revenue,
    revenueGrowthYoy,
    grossMargin,
    operatingMargin,
    netIncome: yahooData?.netIncome ?? xbrl?.netIncome ?? null,
    ebitda: yahooData?.ebitda ?? null,
    rdSpend,
    rdAsPercentRevenue: revenue && rdSpend ? rdSpend / revenue : (xbrl?.rdAsPercentRevenue ?? null),
    cash: yahooData?.cash ?? xbrl?.cash ?? null,
    totalDebt: yahooData?.totalDebt ?? xbrl?.totalDebt ?? null,
    peRatio: yahooData?.peRatio ?? null,
    eps: yahooData?.eps ?? null,
    revenueHistory,
    rdHistory,
  };

  const cloudPlatforms = techStack.filter((t) =>
    ["Microsoft Azure", "AWS", "Google Cloud"].includes(t)
  );

  const techSignals: TechSignals = {
    detectedTech: techStack,
    competitorSoftware,
    digitalKeywords,
    cloudPlatforms,
  };

  const score = computeScore(overview, financials, techSignals);
  const redFlags = detectRedFlags(financials, techSignals);
  const opportunities = detectOpportunities(overview, financials, techSignals);

  const result: HealthCheckResult = {
    overview,
    financials,
    techSignals,
    news,
    score,
    redFlags,
    opportunities,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
