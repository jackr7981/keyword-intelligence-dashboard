"use client";

import { AnalysisResult } from "@/lib/types";
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface Props {
  analysis: AnalysisResult;
  keyword: string;
  isLoading?: boolean;
}

function Section({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  color: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon size={14} className="text-white" />
        </div>
        <h4 className="text-white font-semibold text-sm">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5 shrink-0 text-xs">•</span>
            <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="h-4 bg-slate-700 rounded w-2/3" />
      </div>
      <div className="h-4 bg-slate-700 rounded w-4/5" />
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-slate-700/60 rounded w-4/5" />
            <div className="h-3 bg-slate-700/60 rounded w-3/5" />
            <div className="h-3 bg-slate-700/60 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisPanel({ analysis, keyword, isLoading }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/25 to-slate-800 rounded-2xl p-6 border border-indigo-500/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">AI Analysis</h3>
          <p className="text-indigo-300 text-xs">
            Powered by Claude Haiku via OpenRouter
          </p>
        </div>
        <span className="ml-auto px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-medium">
          {keyword}
        </span>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-6">
          {analysis.summary && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-indigo-400" />
                <span className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                  Executive Summary
                </span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          )}

          {analysis.trendPattern && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-emerald-400" />
                <span className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                  Trend Pattern
                </span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">
                {analysis.trendPattern}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section
              icon={Target}
              title="Search Intent"
              items={analysis.searchIntent}
              color="bg-blue-600"
            />
            <Section
              icon={Lightbulb}
              title="Content Angles"
              items={analysis.contentAngles}
              color="bg-amber-600"
            />
            <Section
              icon={TrendingUp}
              title="Opportunities"
              items={analysis.opportunities}
              color="bg-emerald-600"
            />
            <Section
              icon={AlertTriangle}
              title="Risks & Challenges"
              items={analysis.risks}
              color="bg-red-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
