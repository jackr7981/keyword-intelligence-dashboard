import { NextRequest, NextResponse } from "next/server";

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  if (!keyword) {
    return NextResponse.json({ error: "Keyword required" }, { status: 400 });
  }

  const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;

  // If Google Ads API is not configured, return gracefully
  if (!devToken || !customerId) {
    return NextResponse.json({
      isConfigured: false,
      primaryMetrics: null,
      relatedKeywords: [],
    });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({
      isConfigured: false,
      primaryMetrics: null,
      relatedKeywords: [],
      error: "Failed to authenticate with Google Ads. Check your OAuth credentials.",
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": devToken,
    "Content-Type": "application/json",
  };

  // If using a manager account (MCC), include the login-customer-id
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }

  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v18/customers/${customerId}:generateKeywordIdeas`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          language: "languageConstants/1000", // English
          geoTargetConstants: ["geoTargetConstants/2840"], // United States
          keywordSeed: { keywords: [keyword] },
          keywordPlanNetwork: "GOOGLE_SEARCH",
          includeAdultKeywords: false,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Google Ads API error:", JSON.stringify(errorBody, null, 2));
      return NextResponse.json({
        isConfigured: true,
        primaryMetrics: null,
        relatedKeywords: [],
        error: errorBody.error?.message || `Google Ads API error (${response.status})`,
      });
    }

    const data = await response.json();
    const results = data.results || [];

    const keywords = results.map(
      (r: {
        text: string;
        keywordIdeaMetrics?: {
          avgMonthlySearches?: string;
          competition?: string;
          competitionIndex?: string;
          lowTopOfPageBidMicros?: string;
          highTopOfPageBidMicros?: string;
        };
      }) => ({
        keyword: r.text,
        avgMonthlySearches: parseInt(r.keywordIdeaMetrics?.avgMonthlySearches || "0"),
        competition: r.keywordIdeaMetrics?.competition || "UNSPECIFIED",
        competitionIndex: parseInt(r.keywordIdeaMetrics?.competitionIndex || "0"),
        lowBidMicros: parseInt(r.keywordIdeaMetrics?.lowTopOfPageBidMicros || "0"),
        highBidMicros: parseInt(r.keywordIdeaMetrics?.highTopOfPageBidMicros || "0"),
      })
    );

    // Find the primary keyword match
    const primary =
      keywords.find(
        (k: { keyword: string }) =>
          k.keyword.toLowerCase() === keyword.toLowerCase()
      ) ||
      keywords[0] ||
      null;

    // Rest are related keywords, sorted by volume
    const related = keywords
      .filter((k: { keyword: string }) => k !== primary)
      .sort(
        (a: { avgMonthlySearches: number }, b: { avgMonthlySearches: number }) =>
          b.avgMonthlySearches - a.avgMonthlySearches
      )
      .slice(0, 20);

    return NextResponse.json({
      isConfigured: true,
      primaryMetrics: primary,
      relatedKeywords: related,
    });
  } catch (error) {
    console.error("Keyword API error:", error);
    return NextResponse.json({
      isConfigured: true,
      primaryMetrics: null,
      relatedKeywords: [],
      error: "Failed to fetch keyword data",
    });
  }
}
