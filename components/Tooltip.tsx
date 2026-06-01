"use client";
import { useState, useRef } from "react";

export default function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-gray-500 hover:border-[#00BEDC] hover:text-[#00BEDC] text-[9px] font-bold leading-none transition-colors flex-shrink-0"
        aria-label="More information"
      >
        i
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-xs text-gray-200 z-50 shadow-xl pointer-events-none leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}
