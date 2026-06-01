"use client";
import type { NewsItem } from "@/types/company";
import Citation from "@/components/Citation";

export default function NewsSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00BEDC]" />
        Recent News
        <Citation source="Google News RSS" />
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => {
          const sentimentColor = {
            positive: "bg-emerald-500",
            neutral: "bg-gray-500",
            negative: "bg-red-500",
          }[item.sentiment];

          return (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 hover:bg-white/5 rounded-lg p-2 -mx-2 transition-colors group"
            >
              <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${sentimentColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-200 group-hover:text-white transition-colors leading-snug">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{item.source}</span>
                  {item.date && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
