"use client";
import { useState, useRef } from "react";
import type { HealthCheckResult } from "@/types/company";
import CompanyOverviewSection from "@/components/sections/CompanyOverview";
import FinancialHealth from "@/components/sections/FinancialHealth";
import OpportunityScoreSection from "@/components/sections/OpportunityScore";
import TechStackSection from "@/components/sections/TechStack";
import NewsSection from "@/components/sections/NewsSection";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function runHealthCheck(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/company?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runHealthCheck(query);
  }

  return (
    <div className="min-h-screen" style={{ background: "#00001f" }}>
      {/* Header */}
      <header className="border-b border-white/10" style={{ background: "#000028" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="4" fill="#00BEDC" />
              <text x="18" y="25" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">S</text>
            </svg>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Siemens Digital Industries</div>
              <div className="text-[#00BEDC] text-xs">Company Health Check</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 hidden md:block">
            Sales Intelligence Dashboard
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero search */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Run a Company Health Check
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Enter any public company to get financials, tech signals, and Siemens DIS opportunity scoring.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Boeing, TSLA, General Electric..."
              className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00BEDC] focus:ring-1 focus:ring-[#00BEDC] text-sm"
              style={{ background: "#000028" }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-xl px-6 py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? "#005a69" : "#00BEDC", color: "#000028" }}
            >
              {loading ? "Analyzing..." : "Run Check"}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-[#00BEDC] border-t-transparent animate-spin" />
            </div>
            <div className="text-gray-400 text-sm text-center">
              Fetching financials, SEC filings, tech signals, and news...
              <br />
              <span className="text-xs text-gray-600">This may take 10–15 seconds</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto border border-red-500/30 rounded-xl p-4 text-red-400 text-center text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-4">
            <div className="text-right text-xs text-gray-600">
              Generated {new Date(result.generatedAt).toLocaleString()}
            </div>
            <CompanyOverviewSection data={result.overview} />
            <FinancialHealth data={result.financials} />
            <OpportunityScoreSection
              score={result.score}
              redFlags={result.redFlags}
              opportunities={result.opportunities}
            />
            <TechStackSection data={result.techSignals} />
            <NewsSection items={result.news} />
            <div className="text-center pt-4 pb-8 text-xs text-gray-600">
              Data sourced from Yahoo Finance, SEC EDGAR, and Google News · For internal Siemens DIS use only
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !result && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Financial Overview", desc: "Revenue, R&D spend, margins, market cap, debt profile" },
              { label: "Opportunity Score", desc: "Industry fit, digital maturity signals, and growth trajectory" },
              { label: "Tech Signals", desc: "Website tech stack, SEC filing keywords, competitor software" },
            ].map((card) => (
              <div
                key={card.label}
                className="border border-white/10 rounded-xl p-5"
                style={{ background: "#000028" }}
              >
                <div className="text-[#00BEDC] font-semibold text-sm mb-1">{card.label}</div>
                <div className="text-gray-400 text-xs">{card.desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
