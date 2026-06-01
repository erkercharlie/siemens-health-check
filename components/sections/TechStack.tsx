"use client";
import type { TechSignals } from "@/types/company";

export default function TechStackSection({ data }: { data: TechSignals }) {
  if (
    data.detectedTech.length === 0 &&
    data.competitorSoftware.length === 0 &&
    data.digitalKeywords.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-[#000028] border border-[#00BEDC]/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00BEDC]" />
        Technology Signals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.detectedTech.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Detected on Website</div>
            <div className="flex flex-wrap gap-2">
              {data.detectedTech.map((t) => (
                <span key={t} className="text-xs bg-[#00BEDC]/20 text-[#00BEDC] px-2 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.digitalKeywords.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Filing Keywords</div>
            <div className="flex flex-wrap gap-2">
              {data.digitalKeywords.map((k) => (
                <span key={k} className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.competitorSoftware.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Competitor Software</div>
            <div className="flex flex-wrap gap-2">
              {data.competitorSoftware.map((c) => (
                <span key={c} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
