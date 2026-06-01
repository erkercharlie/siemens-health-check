const SEC_HEADERS = {
  "User-Agent": "Siemens DIS Health Check erkercharlie@gmail.com",
  Accept: "application/json",
};

export async function getCIKByTicker(ticker: string): Promise<string | null> {
  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: SEC_HEADERS,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const entry = Object.values(data as Record<string, { ticker: string; cik_str: number }>).find(
      (v) => v.ticker?.toLowerCase() === ticker.toLowerCase()
    );
    return entry ? String(entry.cik_str).padStart(10, "0") : null;
  } catch {
    return null;
  }
}

export async function getRecentFilingText(cik: string): Promise<string | null> {
  try {
    const subRes = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
      headers: SEC_HEADERS,
      next: { revalidate: 86400 },
    });
    if (!subRes.ok) return null;
    const sub = await subRes.json();
    const filings = sub?.filings?.recent ?? {};
    const forms: string[] = filings.form ?? [];
    const accessions: string[] = filings.accessionNumber ?? [];
    const primaryDocs: string[] = filings.primaryDocument ?? [];

    const idx10k = forms.findIndex((f: string) => f === "10-K");
    if (idx10k === -1) return null;

    const accession = accessions[idx10k].replace(/-/g, "");
    const doc = primaryDocs[idx10k];
    const url = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}//${accession}/${doc}`;

    const docRes = await fetch(url, {
      headers: { ...SEC_HEADERS, Accept: "text/html" },
      next: { revalidate: 86400 },
    });
    if (!docRes.ok) return null;
    const html = await docRes.text();
    return html.slice(0, 150000);
  } catch {
    return null;
  }
}

const SIEMENS_KEYWORDS = [
  "digital twin",
  "digitaltwin",
  "PLM",
  "product lifecycle",
  "CAD",
  "CAM",
  "CAE",
  "MES",
  "manufacturing execution",
  "simulation",
  "industrial IoT",
  "IIoT",
  "industry 4.0",
  "smart manufacturing",
  "digital thread",
  "additive manufacturing",
  "3D printing",
  "automation",
  "robotics",
  "SCADA",
  "digital transformation",
  "cloud manufacturing",
  "embedded software",
  "systems engineering",
];

const COMPETITOR_KEYWORDS = [
  { name: "PTC Windchill", patterns: ["Windchill", "PTC", "Creo", "Vuforia"] },
  { name: "Dassault ENOVIA/CATIA", patterns: ["ENOVIA", "CATIA", "SOLIDWORKS", "Dassault", "3DEXPERIENCE"] },
  { name: "Autodesk", patterns: ["Autodesk", "Fusion 360", "Inventor", "Vault", "Navisworks"] },
  { name: "SAP PLM", patterns: ["SAP PLM", "SAP S/4HANA"] },
  { name: "Arena PLM", patterns: ["Arena PLM", "Arena Solutions"] },
  { name: "Oracle Agile", patterns: ["Oracle Agile", "Agile PLM"] },
];

type XBRLEntry = { form: string; end: string; val: number; frame?: string };

function latestAnnual(entries: XBRLEntry[] | undefined): number | null {
  if (!entries?.length) return null;
  const annual = entries.filter((e) => e.form === "10-K");
  if (!annual.length) return null;
  annual.sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  return annual[0].val;
}

function annualHistory(entries: XBRLEntry[] | undefined, limit = 4): Array<{ year: string; value: number }> {
  if (!entries?.length) return [];
  const annual = entries
    .filter((e) => e.form === "10-K" && e.end)
    .sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
  const seen = new Set<string>();
  return annual
    .filter((e) => {
      const y = e.end.slice(0, 4);
      if (seen.has(y)) return false;
      seen.add(y);
      return true;
    })
    .slice(0, limit)
    .map((e) => ({ year: e.end.slice(0, 4), value: e.val }));
}

export async function getXBRLFinancials(cik: string) {
  try {
    const res = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
      headers: SEC_HEADERS,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const gaap = data?.facts?.["us-gaap"] ?? {};
    const dei = data?.facts?.dei ?? {};

    const usd = (c: string): XBRLEntry[] | undefined => gaap[c]?.units?.USD;

    const revenueEntries =
      usd("Revenues") ??
      usd("RevenueFromContractWithCustomerExcludingAssessedTax") ??
      usd("SalesRevenueNet") ??
      usd("RevenueFromContractWithCustomerIncludingAssessedTax") ??
      usd("RevenuesNetOfInterestExpense");

    const rdEntries = usd("ResearchAndDevelopmentExpense");
    const netIncomeEntries = usd("NetIncomeLoss");
    const opIncomeEntries = usd("OperatingIncomeLoss");
    const grossProfitEntries = usd("GrossProfit");
    const cashEntries = usd("CashAndCashEquivalentsAtCarryingValue") ?? usd("Cash");
    const debtEntries = usd("LongTermDebt") ?? usd("LongTermDebtNoncurrent");

    const revenue = latestAnnual(revenueEntries);
    const rdSpend = latestAnnual(rdEntries);
    const netIncome = latestAnnual(netIncomeEntries);
    const operatingIncome = latestAnnual(opIncomeEntries);
    const grossProfit = latestAnnual(grossProfitEntries);

    const empEntries: XBRLEntry[] | undefined = dei["EntityNumberOfEmployees"]?.units?.pure;
    const employees = empEntries?.length
      ? [...empEntries].sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())[0].val
      : null;

    return {
      revenue,
      rdSpend,
      rdAsPercentRevenue: revenue && rdSpend ? rdSpend / revenue : null,
      netIncome,
      operatingIncome,
      operatingMargin: revenue && operatingIncome ? operatingIncome / revenue : null,
      grossProfit,
      grossMargin: revenue && grossProfit ? grossProfit / revenue : null,
      cash: latestAnnual(cashEntries),
      totalDebt: latestAnnual(debtEntries),
      employees,
      revenueHistory: annualHistory(revenueEntries),
      rdHistory: annualHistory(rdEntries),
    };
  } catch {
    return null;
  }
}

export function detectKeywordsInText(text: string) {
  const lower = text.toLowerCase();
  const found = SIEMENS_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
  const competitors: string[] = [];
  for (const c of COMPETITOR_KEYWORDS) {
    if (c.patterns.some((p) => lower.includes(p.toLowerCase()))) {
      competitors.push(c.name);
    }
  }
  return { digitalKeywords: found, competitorSoftware: competitors };
}
