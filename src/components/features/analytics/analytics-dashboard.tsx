"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageSquare,
  ChefHat,
  Star,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalReviews: number;
    totalRestaurants: number;
    totalDoctors: number;
    totalMarkets: number;
  };
  trends: {
    userGrowth: number;
    postGrowth: number;
    reviewGrowth: number;
    engagementGrowth: number;
  };
  topContent: {
    posts: Array<{
      id: string;
      title: string;
      likes: number;
      comments: number;
      views: number;
    }>;
    restaurants: Array<{
      id: string;
      name: string;
      rating: number;
      reviews: number;
      views: number;
    }>;
  };
  userActivity: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    retentionRate: number;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export function AnalyticsDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    if (user?.role === "admin") {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 1250,
          activeUsers: 890,
          totalPosts: 234,
          totalReviews: 567,
          totalRestaurants: 89,
          totalDoctors: 45,
          totalMarkets: 67,
        },
        trends: {
          userGrowth: 12.5,
          postGrowth: 8.3,
          reviewGrowth: 15.7,
          engagementGrowth: 22.1,
        },
        topContent: {
          posts: [
            {
              id: "1",
              title: "My Vegan Journey: 6 Months In",
              likes: 156,
              comments: 23,
              views: 1247,
            },
            {
              id: "2",
              title: "Best Vegan Restaurants in NYC",
              likes: 89,
              comments: 15,
              views: 892,
            },
          ],
          restaurants: [
            {
              id: "1",
              name: "Green Garden",
              rating: 4.8,
              reviews: 45,
              views: 234,
            },
            {
              id: "2",
              name: "Vegan Delight",
              rating: 4.6,
              reviews: 32,
              views: 189,
            },
          ],
        },
        userActivity: {
          dailyActive: 234,
          weeklyActive: 567,
          monthlyActive: 890,
          retentionRate: 78.5,
        },
        engagement: {
          likes: 1234,
          comments: 456,
          shares: 89,
          saves: 234,
        },
      };

      setData(mockData);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access analytics.</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive insights into your platform&apos;s performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border-input focus:ring-ring w-32 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
              <div className="mt-1 flex items-center gap-1">
                {getTrendIcon(data.trends.userGrowth)}
                <span className={`text-xs ${getTrendColor(data.trends.userGrowth)}`}>
                  {data.trends.userGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
              <p className="text-muted-foreground mt-1 text-xs">
                {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}%
                engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalPosts.toLocaleString()}</div>
              <div className="mt-1 flex items-center gap-1">
                {getTrendIcon(data.trends.postGrowth)}
                <span className={`text-xs ${getTrendColor(data.trends.postGrowth)}`}>
                  {data.trends.postGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Star className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.overview.totalReviews.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1">
                {getTrendIcon(data.trends.reviewGrowth)}
                <span className={`text-xs ${getTrendColor(data.trends.reviewGrowth)}`}>
                  {data.trends.reviewGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" />
              <div className="text-2xl font-bold">{data.engagement.likes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <div className="text-2xl font-bold">{data.engagement.comments.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <div className="text-2xl font-bold">{data.engagement.shares.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Shares</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <div className="text-2xl font-bold">{data.engagement.saves.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Saves</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Top Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topContent.posts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{post.title}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                        <span>👁️ {post.views}</span>
                      </div>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Top Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topContent.restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{restaurant.name}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>⭐ {restaurant.rating}</span>
                        <span>📝 {restaurant.reviews}</span>
                        <span>👁️ {restaurant.views}</span>
                      </div>
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
