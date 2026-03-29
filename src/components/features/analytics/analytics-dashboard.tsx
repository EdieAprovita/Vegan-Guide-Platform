"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ErrorFallback } from "@/components/ui/error-fallback";
import {
  Users,
  Heart,
  MessageSquare,
  ChefHat,
  Star,
  Calendar,
  BarChart3,
  Activity,
  Share2,
  Bookmark,
  Store,
  Stethoscope,
  ShoppingBag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAnalytics } from "@/hooks/useAnalytics";

/** Format a number with locale separators or return a fallback string when zero. */
function fmt(n: number, fallback = "--"): string {
  return n > 0 ? n.toLocaleString() : fallback;
}

/** Return a 0-100 progress value given a partial count and a total. */
function toProgress(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(Math.min(100, (part / total) * 100));
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8" aria-busy="true" aria-label="Loading analytics">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-1.5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Engagement row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <Skeleton className="mx-auto mb-2 h-8 w-8 rounded-full" />
                <Skeleton className="mx-auto h-8 w-16" />
                <Skeleton className="mx-auto mt-1 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnalyticsDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [timeRange, setTimeRange] = useState("30d");
  const { data, isLoading, error, refetch } = useAnalytics(timeRange);

  // Admin-only guard
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-400" aria-hidden="true" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access analytics.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorFallback
          title="Could not load analytics"
          description={error ?? "An unexpected error occurred while loading analytics data."}
          icon={BarChart3}
          reset={refetch}
        />
      </div>
    );
  }

  // Derive max for normalising progress bars
  const resourceMax = Math.max(
    data.overview.totalRestaurants,
    data.overview.totalDoctors,
    data.overview.totalMarkets,
    data.overview.totalBusinesses,
    1,
  );

  const activityMax = Math.max(
    data.userActivity.monthlyActive,
    1,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                className="border-input focus:ring-ring w-36 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                aria-label="Select time range"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <Button variant="outline" onClick={refetch} aria-label="Refresh analytics">
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Overview — user + content counts                                     */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="overview-heading" className="mb-8">
          <h2 id="overview-heading" className="sr-only">Overview metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={fmt(data.overview.totalUsers)}
              trend={data.trends.userGrowth || null}
              icon={Users}
              progress={
                data.overview.totalUsers > 0
                  ? toProgress(data.overview.activeUsers, data.overview.totalUsers)
                  : undefined
              }
            />

            <StatCard
              label="Active Users"
              value={fmt(data.overview.activeUsers)}
              icon={Activity}
              progress={
                data.userActivity.monthlyActive > 0
                  ? toProgress(data.userActivity.dailyActive, activityMax)
                  : undefined
              }
            />

            <StatCard
              label="Total Posts"
              value={fmt(data.overview.totalPosts)}
              trend={data.trends.postGrowth || null}
              icon={MessageSquare}
            />

            <StatCard
              label="Total Reviews"
              value={fmt(data.overview.totalReviews)}
              trend={data.trends.reviewGrowth || null}
              icon={Star}
            />
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Resource counts — restaurants, doctors, markets, businesses          */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="resources-heading" className="mb-8">
          <h2 id="resources-heading" className="mb-4 text-lg font-semibold text-gray-800">
            Platform Resources
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
                <ChefHat className="text-muted-foreground h-4 w-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{fmt(data.overview.totalRestaurants)}</p>
                <ProgressBar
                  value={toProgress(data.overview.totalRestaurants, resourceMax)}
                  label="Restaurants relative to largest category"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                <Stethoscope className="text-muted-foreground h-4 w-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{fmt(data.overview.totalDoctors)}</p>
                <ProgressBar
                  value={toProgress(data.overview.totalDoctors, resourceMax)}
                  label="Doctors relative to largest category"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Markets</CardTitle>
                <ShoppingBag className="text-muted-foreground h-4 w-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{fmt(data.overview.totalMarkets)}</p>
                <ProgressBar
                  value={toProgress(data.overview.totalMarkets, resourceMax)}
                  label="Markets relative to largest category"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Businesses</CardTitle>
                <Store className="text-muted-foreground h-4 w-4" aria-hidden="true" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{fmt(data.overview.totalBusinesses)}</p>
                <ProgressBar
                  value={toProgress(data.overview.totalBusinesses, resourceMax)}
                  label="Businesses relative to largest category"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Engagement stats                                                      */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="engagement-heading" className="mb-8">
          <h2 id="engagement-heading" className="mb-4 text-lg font-semibold text-gray-800">
            Engagement
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="mx-auto mb-2 h-8 w-8 text-red-500" aria-hidden="true" />
                <p className="text-2xl font-bold">{fmt(data.engagement.totalLikes)}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-blue-500" aria-hidden="true" />
                <p className="text-2xl font-bold">{fmt(data.engagement.totalComments)}</p>
                <p className="text-sm text-gray-600">Total Comments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Share2 className="mx-auto mb-2 h-8 w-8 text-green-500" aria-hidden="true" />
                <p className="text-2xl font-bold">{fmt(data.engagement.totalShares)}</p>
                <p className="text-sm text-gray-600">Total Shares</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Bookmark className="mx-auto mb-2 h-8 w-8 text-yellow-500" aria-hidden="true" />
                <p className="text-2xl font-bold">{fmt(data.engagement.totalSaves)}</p>
                <p className="text-sm text-gray-600">Total Saves</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* User activity breakdown                                               */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="activity-heading" className="mb-8">
          <h2 id="activity-heading" className="mb-4 text-lg font-semibold text-gray-800">
            User Activity
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Daily Active",
                value: fmt(data.userActivity.dailyActive),
                progress: toProgress(data.userActivity.dailyActive, activityMax),
              },
              {
                label: "Weekly Active",
                value: fmt(data.userActivity.weeklyActive),
                progress: toProgress(data.userActivity.weeklyActive, activityMax),
              },
              {
                label: "Monthly Active",
                value: fmt(data.userActivity.monthlyActive),
                progress: 100,
              },
              {
                label: "Retention Rate",
                value:
                  data.userActivity.retentionRate > 0
                    ? `${data.userActivity.retentionRate.toFixed(1)}%`
                    : "--",
                progress: data.userActivity.retentionRate,
              },
            ].map(({ label, value, progress }) => (
              <Card key={label}>
                <CardContent className="p-6">
                  <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
                  <p className="mb-2 text-2xl font-bold">{value}</p>
                  <ProgressBar value={progress} label={label} barClassName="bg-emerald-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Top content lists                                                     */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="top-content-heading">
          <h2 id="top-content-heading" className="sr-only">Top content</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  Top Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topContent.posts.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No post data available for this period.
                  </p>
                ) : (
                  <ul className="space-y-3" aria-label="Top posts list">
                    {data.topContent.posts.map((post, index) => (
                      <li
                        key={post.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{post.title}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            <span aria-label={`${post.likes} likes`}>
                              <Heart className="mr-0.5 inline h-3 w-3 text-red-400" />
                              {post.likes.toLocaleString()}
                            </span>
                            <span aria-label={`${post.comments} comments`}>
                              <MessageSquare className="mr-0.5 inline h-3 w-3 text-blue-400" />
                              {post.comments.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          #{index + 1}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Top restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" aria-hidden="true" />
                  Top Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topContent.restaurants.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No restaurant data available for this period.
                  </p>
                ) : (
                  <ul className="space-y-3" aria-label="Top restaurants list">
                    {data.topContent.restaurants.map((restaurant, index) => (
                      <li
                        key={restaurant.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{restaurant.name}</p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                            <span aria-label={`Rating: ${restaurant.rating}`}>
                              <Star className="mr-0.5 inline h-3 w-3 text-yellow-400" />
                              {restaurant.rating.toFixed(1)}
                            </span>
                            <span aria-label={`${restaurant.views} views`}>
                              {restaurant.views.toLocaleString()} views
                            </span>
                          </div>
                          {/* Mini rating bar */}
                          <ProgressBar
                            value={toProgress(restaurant.rating, 5)}
                            label={`${restaurant.name} rating`}
                            className="mt-1.5"
                            barClassName="bg-yellow-400"
                          />
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0">
                          #{index + 1}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
