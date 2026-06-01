"use client";
import type { Financials } from "@/types/company";

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

function MetricTile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "good" | "bad" | "neutral";
}) {
  const colors = {
    good: "text-emerald-400",
    bad: "text-red-400",
    neutral: "text-[#00BEDC]",
  };
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? colors[highlight] : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function FinancialHealth({ data }: { data: Financials }) {
  const revenueGrowthHighlight =
    data.revenueGrowthYoy === null
      ? undefined
      : data.revenueGrowthYoy > 0.05
      ? "good"
      : data.revenueGrowthYoy < -0.05
      ? "bad"
      : "neutral";

  const marginHighlight =
    data.operatingMargin === null
      ? undefined
      : data.operatingMargin > 0.1
      ? "good"
      : data.operatingMargin < 0
      ? "bad"
      : "neutral";

  const rdHighlight =
    data.rdAsPercentRevenue === null
      ? undefined
      : data.rdAsPercentRevenue > 0.08
      ? "good"
      : data.rdAsPercentRevenue > 0.02
      ? "neutral"
      : "bad";

  return (
    <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00BEDC]" />
        Financial Health
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricTile label="Market Cap" value={fmt(data.marketCap, "currency")} />
        <MetricTile
          label="Revenue (TTM)"
          value={fmt(data.revenue, "currency")}
          sub={
            data.revenueGrowthYoy !== null
              ? `${data.revenueGrowthYoy >= 0 ? "+" : ""}${fmt(data.revenueGrowthYoy, "percent")} YoY`
              : undefined
          }
          highlight={revenueGrowthHighlight}
        />
        <MetricTile label="EBITDA" value={fmt(data.ebitda, "currency")} />
        <MetricTile label="P/E Ratio" value={data.peRatio !== null ? data.peRatio.toFixed(1) : "N/A"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricTile
          label="Gross Margin"
          value={fmt(data.grossMargin, "percent")}
          highlight={data.grossMargin !== null ? (data.grossMargin > 0.3 ? "good" : "neutral") : undefined}
        />
        <MetricTile
          label="Operating Margin"
          value={fmt(data.operatingMargin, "percent")}
          highlight={marginHighlight}
        />
        <MetricTile label="Cash" value={fmt(data.cash, "currency")} />
        <MetricTile label="Total Debt" value={fmt(data.totalDebt, "currency")} highlight={data.totalDebt !== null && data.totalDebt > (data.cash ?? 0) * 3 ? "bad" : undefined} />
      </div>

      <div className="bg-[#00BEDC]/10 border border-[#00BEDC]/30 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">R&D Investment</div>
            <div className={`text-2xl font-bold ${rdHighlight === "good" ? "text-emerald-400" : rdHighlight === "bad" ? "text-red-400" : "text-[#00BEDC]"}`}>
              {fmt(data.rdSpend, "currency")}
            </div>
            <div className="text-sm text-gray-300 mt-1">
              {fmt(data.rdAsPercentRevenue, "percent")} of revenue
            </div>
          </div>
          <div className="text-right text-xs text-gray-400 max-w-[200px]">
            High R&D spend signals demand for engineering simulation, PLM, and design automation tools.
          </div>
        </div>
      </div>

      {data.revenueHistory.length > 1 && (
        <div className="mt-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Revenue History</div>
          <div className="flex items-end gap-2 h-16">
            {data.revenueHistory
              .slice()
              .reverse()
              .map((h, i) => {
                const maxVal = Math.max(...data.revenueHistory.map((r) => r.value));
                const pct = maxVal ? (h.value / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#00BEDC]/50 rounded-t"
                      style={{ height: `${pct}%`, minHeight: 4 }}
                    />
                    <span className="text-xs text-gray-400">{h.year}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
