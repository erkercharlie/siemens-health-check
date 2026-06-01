"use client";
import type { Financials } from "@/types/company";
import Tooltip from "@/components/Tooltip";

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
  tooltip,
  value,
  sub,
  highlight,
}: {
  label: string;
  tooltip?: string;
  value: string;
  sub?: string;
  highlight?: "good" | "bad" | "neutral";
}) {
  const colors = { good: "text-emerald-400", bad: "text-red-400", neutral: "text-[#00BEDC]" };
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div className={`text-xl font-bold ${highlight ? colors[highlight] : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function FinancialHealth({ data }: { data: Financials }) {
  const revenueGrowthHighlight =
    data.revenueGrowthYoy === null ? undefined
    : data.revenueGrowthYoy > 0.05 ? "good"
    : data.revenueGrowthYoy < -0.05 ? "bad"
    : "neutral";

  const marginHighlight =
    data.operatingMargin === null ? undefined
    : data.operatingMargin > 0.1 ? "good"
    : data.operatingMargin < 0 ? "bad"
    : "neutral";

  const rdHighlight =
    data.rdAsPercentRevenue === null ? undefined
    : data.rdAsPercentRevenue > 0.08 ? "good"
    : data.rdAsPercentRevenue > 0.02 ? "neutral"
    : "bad";

  const maxVal = Math.max(...data.revenueHistory.map((r) => r.value), 1);
  const BAR_PX = 56;

  return (
    <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00BEDC]" />
        Financial Health
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricTile
          label="Market Cap"
          tooltip="Total market value of all outstanding shares. Larger companies generally have larger software budgets."
          value={fmt(data.marketCap, "currency")}
        />
        <MetricTile
          label="Revenue (TTM)"
          tooltip="Trailing Twelve Months — the most recent 12 months of total revenue. YoY = year-over-year growth compared to the same period last year."
          value={fmt(data.revenue, "currency")}
          sub={
            data.revenueGrowthYoy !== null
              ? `${data.revenueGrowthYoy >= 0 ? "+" : ""}${fmt(data.revenueGrowthYoy, "percent")} YoY`
              : undefined
          }
          highlight={revenueGrowthHighlight}
        />
        <MetricTile
          label="EBITDA"
          tooltip="Earnings Before Interest, Taxes, Depreciation & Amortization. A measure of core operating profitability — positive EBITDA means the business generates real cash."
          value={fmt(data.ebitda, "currency")}
        />
        <MetricTile
          label="P/E Ratio"
          tooltip="Price-to-Earnings ratio — how much investors pay per dollar of earnings. High P/E can mean growth expectations; N/A often means the company is unprofitable."
          value={data.peRatio !== null ? data.peRatio.toFixed(1) : "N/A"}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricTile
          label="Gross Margin"
          tooltip="Revenue minus cost of goods sold, as a % of revenue. Shows how efficiently the company produces its product before overhead."
          value={fmt(data.grossMargin, "percent")}
          highlight={data.grossMargin !== null ? (data.grossMargin > 0.3 ? "good" : "neutral") : undefined}
        />
        <MetricTile
          label="Operating Margin"
          tooltip="Operating income as a % of revenue — what's left after paying all operating costs. Above 10% is healthy; negative means the company is burning money to operate."
          value={fmt(data.operatingMargin, "percent")}
          highlight={marginHighlight}
        />
        <MetricTile
          label="Cash"
          tooltip="Cash and short-term investments on hand. Companies with strong cash positions are more likely to invest in new software and infrastructure."
          value={fmt(data.cash, "currency")}
        />
        <MetricTile
          label="Total Debt"
          tooltip="Long-term debt obligations. High debt relative to cash can constrain capital spending — including software purchases."
          value={fmt(data.totalDebt, "currency")}
          highlight={
            data.totalDebt !== null && data.totalDebt > (data.cash ?? 0) * 3 ? "bad" : undefined
          }
        />
      </div>

      <div className="bg-[#00BEDC]/10 border border-[#00BEDC]/30 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center">
              R&D Investment
              <Tooltip text="Annual Research & Development spend. High R&D intensity (>8% of revenue) signals strong demand for engineering tools like PLM, simulation, and CAD — Siemens DIS's core market." />
            </div>
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
        <div className="mt-5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center">
            Revenue History
            <Tooltip text="Annual revenue over the past 4 fiscal years, oldest to newest (left to right). Hover a bar to see the exact value." />
          </div>
          <div className="flex items-end gap-2">
            {data.revenueHistory
              .slice()
              .reverse()
              .map((h, i) => {
                const barH = Math.max(4, (h.value / maxVal) * BAR_PX);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-gray-600 group-hover:text-gray-300 transition-colors">
                      {fmt(h.value, "currency")}
                    </span>
                    <div
                      className="w-full bg-[#00BEDC]/50 rounded-t hover:bg-[#00BEDC]/80 transition-colors cursor-default"
                      style={{ height: barH }}
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
