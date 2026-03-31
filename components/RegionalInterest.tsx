"use client";

import { RegionalInterestData } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MapPin } from "lucide-react";

interface Props {
  regions: RegionalInterestData[];
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
        <p className="text-slate-300 font-medium">{label}</p>
        <p className="text-indigo-400">Interest: {payload[0].value}/100</p>
      </div>
    );
  }
  return null;
};

export default function RegionalInterest({ regions }: Props) {
  const topRegions = regions.slice(0, 10);

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <MapPin size={18} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-lg">
          Interest by Region
        </h3>
      </div>

      {topRegions.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={topRegions}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="geoName"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b" }} />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">No regional data available</p>
        </div>
      )}
    </div>
  );
}
