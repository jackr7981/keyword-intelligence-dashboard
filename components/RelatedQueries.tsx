"use client";

import { RelatedQuery } from "@/lib/types";
import { TrendingUp, BarChart2 } from "lucide-react";

interface Props {
  topQueries: RelatedQuery[];
  risingQueries: RelatedQuery[];
  keyword: string;
}

function QueryRow({
  query,
  value,
  formattedValue,
  isRising,
}: RelatedQuery & { isRising?: boolean }) {
  const displayValue = isRising ? `+${formattedValue}%` : `${value}`;
  const barWidth = isRising ? Math.min(100, value / 10) : value;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm truncate">{query}</p>
        <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              isRising ? "bg-emerald-500" : "bg-indigo-500"
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      <span
        className={`text-xs font-semibold shrink-0 ${
          isRising ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}

export default function RelatedQueries({
  topQueries,
  risingQueries,
}: Props) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <h3 className="text-white font-semibold text-lg mb-5">
        Related Queries
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-indigo-400" />
            <span className="text-slate-300 text-sm font-medium">
              Top Queries
            </span>
          </div>
          {topQueries.length > 0 ? (
            <div className="divide-y divide-slate-700/50">
              {topQueries.map((q) => (
                <QueryRow key={q.query} {...q} />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No data available</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <span className="text-slate-300 text-sm font-medium">
              Rising Queries
            </span>
          </div>
          {risingQueries.length > 0 ? (
            <div className="divide-y divide-slate-700/50">
              {risingQueries.map((q) => (
                <QueryRow key={q.query} {...q} isRising />
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
