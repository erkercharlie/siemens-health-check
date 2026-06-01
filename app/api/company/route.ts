import { NextRequest, NextResponse } from "next/server";
import { searchTicker, getQuoteSummary, extractFinancials } from "@/lib/yahoo-finance";
import { getCIKByTicker, getRecentFilingText, detectKeywordsInText } from "@/lib/sec-edgar";
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

  const extracted = extractFinancials(summary);

  const [filingText, news, techStack] = await Promise.all([
    cik ? getRecentFilingText(cik) : Promise.resolve(null),
    fetchNews(query),
    extracted?.website ? detectTechStack(extracted.website) : Promise.resolve([]),
  ]);

  const { digitalKeywords, competitorSoftware } = filingText
    ? detectKeywordsInText(filingText)
    : { digitalKeywords: [], competitorSoftware: [] };

  const overview: CompanyOverview = {
    name: query,
    ticker,
    exchange: extracted?.exchange ?? "",
    industry: extracted?.industry ?? "Unknown",
    sector: extracted?.sector ?? "Unknown",
    description: extracted?.description ?? "",
    website: extracted?.website ?? "",
    headquarters: extracted?.headquarters ?? "",
    founded: "",
    employees: extracted?.employees ?? null,
    employeeGrowthYoy: null,
  };

  const financials: Financials = {
    marketCap: extracted?.marketCap ?? null,
    revenue: extracted?.revenue ?? null,
    revenueGrowthYoy: extracted?.revenueGrowthYoy ?? null,
    grossMargin: extracted?.grossMargin ?? null,
    operatingMargin: extracted?.operatingMargin ?? null,
    netIncome: extracted?.netIncome ?? null,
    ebitda: extracted?.ebitda ?? null,
    rdSpend: extracted?.rdSpend ?? null,
    rdAsPercentRevenue: extracted?.rdAsPercentRevenue ?? null,
    cash: extracted?.cash ?? null,
    totalDebt: extracted?.totalDebt ?? null,
    peRatio: extracted?.peRatio ?? null,
    eps: extracted?.eps ?? null,
    revenueHistory: extracted?.revenueHistory ?? [],
    rdHistory: extracted?.rdHistory ?? [],
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
