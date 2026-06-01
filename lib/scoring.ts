import type {
  CompanyOverview,
  Financials,
  TechSignals,
  OpportunityScore,
  RedFlag,
  Opportunity,
} from "@/types/company";

const HIGH_FIT_INDUSTRIES = [
  "aerospace", "automotive", "defense", "electronics", "semiconductor",
  "industrial machinery", "medical device", "medical equipment", "energy",
  "oil & gas", "shipbuilding", "rail", "consumer electronics", "telecom equipment",
];

const MED_FIT_INDUSTRIES = [
  "chemical", "consumer goods", "pharmaceutical", "healthcare", "construction",
  "heavy equipment", "plastics", "packaging",
];

function industryFitScore(industry: string, sector: string): number {
  const combined = `${industry} ${sector}`.toLowerCase();
  if (HIGH_FIT_INDUSTRIES.some((k) => combined.includes(k))) return 25;
  if (MED_FIT_INDUSTRIES.some((k) => combined.includes(k))) return 15;
  if (combined.includes("manufactur")) return 20;
  if (combined.includes("technolog") || combined.includes("software")) return 8;
  return 5;
}

function rdIntensityScore(rdPct: number | null): number {
  if (rdPct === null) return 5;
  if (rdPct > 0.15) return 25;
  if (rdPct > 0.10) return 20;
  if (rdPct > 0.05) return 15;
  if (rdPct > 0.02) return 10;
  return 5;
}

function digitalMaturityScore(keywords: string[]): number {
  return Math.min(25, keywords.length * 5);
}

function financialHealthScore(fin: Financials): number {
  let score = 12;
  if (fin.revenueGrowthYoy !== null) {
    if (fin.revenueGrowthYoy > 0.1) score += 8;
    else if (fin.revenueGrowthYoy > 0) score += 4;
    else score -= 4;
  }
  if (fin.operatingMargin !== null) {
    if (fin.operatingMargin > 0.1) score += 5;
    else if (fin.operatingMargin < 0) score -= 5;
  }
  return Math.max(0, Math.min(25, score));
}

export function computeScore(
  overview: CompanyOverview,
  financials: Financials,
  techSignals: TechSignals
): OpportunityScore {
  const industryFit = industryFitScore(overview.industry, overview.sector);
  const rdIntensity = rdIntensityScore(financials.rdAsPercentRevenue);
  const digitalMaturity = digitalMaturityScore(techSignals.digitalKeywords);
  const financialHealth = financialHealthScore(financials);
  const total = industryFit + rdIntensity + digitalMaturity + financialHealth;

  const breakdown: string[] = [];
  if (industryFit >= 20) breakdown.push(`${overview.industry} is a strong Siemens DIS vertical`);
  if (rdIntensity >= 15) breakdown.push("High R&D investment signals need for engineering tools");
  if (digitalMaturity >= 15) breakdown.push("Filing mentions multiple digital/manufacturing keywords");
  if (financialHealth >= 20) breakdown.push("Strong financials — budget for new software investment");

  return { total, industryFit, rdIntensity, digitalMaturity, financialHealth, breakdown };
}

export function detectRedFlags(
  financials: Financials,
  techSignals: TechSignals
): RedFlag[] {
  const flags: RedFlag[] = [];

  if (financials.revenueGrowthYoy !== null && financials.revenueGrowthYoy < -0.05) {
    flags.push({
      label: "Revenue Declining",
      severity: "high",
      detail: `Revenue down ${Math.abs(financials.revenueGrowthYoy * 100).toFixed(1)}% YoY — budget constraints likely`,
    });
  }

  if (financials.operatingMargin !== null && financials.operatingMargin < -0.1) {
    flags.push({
      label: "Deep Operating Losses",
      severity: "high",
      detail: `Operating margin at ${(financials.operatingMargin * 100).toFixed(1)}% — financial distress risk`,
    });
  }

  if (techSignals.competitorSoftware.length > 0) {
    flags.push({
      label: "Incumbent Competitor Software",
      severity: "medium",
      detail: `Using or mentioning: ${techSignals.competitorSoftware.join(", ")}`,
    });
  }

  if (financials.rdAsPercentRevenue !== null && financials.rdAsPercentRevenue < 0.01) {
    flags.push({
      label: "Minimal R&D Investment",
      severity: "low",
      detail: "Low R&D spend — limited engineering tool demand",
    });
  }

  if (financials.totalDebt && financials.cash && financials.totalDebt > financials.cash * 5) {
    flags.push({
      label: "High Leverage",
      severity: "medium",
      detail: "Debt significantly exceeds cash — software capex may be constrained",
    });
  }

  return flags;
}

export function detectOpportunities(
  overview: CompanyOverview,
  financials: Financials,
  techSignals: TechSignals
): Opportunity[] {
  const opps: Opportunity[] = [];

  if (financials.rdAsPercentRevenue !== null && financials.rdAsPercentRevenue > 0.08) {
    opps.push({
      label: "High R&D Intensity",
      detail: `${(financials.rdAsPercentRevenue * 100).toFixed(1)}% of revenue goes to R&D — strong need for PLM, simulation, and design tools`,
    });
  }

  if (financials.revenueGrowthYoy !== null && financials.revenueGrowthYoy > 0.1) {
    opps.push({
      label: "Rapid Growth",
      detail: `${(financials.revenueGrowthYoy * 100).toFixed(1)}% revenue growth — scaling operations may need digital manufacturing infrastructure`,
    });
  }

  if (techSignals.digitalKeywords.some((k) => k.toLowerCase().includes("digital twin"))) {
    opps.push({
      label: "Digital Twin Interest",
      detail: "Explicitly mentions digital twin technology — aligns with Siemens Xcelerator platform",
    });
  }

  if (techSignals.digitalKeywords.some((k) => ["MES", "manufacturing execution"].includes(k))) {
    opps.push({
      label: "MES/Shop Floor Interest",
      detail: "Manufacturing execution system mentioned — Opcenter opportunity",
    });
  }

  if (techSignals.digitalKeywords.includes("additive manufacturing") || techSignals.digitalKeywords.includes("3D printing")) {
    opps.push({
      label: "Additive Manufacturing",
      detail: "AM/3D printing mentioned — Siemens NX and simulation tools directly applicable",
    });
  }

  if (techSignals.competitorSoftware.length > 0 && overview.employees && overview.employees > 5000) {
    opps.push({
      label: "Competitive Displacement",
      detail: `Large company currently using ${techSignals.competitorSoftware[0]} — migration conversation opportunity`,
    });
  }

  if (overview.employees && overview.employees > 10000) {
    opps.push({
      label: "Enterprise Scale",
      detail: `${overview.employees.toLocaleString()} employees — enterprise licensing and multi-site deployment potential`,
    });
  }

  return opps;
}
