"use client";

import { useState } from "react";
import KeywordInput from "@/components/KeywordInput";
import TrendsChart from "@/components/TrendsChart";
import RelatedQueries from "@/components/RelatedQueries";
import RegionalInterest from "@/components/RegionalInterest";
import RedditSignals from "@/components/RedditSignals";
import AnalysisPanel from "@/components/AnalysisPanel";
import { TrendsResponse, RedditResponse, AnalysisResult } from "@/lib/types";
import { BarChart2, Zap, Search } from "lucide-react";

function SkeletonCard({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse ${height}`}
    >
      <div className="h-5 bg-slate-700 rounded w-48 mb-4" />
      <div className="h-full bg-slate-700/50 rounded" />
    </div>
  );
}

export default function Home() {
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [redditData, setRedditData] = useState<RedditResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [isLoadingReddit, setIsLoadingReddit] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const handleAnalyze = async (keywords: string[], timeframe: string) => {
    const primary = keywords[0];
    setCurrentKeyword(primary);
    setError(null);
    setTrendsData(null);
    setRedditData(null);
    setAnalysisData(null);
    setIsLoadingTrends(true);
    setIsLoadingReddit(true);

    try {
      const [trendsRes, redditRes] = await Promise.allSettled([
        fetch(
          `/api/trends?keyword=${encodeURIComponent(primary)}&timeframe=${timeframe}`
        ).then((r) => r.json()),
        fetch(`/api/reddit?keyword=${encodeURIComponent(primary)}`).then((r) =>
          r.json()
        ),
      ]);

      const trends =
        trendsRes.status === "fulfilled" && !trendsRes.value.error
          ? trendsRes.value
          : null;
      const reddit =
        redditRes.status === "fulfilled" && !redditRes.value.error
          ? redditRes.value
          : null;

      setTrendsData(trends);
      setRedditData(reddit);
      setIsLoadingTrends(false);
      setIsLoadingReddit(false);

      setIsLoadingAnalysis(true);
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: primary, trendsData: trends, redditData: reddit }),
      });
      const analysisResult = await analyzeRes.json();

      if (analysisResult.error) {
        setError(analysisResult.error);
      } else {
        setAnalysisData(analysisResult);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoadingTrends(false);
      setIsLoadingReddit(false);
      setIsLoadingAnalysis(false);
    }
  };

  const isLoading = isLoadingTrends || isLoadingReddit || isLoadingAnalysis;
  const hasData = trendsData || redditData || analysisData;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart2 size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">
                Keyword Intelligence
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Search Trend Analyzer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
            <Zap size={12} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs">
              Google Trends + Reddit + Claude Haiku
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <KeywordInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!hasData && !isLoading && !error && (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Search size={26} className="text-slate-500" />
            </div>
            <h2 className="text-slate-300 font-semibold text-xl mb-2">
              Enter a keyword to get started
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Analyze Google Trends data, Reddit discussions, and get AI-powered
              content insights for any keyword or topic.
            </p>
          </div>
        )}

        {/* Results */}
        {(hasData || isLoadingTrends || isLoadingReddit) && (
          <>
            {isLoadingTrends ? (
              <SkeletonCard height="h-80" />
            ) : (
              trendsData && (
                <TrendsChart
                  data={trendsData.interestOverTime}
                  keyword={trendsData.keyword}
                />
              )
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoadingTrends ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                trendsData && (
                  <>
                    <RelatedQueries
                      topQueries={trendsData.topQueries}
                      risingQueries={trendsData.risingQueries}
                      keyword={trendsData.keyword}
                    />
                    <RegionalInterest regions={trendsData.topRegions} />
                  </>
                )
              )}
            </div>

            {isLoadingReddit ? (
              <SkeletonCard />
            ) : (
              redditData &&
              redditData.posts?.length > 0 && (
                <RedditSignals posts={redditData.posts} />
              )
            )}

            {isLoadingAnalysis ? (
              <AnalysisPanel
                analysis={{
                  summary: "",
                  trendPattern: "",
                  searchIntent: [],
                  contentAngles: [],
                  opportunities: [],
                  risks: [],
                }}
                keyword={currentKeyword}
                isLoading
              />
            ) : (
              analysisData && (
                <AnalysisPanel
                  analysis={analysisData}
                  keyword={currentKeyword}
                />
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
