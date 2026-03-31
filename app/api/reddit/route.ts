import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  try {
    const [relevanceResult, topResult] = await Promise.allSettled([
      fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=relevance&limit=10&type=link`,
        { headers: { "User-Agent": "KeywordIntelligenceDashboard/1.0" } }
      ).then((r) => r.json()),
      fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=month&limit=6&type=link`,
        { headers: { "User-Agent": "KeywordIntelligenceDashboard/1.0" } }
      ).then((r) => r.json()),
    ]);

    const posts: {
      id: string;
      title: string;
      subreddit: string;
      score: number;
      num_comments: number;
      url: string;
      selftext: string;
      created_utc: number;
      author: string;
      permalink: string;
    }[] = [];
    const seenIds = new Set<string>();

    const addPosts = (result: PromiseSettledResult<{ data?: { children?: { data: { id: string; title: string; subreddit: string; score: number; num_comments: number; url: string; selftext: string; created_utc: number; author: string; permalink: string } }[] } }>) => {
      if (result.status === "fulfilled") {
        const children = result.value?.data?.children || [];
        for (const child of children) {
          const post = child.data;
          if (!seenIds.has(post.id)) {
            seenIds.add(post.id);
            posts.push({
              id: post.id,
              title: post.title,
              subreddit: post.subreddit,
              score: post.score,
              num_comments: post.num_comments,
              url: post.url,
              selftext: (post.selftext || "").slice(0, 200),
              created_utc: post.created_utc,
              author: post.author,
              permalink: `https://reddit.com${post.permalink}`,
            });
          }
        }
      }
    };

    addPosts(relevanceResult);
    addPosts(topResult);

    return NextResponse.json({ posts: posts.slice(0, 12), total: posts.length });
  } catch (error) {
    console.error("Reddit API error:", error);
    return NextResponse.json({ error: "Failed to fetch Reddit data" }, { status: 500 });
  }
}
