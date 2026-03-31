import { NextRequest, NextResponse } from "next/server";

async function fetchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data[1] || []) as string[];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ error: "Keyword required" }, { status: 400 });
  }

  // Fetch base suggestions + question-style suggestions in parallel
  const suffixes = ["", "how to", "what is", "why", "best", "vs"];
  const results = await Promise.allSettled(
    suffixes.map((suffix) =>
      fetchSuggestions(suffix ? `${keyword} ${suffix}` : keyword)
    )
  );

  const suggestions: string[] = [];
  const questions: string[] = [];
  const seen = new Set<string>();

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      for (const s of result.value) {
        const lower = s.toLowerCase();
        if (seen.has(lower) || lower === keyword.toLowerCase()) continue;
        seen.add(lower);

        // Question-style suffixes go to questions array
        if (index >= 1 && index <= 3) {
          questions.push(s);
        } else {
          suggestions.push(s);
        }
      }
    }
  });

  return NextResponse.json({
    suggestions: suggestions.slice(0, 15),
    questions: questions.slice(0, 10),
  });
}
