const TECH_PATTERNS: Array<{ name: string; patterns: string[] }> = [
  { name: "Salesforce", patterns: ["salesforce.com", "force.com"] },
  { name: "SAP", patterns: ["sap.com", "sapbusinessone", "s4hana"] },
  { name: "Oracle", patterns: ["oracle.com", "oraclecloud"] },
  { name: "Microsoft Azure", patterns: ["azure.com", "azureedge.net", "microsoftonline"] },
  { name: "AWS", patterns: ["amazonaws.com", "cloudfront.net"] },
  { name: "Google Cloud", patterns: ["googleapis.com", "googletagmanager"] },
  { name: "Workday", patterns: ["workday.com", "myworkday"] },
  { name: "ServiceNow", patterns: ["servicenow.com", "service-now.com"] },
  { name: "Snowflake", patterns: ["snowflakecomputing"] },
  { name: "Tableau", patterns: ["tableau.com", "tableausoftware"] },
  { name: "PTC", patterns: ["ptc.com", "windchill", "creo"] },
  { name: "Dassault Systèmes", patterns: ["3ds.com", "solidworks", "catia"] },
  { name: "Autodesk", patterns: ["autodesk.com", "autodeskcdn"] },
  { name: "Siemens Teamcenter", patterns: ["teamcenter", "plm.automation.siemens"] },
  { name: "React", patterns: ["react.development", "_next/static", "reactroot"] },
  { name: "Angular", patterns: ["ng-version", "angular.min"] },
  { name: "WordPress", patterns: ["wp-content", "wp-includes"] },
  { name: "Marketo", patterns: ["marketo.com", "mktdns.net"] },
  { name: "HubSpot", patterns: ["hubspot.com", "hsforms"] },
];

export async function detectTechStack(websiteUrl: string): Promise<string[]> {
  if (!websiteUrl) return [];
  try {
    const normalized = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    const res = await fetch(normalized, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const lower = html.toLowerCase();

    return TECH_PATTERNS.filter((tech) =>
      tech.patterns.some((p) => lower.includes(p.toLowerCase()))
    ).map((t) => t.name);
  } catch {
    return [];
  }
}
