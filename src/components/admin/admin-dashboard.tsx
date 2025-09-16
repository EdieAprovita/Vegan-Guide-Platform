"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  ChefHat,
  User,
  Store,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalDoctors: number;
  totalMarkets: number;
  totalPosts: number;
  totalReviews: number;
  recentActivity: {
    type: string;
    title: string;
    date: string;
    status: "pending" | "approved" | "rejected";
  }[];
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalDoctors: 0,
    totalMarkets: 0,
    totalPosts: 0,
    totalReviews: 0,
    recentActivity: [],
  });

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      return;
    }

    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // In a real app, you would fetch this from your API
      // For now, we'll use mock data
      const mockStats: DashboardStats = {
        totalUsers: 1250,
        totalRestaurants: 89,
        totalDoctors: 45,
        totalMarkets: 67,
        totalPosts: 234,
        totalReviews: 567,
        recentActivity: [
          {
            type: "restaurant",
            title: "New restaurant: Green Garden",
            date: "2024-01-15",
            status: "pending",
          },
          {
            type: "doctor",
            title: "New doctor: Dr. Sarah Johnson",
            date: "2024-01-14",
            status: "approved",
          },
          {
            type: "market",
            title: "New market: Organic Corner",
            date: "2024-01-13",
            status: "pending",
          },
          {
            type: "post",
            title: "New community post",
            date: "2024-01-12",
            status: "approved",
          },
        ],
      };

      setStats(mockStats);
    } catch {
      toast.error("Failed to load dashboard stats");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600">
            Pending
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <ChefHat className="h-4 w-4" />;
      case "doctor":
        return <User className="h-4 w-4" />;
      case "market":
        return <Store className="h-4 w-4" />;
      case "post":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user.username}. Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
              <ChefHat className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-muted-foreground text-xs">+5 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDoctors}</div>
              <p className="text-muted-foreground text-xs">+3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Markets</CardTitle>
              <Store className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMarkets}</div>
              <p className="text-muted-foreground text-xs">+8 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {getActivityIcon(activity.type)}
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </div>
                        </div>
                        {getStatusBadge(activity.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <ChefHat className="mb-2 h-6 w-6" />
                      <span className="text-sm">Add Restaurant</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <User className="mb-2 h-6 w-6" />
                      <span className="text-sm">Add Doctor</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Store className="mb-2 h-6 w-6" />
                      <span className="text-sm">Add Market</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <MessageSquare className="mb-2 h-6 w-6" />
                      <span className="text-sm">Moderate Posts</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Content management features will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Analytics and reporting features will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
