"use client";

import { useState, KeyboardEvent } from "react";
import { Search, X, Plus } from "lucide-react";

interface Props {
  onAnalyze: (keywords: string[], timeframe: string) => void;
  isLoading: boolean;
}

const TIMEFRAMES = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
  { label: "12M", value: "12m" },
  { label: "5Y", value: "5y" },
];

export default function KeywordInput({ onAnalyze, isLoading }: Props) {
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState("12m");

  const addKeyword = () => {
    const trimmed = input.trim();
    if (trimmed && !keywords.includes(trimmed) && keywords.length < 4) {
      setKeywords([...keywords, trimmed]);
      setInput("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleAnalyze = () => {
    const allKeywords = input.trim() ? [...keywords, input.trim()] : keywords;
    if (allKeywords.length > 0) {
      onAnalyze(allKeywords, timeframe);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex flex-col gap-4">
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-full text-sm"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a keyword or topic to analyze..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          {keywords.length < 4 && input.trim() && (
            <button
              onClick={addKeyword}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
              title="Add another keyword to compare"
            >
              <Plus size={16} />
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || (!input.trim() && keywords.length === 0)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search size={16} />
                Analyze
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Period:</span>
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <span className="text-slate-500 text-xs">
            Press Enter or comma to add multiple keywords
          </span>
        </div>
      </div>
    </div>
  );
}
