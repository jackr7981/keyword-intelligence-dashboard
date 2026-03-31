export interface TrendDataPoint {
  time: string;
  formattedTime: string;
  value: number;
}

export interface RelatedQuery {
  query: string;
  value: number;
  formattedValue: string;
}

export interface RegionalInterestData {
  geoCode: string;
  geoName: string;
  value: number;
}

export interface TrendsResponse {
  keyword: string;
  interestOverTime: TrendDataPoint[];
  topQueries: RelatedQuery[];
  risingQueries: RelatedQuery[];
  topRegions: RegionalInterestData[];
}

export interface RedditPost {
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
}

export interface RedditResponse {
  posts: RedditPost[];
  total: number;
}

export interface AnalysisResult {
  summary: string;
  trendPattern: string;
  searchIntent: string[];
  contentAngles: string[];
  opportunities: string[];
  risks: string[];
}
