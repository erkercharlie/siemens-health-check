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
