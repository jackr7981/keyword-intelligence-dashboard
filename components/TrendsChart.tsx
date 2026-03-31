"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendDataPoint } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  data: TrendDataPoint[];
  keyword: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm shadow-lg">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-indigo-400 font-semibold">
          Interest: {payload[0].value}/100
        </p>
      </div>
    );
  }
  return null;
};

export default function TrendsChart({ data, keyword }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex items-center justify-center h-64">
        <p className="text-slate-400">No trend data available</p>
      </div>
    );
  }

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const avgFirst = firstHalf.reduce((s, d) => s + d.value, 0) / (firstHalf.length || 1);
  const avgSecond = secondHalf.reduce((s, d) => s + d.value, 0) / (secondHalf.length || 1);
  const trendPct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
  const currentValue = data[data.length - 1]?.value || 0;

  const TrendIcon =
    trendPct > 5 ? TrendingUp : trendPct < -5 ? TrendingDown : Minus;
  const trendColor =
    trendPct > 5
      ? "text-emerald-400"
      : trendPct < -5
      ? "text-red-400"
      : "text-slate-400";

  const sampledData =
    data.length > 52
      ? data.filter((_, i) => i % Math.ceil(data.length / 52) === 0)
      : data;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Interest Over Time
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">
            &ldquo;{keyword}&rdquo; — Google Trends (0–100 scale)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-slate-400 text-xs">Current</p>
            <p className="text-white font-bold text-2xl">{currentValue}</p>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={20} />
            <span className="font-semibold text-sm">
              {Math.abs(trendPct).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={sampledData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            vertical={false}
          />
          <XAxis
            dataKey="formattedTime"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
