const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function searchTicker(query: string): Promise<string | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=5&newsCount=0`;
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const quotes = data?.quotes ?? [];
    const equity = quotes.find((q: { quoteType: string }) => q.quoteType === "EQUITY");
    return equity?.symbol ?? quotes[0]?.symbol ?? null;
  } catch {
    return null;
  }
}

export async function getQuoteSummary(ticker: string) {
  try {
    const modules = [
      "assetProfile",
      "summaryProfile",
      "financialData",
      "defaultKeyStatistics",
      "incomeStatementHistory",
      "balanceSheetHistory",
    ].join(",");
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`;
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.quoteSummary?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

export function extractFinancials(summary: Record<string, unknown> | null) {
  if (!summary) return null;

  const profile = (summary.assetProfile ?? summary.summaryProfile ?? {}) as Record<string, unknown>;
  const fin = (summary.financialData ?? {}) as Record<string, { raw?: number }>;
  const stats = (summary.defaultKeyStatistics ?? {}) as Record<string, { raw?: number }>;
  const incomeHistory = ((summary.incomeStatementHistory as { incomeStatementHistory?: unknown[] } | null)?.incomeStatementHistory ?? []) as Array<Record<string, { raw?: number } | string>>;
  const balanceHistory = ((summary.balanceSheetHistory as { balanceSheetStatements?: unknown[] } | null)?.balanceSheetStatements ?? []) as Array<Record<string, { raw?: number } | string>>;

  const raw = (obj: Record<string, { raw?: number }>, key: string): number | null =>
    (obj[key] as { raw?: number } | null)?.raw ?? null;

  const revenue = raw(fin, "totalRevenue");
  const rdSpend = incomeHistory[0]
    ? (incomeHistory[0].researchDevelopment as { raw?: number } | null)?.raw ?? null
    : null;

  const revenueHistory = incomeHistory
    .slice(0, 4)
    .map((s) => ({
      year: String((s.endDate as { fmt?: string } | null)?.fmt ?? "").slice(0, 4),
      value: (s.totalRevenue as { raw?: number } | null)?.raw ?? 0,
    }))
    .filter((h) => h.year && h.value);

  const rdHistory = incomeHistory
    .slice(0, 4)
    .map((s) => ({
      year: String((s.endDate as { fmt?: string } | null)?.fmt ?? "").slice(0, 4),
      value: (s.researchDevelopment as { raw?: number } | null)?.raw ?? 0,
    }))
    .filter((h) => h.year && h.value);

  const cash =
    (balanceHistory[0]?.cash as { raw?: number } | null)?.raw ??
    (balanceHistory[0]?.cashAndCashEquivalents as { raw?: number } | null)?.raw ??
    null;

  const totalDebt =
    (balanceHistory[0]?.longTermDebt as { raw?: number } | null)?.raw ??
    (balanceHistory[0]?.totalDebt as { raw?: number } | null)?.raw ??
    null;

  return {
    marketCap: raw(stats, "marketCap"),
    revenue,
    revenueGrowthYoy: raw(fin, "revenueGrowth"),
    grossMargin: raw(fin, "grossMargins"),
    operatingMargin: raw(fin, "operatingMargins"),
    netIncome: raw(fin, "netIncomeToCommon"),
    ebitda: raw(fin, "ebitda"),
    rdSpend,
    rdAsPercentRevenue: revenue && rdSpend ? rdSpend / revenue : null,
    cash,
    totalDebt,
    peRatio: raw(stats, "forwardPE") ?? raw(stats, "trailingPE"),
    eps: raw(stats, "trailingEps"),
    revenueHistory,
    rdHistory,
    employees: (profile.fullTimeEmployees as number | null) ?? null,
    industry: (profile.industry as string | null) ?? null,
    sector: (profile.sector as string | null) ?? null,
    website: (profile.website as string | null) ?? null,
    headquarters: [profile.city, profile.state, profile.country]
      .filter(Boolean)
      .join(", "),
    description: (profile.longBusinessSummary as string | null) ?? null,
    exchange: (profile.exchange as string | null) ?? null,
  };
}
