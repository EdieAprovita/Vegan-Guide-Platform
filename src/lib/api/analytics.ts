import { API_CONFIG, getApiHeaders } from "./config";

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalReviews: number;
  totalRestaurants: number;
  totalDoctors: number;
  totalMarkets: number;
  totalBusinesses: number;
}

export interface AnalyticsTrends {
  userGrowth: number;
  postGrowth: number;
  reviewGrowth: number;
  engagementGrowth: number;
}

export interface TopContent {
  posts: Array<{ id: string; title: string; likes: number; comments: number }>;
  restaurants: Array<{ id: string; name: string; rating: number; views: number }>;
}

export interface UserActivity {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
  retentionRate: number;
}

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: AnalyticsTrends;
  topContent: TopContent;
  userActivity: UserActivity;
  engagement: EngagementMetrics;
}

// Shape of each paginated/list backend response used by aggregation
interface CountableResponse {
  total?: number;
  count?: number;
  data?: unknown[];
}

/**
 * Fetch analytics from the dedicated endpoint.
 * Falls back to `getAggregatedAnalytics` when the endpoint is unavailable.
 */
export async function getAnalytics(
  timeRange: string = "30d",
  token?: string,
): Promise<AnalyticsData> {
  try {
    const headers = token ? getApiHeaders(token) : {};
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics?timeRange=${timeRange}`,
      {
        headers,
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }

    const data = (await response.json()) as { data?: AnalyticsData } & AnalyticsData;
    return data.data ?? data;
  } catch (error) {
    console.warn("Analytics API unavailable, falling back to aggregated data:", error);
    return getAggregatedAnalytics(token);
  }
}

/**
 * Build an `AnalyticsData` object by querying each resource endpoint in
 * parallel with `limit=1` to obtain total-count metadata.
 * Fields that cannot be derived from public endpoints are returned as 0.
 */
async function getAggregatedAnalytics(token?: string): Promise<AnalyticsData> {
  const headers = token ? getApiHeaders(token) : {};
  const fetchOpts: RequestInit = { headers, credentials: "include" };

  const [restaurants, recipes, doctors, markets, businesses] = await Promise.allSettled([
    fetch(`${API_CONFIG.BASE_URL}/restaurants?limit=1`, fetchOpts).then((r) =>
      r.json() as Promise<CountableResponse>,
    ),
    fetch(`${API_CONFIG.BASE_URL}/recipes?limit=1`, fetchOpts).then((r) =>
      r.json() as Promise<CountableResponse>,
    ),
    fetch(`${API_CONFIG.BASE_URL}/doctors?limit=1`, fetchOpts).then((r) =>
      r.json() as Promise<CountableResponse>,
    ),
    fetch(`${API_CONFIG.BASE_URL}/markets?limit=1`, fetchOpts).then((r) =>
      r.json() as Promise<CountableResponse>,
    ),
    fetch(`${API_CONFIG.BASE_URL}/businesses?limit=1`, fetchOpts).then((r) =>
      r.json() as Promise<CountableResponse>,
    ),
  ]);

  const getCount = (result: PromiseSettledResult<CountableResponse>): number => {
    if (result.status === "fulfilled") {
      const d = result.value;
      return d.total ?? d.count ?? d.data?.length ?? 0;
    }
    return 0;
  };

  return {
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: getCount(recipes),
      totalReviews: 0,
      totalRestaurants: getCount(restaurants),
      totalDoctors: getCount(doctors),
      totalMarkets: getCount(markets),
      totalBusinesses: getCount(businesses),
    },
    trends: {
      userGrowth: 0,
      postGrowth: 0,
      reviewGrowth: 0,
      engagementGrowth: 0,
    },
    topContent: {
      posts: [],
      restaurants: [],
    },
    userActivity: {
      dailyActive: 0,
      weeklyActive: 0,
      monthlyActive: 0,
      retentionRate: 0,
    },
    engagement: {
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
    },
  };
}
