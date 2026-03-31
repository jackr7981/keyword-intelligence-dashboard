import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const timeframe = searchParams.get("timeframe") || "12m";

  if (!keyword) {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  const startTimeMap: Record<string, Date> = {
    "1m": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    "3m": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    "6m": new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    "12m": new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    "5y": new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
  };

  const startTime = startTimeMap[timeframe] || startTimeMap["12m"];

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleTrends = require("google-trends-api");

    const [interestResult, queriesResult, regionResult] =
      await Promise.allSettled([
        googleTrends.interestOverTime({ keyword, startTime }),
        googleTrends.relatedQueries({ keyword }),
        googleTrends.interestByRegion({ keyword }),
      ]);

    let interestOverTime: { time: string; formattedTime: string; value: number }[] = [];
    if (interestResult.status === "fulfilled") {
      const data = JSON.parse(interestResult.value);
      interestOverTime = (data?.default?.timelineData || []).map(
        (item: { time: string; formattedTime: string; value: number[] }) => ({
          time: item.time,
          formattedTime: item.formattedTime,
          value: item.value?.[0] || 0,
        })
      );
    }

    let topQueries: { query: string; value: number; formattedValue: string }[] = [];
    let risingQueries: { query: string; value: number; formattedValue: string }[] = [];
    if (queriesResult.status === "fulfilled") {
      const data = JSON.parse(queriesResult.value);
      const rankedList = data?.default?.rankedList || [];
      topQueries = (rankedList[0]?.rankedKeyword || [])
        .slice(0, 10)
        .map((item: { query: string; value: number; formattedValue: string }) => ({
          query: item.query,
          value: item.value,
          formattedValue: item.formattedValue,
        }));
      risingQueries = (rankedList[1]?.rankedKeyword || [])
        .slice(0, 10)
        .map((item: { query: string; value: number; formattedValue: string }) => ({
          query: item.query,
          value: item.value,
          formattedValue: item.formattedValue,
        }));
    }

    let topRegions: { geoCode: string; geoName: string; value: number }[] = [];
    if (regionResult.status === "fulfilled") {
      const data = JSON.parse(regionResult.value);
      topRegions = (data?.default?.geoMapData || [])
        .filter((item: { value: number[] }) => item.value?.[0] > 0)
        .slice(0, 15)
        .map((item: { geoCode: string; geoName: string; value: number[] }) => ({
          geoCode: item.geoCode,
          geoName: item.geoName,
          value: item.value?.[0] || 0,
        }));
    }

    return NextResponse.json({
      keyword,
      interestOverTime,
      topQueries,
      risingQueries,
      topRegions,
    });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends data. Google may have rate-limited the request." },
      { status: 500 }
    );
  }
}
