"use client";
import type { OpportunityScore, RedFlag, Opportunity } from "@/types/company";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? "#22c55e" : score >= 45 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 70 ? "HIGH OPPORTUNITY" : score >= 45 ? "MODERATE" : "LOW FIT";
  const circumference = 2 * Math.PI * 40;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff10" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
          {score}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="8">
          /100
        </text>
      </svg>
      <div className="text-sm font-bold mt-1" style={{ color }}>{label}</div>
    </div>
  );
}

function ScoreBar({ label, value, max = 25 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00BEDC]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function OpportunityScoreSection({
  score,
  redFlags,
  opportunities,
}: {
  score: OpportunityScore;
  redFlags: RedFlag[];
  opportunities: Opportunity[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Score */}
      <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00BEDC]" />
          DIS Opportunity Score
        </h3>
        <div className="flex justify-center mb-6">
          <ScoreRing score={score.total} />
        </div>
        <div className="space-y-3">
          <ScoreBar label="Industry Fit" value={score.industryFit} />
          <ScoreBar label="R&D Intensity" value={score.rdIntensity} />
          <ScoreBar label="Digital Maturity" value={score.digitalMaturity} />
          <ScoreBar label="Financial Health" value={score.financialHealth} />
        </div>
        {score.breakdown.length > 0 && (
          <ul className="mt-4 space-y-1">
            {score.breakdown.map((b, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2">
                <span className="text-[#00BEDC] mt-0.5">›</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Opportunities */}
      <div className="bg-[#000028] border border-emerald-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Opportunities
        </h3>
        {opportunities.length === 0 ? (
          <p className="text-gray-400 text-sm">No strong signals detected.</p>
        ) : (
          <div className="space-y-3">
            {opportunities.map((o, i) => (
              <div key={i} className="border border-emerald-500/20 rounded-lg p-3">
                <div className="text-emerald-400 font-medium text-sm">{o.label}</div>
                <div className="text-gray-300 text-xs mt-1">{o.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Red Flags */}
      <div className="bg-[#000028] border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Red Flags
        </h3>
        {redFlags.length === 0 ? (
          <p className="text-gray-400 text-sm">No major red flags detected.</p>
        ) : (
          <div className="space-y-3">
            {redFlags.map((f, i) => {
              const colors = {
                high: { border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
                medium: { border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
                low: { border: "border-gray-500/30", text: "text-gray-400", dot: "bg-gray-400" },
              }[f.severity];
              return (
                <div key={i} className={`border ${colors.border} rounded-lg p-3`}>
                  <div className={`font-medium text-sm flex items-center gap-2 ${colors.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {f.label}
                    <span className="ml-auto text-xs opacity-70 uppercase">{f.severity}</span>
                  </div>
                  <div className="text-gray-300 text-xs mt-1">{f.detail}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
