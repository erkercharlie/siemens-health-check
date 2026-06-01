"use client";
import { useState } from "react";

export default function Citation({ source }: { source: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-0.5">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-gray-500 hover:border-emerald-500 hover:text-emerald-400 text-[9px] font-bold leading-none transition-colors flex-shrink-0"
        aria-label="Data source"
      >
        C
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-xs z-50 shadow-xl pointer-events-none leading-relaxed">
          <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Source</div>
          <div className="text-emerald-400">{source}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}
