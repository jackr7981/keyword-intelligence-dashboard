"use client";

import { KeywordIdea } from "@/lib/types";
import { DollarSign, BarChart3, Gauge, Search, Settings, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface Props {
  primaryMetrics: KeywordIdea | null;
  relatedKeywords: KeywordIdea[];
  keyword: string;
  isConfigured: boolean;
  error?: string;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return String(vol);
}

function formatCPC(micros: number): string {
  const dollars = micros / 1_000_000;
  return `$${dollars.toFixed(2)}`;
}

function competitionColor(comp: string): string {
  switch (comp) {
    case "LOW":
      return "text-emerald-400";
    case "MEDIUM":
      return "text-amber-400";
    case "HIGH":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
}

function competitionBg(comp: string): string {
  switch (comp) {
    case "LOW":
      return "bg-emerald-500/10 border-emerald-500/20";
    case "MEDIUM":
      return "bg-amber-500/10 border-amber-500/20";
    case "HIGH":
      return "bg-red-500/10 border-red-500/20";
    default:
      return "bg-slate-500/10 border-slate-500/20";
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-slate-400 text-xs uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <p className="text-white font-bold text-2xl">{value}</p>
      {subtitle && (
        <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function SetupGuide() {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-600/20 rounded-lg flex items-center justify-center border border-amber-500/30">
          <Settings size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Google Ads Keyword Planner</h3>
          <p className="text-slate-400 text-xs">
            Configure to unlock search volume, CPC & competition data
          </p>
        </div>
      </div>
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 text-sm space-y-3">
        <p className="text-slate-300 font-medium">Setup required — add these env vars:</p>
        <div className="space-y-1.5 font-mono text-xs">
          <p className="text-indigo-300">GOOGLE_ADS_CLIENT_ID</p>
          <p className="text-indigo-300">GOOGLE_ADS_CLIENT_SECRET</p>
          <p className="text-indigo-300">GOOGLE_ADS_REFRESH_TOKEN</p>
          <p className="text-indigo-300">GOOGLE_ADS_DEVELOPER_TOKEN</p>
          <p className="text-indigo-300">GOOGLE_ADS_CUSTOMER_ID</p>
          <p className="text-slate-500">GOOGLE_ADS_LOGIN_CUSTOMER_ID <span className="text-slate-600">(optional, for MCC)</span></p>
        </div>
        <div className="border-t border-slate-700 pt-3 space-y-2 text-slate-400 text-xs">
          <p>1. Google Cloud Console → Enable Google Ads API → Create OAuth credentials</p>
          <p>2. Google Ads → Tools → API Center → Get developer token</p>
          <p>3. Generate refresh token via OAuth Playground</p>
        </div>
      </div>
    </div>
  );
}

type SortField = "keyword" | "avgMonthlySearches" | "competitionIndex" | "highBidMicros";

export default function KeywordMetrics({
  primaryMetrics,
  relatedKeywords,
  keyword,
  isConfigured,
  error,
}: Props) {
  const [sortField, setSortField] = useState<SortField>("avgMonthlySearches");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!isConfigured) return <SetupGuide />;

  if (error) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 border border-red-500/20">
        <h3 className="text-white font-semibold mb-2">Keyword Metrics</h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...relatedKeywords].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1;
    if (sortField === "keyword") return mult * a.keyword.localeCompare(b.keyword);
    return mult * ((a[sortField] as number) - (b[sortField] as number));
  });

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 size={18} className="text-violet-400" />
        <h3 className="text-white font-semibold text-lg">Keyword Metrics</h3>
        <span className="ml-auto text-slate-500 text-xs">Google Ads Keyword Planner</span>
      </div>

      {/* Primary keyword stats */}
      {primaryMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Search}
            label="Monthly Volume"
            value={formatVolume(primaryMetrics.avgMonthlySearches)}
            subtitle="avg. searches/month"
            color="text-blue-400"
          />
          <StatCard
            icon={DollarSign}
            label="CPC (Low)"
            value={formatCPC(primaryMetrics.lowBidMicros)}
            subtitle="top-of-page bid"
            color="text-emerald-400"
          />
          <StatCard
            icon={DollarSign}
            label="CPC (High)"
            value={formatCPC(primaryMetrics.highBidMicros)}
            subtitle="top-of-page bid"
            color="text-amber-400"
          />
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Gauge size={14} className="text-violet-400" />
              <span className="text-slate-400 text-xs uppercase tracking-wide font-medium">
                Competition
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-bold border ${competitionBg(
                  primaryMetrics.competition
                )} ${competitionColor(primaryMetrics.competition)}`}
              >
                {primaryMetrics.competition}
              </span>
              <span className="text-white font-bold text-lg">
                {primaryMetrics.competitionIndex}
                <span className="text-slate-500 text-sm font-normal">/100</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Related keywords table */}
      {sorted.length > 0 && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-3">
            Related Keyword Ideas ({sorted.length})
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs uppercase">
                  <th className="text-left px-4 py-3">
                    <button
                      onClick={() => handleSort("keyword")}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      Keyword
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button
                      onClick={() => handleSort("avgMonthlySearches")}
                      className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    >
                      Volume
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button
                      onClick={() => handleSort("highBidMicros")}
                      className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    >
                      CPC
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3">
                    <button
                      onClick={() => handleSort("competitionIndex")}
                      className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
                    >
                      Competition
                      <ArrowUpDown size={10} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sorted.map((kw) => (
                  <tr
                    key={kw.keyword}
                    className="hover:bg-slate-750 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-slate-200">{kw.keyword}</td>
                    <td className="px-4 py-2.5 text-right text-slate-300 font-medium">
                      {formatVolume(kw.avgMonthlySearches)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-300">
                      {formatCPC(kw.highBidMicros)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`text-xs font-semibold ${competitionColor(
                          kw.competition
                        )}`}
                      >
                        {kw.competition}{" "}
                        <span className="text-slate-500">({kw.competitionIndex})</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
