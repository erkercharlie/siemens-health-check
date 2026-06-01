export interface CompanyOverview {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  sector: string;
  description: string;
  website: string;
  headquarters: string;
  founded: string;
  employees: number | null;
  employeeGrowthYoy: number | null;
}

export interface Financials {
  marketCap: number | null;
  revenue: number | null;
  revenueGrowthYoy: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netIncome: number | null;
  ebitda: number | null;
  rdSpend: number | null;
  rdAsPercentRevenue: number | null;
  cash: number | null;
  totalDebt: number | null;
  peRatio: number | null;
  eps: number | null;
  revenueHistory: Array<{ year: string; value: number }>;
  rdHistory: Array<{ year: string; value: number }>;
}

export interface TechSignals {
  detectedTech: string[];
  competitorSoftware: string[];
  digitalKeywords: string[];
  cloudPlatforms: string[];
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface OpportunityScore {
  total: number;
  industryFit: number;
  rdIntensity: number;
  digitalMaturity: number;
  financialHealth: number;
  breakdown: string[];
}

export interface RedFlag {
  label: string;
  severity: "high" | "medium" | "low";
  detail: string;
}

export interface Opportunity {
  label: string;
  detail: string;
}

export interface HealthCheckResult {
  overview: CompanyOverview;
  financials: Financials;
  techSignals: TechSignals;
  news: NewsItem[];
  score: OpportunityScore;
  redFlags: RedFlag[];
  opportunities: Opportunity[];
  generatedAt: string;
}
