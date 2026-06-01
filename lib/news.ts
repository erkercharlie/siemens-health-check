import { parseStringPromise } from "xml2js";
import type { NewsItem } from "@/types/company";

const POSITIVE_WORDS = [
  "growth", "record", "beats", "expands", "launches", "wins", "acquires",
  "partnership", "profit", "revenue", "strong", "innovation", "new",
];
const NEGATIVE_WORDS = [
  "loss", "decline", "layoffs", "cuts", "miss", "warning", "lawsuit",
  "investigation", "recall", "bankruptcy", "debt", "downgrade", "risk",
];

function detectSentiment(text: string): NewsItem["sentiment"] {
  const lower = text.toLowerCase();
  const pos = POSITIVE_WORDS.filter((w) => lower.includes(w)).length;
  const neg = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

export async function fetchNews(companyName: string): Promise<NewsItem[]> {
  try {
    const query = encodeURIComponent(`"${companyName}" (manufacturing OR software OR technology OR earnings OR acquisition)`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);
    const items = parsed?.rss?.channel?.[0]?.item ?? [];

    return items.slice(0, 8).map((item: Record<string, string[]>) => {
      const title = item.title?.[0] ?? "";
      const link = item.link?.[0] ?? "";
      const pubDate = item.pubDate?.[0] ?? "";
      const source = item.source?.[0] ?? "";
      return {
        title,
        source: typeof source === "object" ? (source as { _?: string })?._ ?? "News" : source,
        date: pubDate ? new Date(pubDate).toLocaleDateString("en-US") : "",
        url: link,
        sentiment: detectSentiment(title),
      };
    });
  } catch {
    return [];
  }
}
