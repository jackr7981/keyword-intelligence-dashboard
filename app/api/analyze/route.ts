import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { keyword, trendsData, redditData, keywordData, suggestData } = body;

  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 });
  }

  const values = trendsData?.interestOverTime?.map((d: { value: number }) => d.value) || [0];
  const maxValue = Math.max(...values);
  const currentValue = values[values.length - 1] || 0;

  const trendContext = trendsData
    ? `## Google Trends Data for "${keyword}":
- Data points: ${trendsData.interestOverTime?.length || 0} time periods analyzed
- Peak interest: ${maxValue} / 100
- Current interest: ${currentValue} / 100
- Top related queries: ${trendsData.topQueries?.slice(0, 5).map((q: { query: string }) => q.query).join(", ") || "None"}
- Rising queries: ${trendsData.risingQueries?.slice(0, 5).map((q: { query: string }) => q.query).join(", ") || "None"}
- Top regions: ${trendsData.topRegions?.slice(0, 5).map((r: { geoName: string }) => r.geoName).join(", ") || "Global"}`
    : `No Google Trends data available for "${keyword}".`;

  const redditContext =
    redditData?.posts?.length > 0
      ? `
## Reddit Discussion Data:
- Posts found: ${redditData.posts.length}
- Communities discussing this: ${[...new Set(redditData.posts.map((p: { subreddit: string }) => `r/${p.subreddit}`))].slice(0, 5).join(", ")}
- Top discussions:
${redditData.posts
  .slice(0, 5)
  .map((p: { title: string; score: number; num_comments: number }) => `  - "${p.title}" (${p.score} upvotes, ${p.num_comments} comments)`)
  .join("\n")}`
      : `No Reddit discussion data available for "${keyword}".`;

  // Google Ads Keyword Planner context
  const keywordContext =
    keywordData?.isConfigured && keywordData?.primaryMetrics
      ? `
## Google Ads Keyword Planner Data:
- Monthly search volume: ${keywordData.primaryMetrics.avgMonthlySearches.toLocaleString()}
- CPC (low bid): $${(keywordData.primaryMetrics.lowBidMicros / 1_000_000).toFixed(2)}
- CPC (high bid): $${(keywordData.primaryMetrics.highBidMicros / 1_000_000).toFixed(2)}
- Competition: ${keywordData.primaryMetrics.competition} (index: ${keywordData.primaryMetrics.competitionIndex}/100)
- Related keyword ideas: ${keywordData.relatedKeywords
          ?.slice(0, 8)
          .map((k: { keyword: string; avgMonthlySearches: number }) => `${k.keyword} (${k.avgMonthlySearches.toLocaleString()}/mo)`)
          .join(", ") || "None"}`
      : "";

  // Google Autocomplete context
  const suggestContext =
    suggestData?.suggestions?.length > 0
      ? `
## Google Autocomplete Suggestions:
- People also search: ${suggestData.suggestions.slice(0, 8).join(", ")}
- Questions people ask: ${suggestData.questions?.slice(0, 5).join(", ") || "None"}`
      : "";

  const prompt = `You are an expert SEO strategist and content intelligence analyst. Analyze the following search data for the keyword: "${keyword}"

${trendContext}
${keywordContext}
${redditContext}
${suggestContext}

Provide a structured analysis. Respond ONLY with valid JSON — no markdown, no code blocks, just raw JSON:

{
  "summary": "2-3 sentence executive summary of this keyword's landscape",
  "trendPattern": "One clear sentence describing if this keyword is growing/declining/seasonal/stable and why",
  "searchIntent": [
    "Intent 1: what searchers want",
    "Intent 2: what searchers want",
    "Intent 3: what searchers want"
  ],
  "contentAngles": [
    "Content angle 1 based on data",
    "Content angle 2 based on data",
    "Content angle 3 based on data",
    "Content angle 4 based on data"
  ],
  "opportunities": [
    "SEO/content opportunity 1",
    "SEO/content opportunity 2",
    "SEO/content opportunity 3"
  ],
  "risks": [
    "Risk or challenge 1",
    "Risk or challenge 2"
  ]
}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Keyword Intelligence Dashboard",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-5-haiku",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter error:", errorData);
      return NextResponse.json(
        { error: `OpenRouter API error: ${errorData.error?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    try {
      const analysis = JSON.parse(content);
      return NextResponse.json(analysis);
    } catch {
      return NextResponse.json({
        summary: content,
        trendPattern: "",
        searchIntent: [],
        contentAngles: [],
        opportunities: [],
        risks: [],
      });
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 });
  }
}
