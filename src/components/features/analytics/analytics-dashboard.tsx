"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Activity
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
        <div className="max-w-4xl mx-auto text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access analytics.</p>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive insights into your platform&apos;s performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
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
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}% engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalPosts.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
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
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalReviews.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(data.trends.reviewGrowth)}
                <span className={`text-xs ${getTrendColor(data.trends.reviewGrowth)}`}>
                  {data.trends.reviewGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.engagement.likes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.engagement.comments.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.engagement.shares.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Shares</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.engagement.saves.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Saves</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{post.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
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
                  <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{restaurant.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
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