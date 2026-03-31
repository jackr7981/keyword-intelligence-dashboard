"use client";

import { SuggestResponse } from "@/lib/types";
import { Lightbulb, HelpCircle } from "lucide-react";

interface Props {
  data: SuggestResponse;
  keyword: string;
}

export default function SearchSuggestions({ data, keyword }: Props) {
  const hasSuggestions = data.suggestions.length > 0;
  const hasQuestions = data.questions.length > 0;

  if (!hasSuggestions && !hasQuestions) return null;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <Lightbulb size={18} className="text-amber-400" />
        <h3 className="text-white font-semibold text-lg">
          Google Autocomplete Insights
        </h3>
        <span className="ml-auto text-slate-500 text-xs">Free — no API key needed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Autocomplete suggestions */}
        {hasSuggestions && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-slate-300 text-sm font-medium">
                People Also Search
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.suggestions.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs hover:border-indigo-500/30 hover:text-white transition-colors cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Question-style suggestions */}
        {hasQuestions && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={14} className="text-blue-400" />
              <span className="text-slate-300 text-sm font-medium">
                Questions People Ask
              </span>
            </div>
            <ul className="space-y-2">
              {data.questions.map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5 shrink-0 text-xs">?</span>
                  <span className="text-slate-300 text-sm leading-relaxed">
                    {q}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
