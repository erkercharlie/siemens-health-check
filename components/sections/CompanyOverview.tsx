"use client";
import type { CompanyOverview } from "@/types/company";

function fmt(n: number | null, type: "currency" | "percent" | "number" = "number"): string {
  if (n === null) return "N/A";
  if (type === "currency") {
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  }
  if (type === "percent") return `${(n * 100).toFixed(1)}%`;
  return n.toLocaleString();
}

export default function CompanyOverviewSection({ data }: { data: CompanyOverview }) {
  return (
    <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{data.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[#00BEDC] font-mono font-bold text-lg">{data.ticker}</span>
            {data.exchange && (
              <span className="text-xs bg-[#00BEDC]/20 text-[#00BEDC] px-2 py-0.5 rounded-full">
                {data.exchange}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Industry</div>
          <div className="text-white font-medium">{data.industry}</div>
          <div className="text-gray-400 text-sm">{data.sector}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {data.headquarters && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">HQ</div>
            <div className="text-white text-sm">{data.headquarters}</div>
          </div>
        )}
        {data.employees !== null && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Employees</div>
            <div className="text-white text-sm">{fmt(data.employees)}</div>
          </div>
        )}
        {data.website && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Website</div>
            <a
              href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00BEDC] text-sm hover:underline truncate block"
            >
              {data.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>

      {data.description && (
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{data.description}</p>
      )}
    </div>
  );
}
