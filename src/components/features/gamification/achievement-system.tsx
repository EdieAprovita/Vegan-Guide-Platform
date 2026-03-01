"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Heart, ChefHat, MapPin, Users, Award, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "community" | "restaurants" | "recipes" | "health" | "exploration";
  points: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
}

interface UserStats {
  totalPoints: number;
  level: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  streak: number;
  rank: string;
}

export function AchievementSystem() {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    streak: 0,
    rank: "Beginner",
  });

  const loadAchievements = useCallback(async () => {
    try {
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: "1",
          title: "First Steps",
          description: "Complete your profile",
          icon: "👤",
          category: "community",
          points: 10,
          isUnlocked: true,
          progress: 1,
          maxProgress: 1,
          unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
        {
          id: "2",
          title: "Recipe Explorer",
          description: "Try 5 different recipes",
          icon: "🍽️",
          category: "recipes",
          points: 25,
          isUnlocked: false,
          progress: 3,
          maxProgress: 5,
        },
        {
          id: "3",
          title: "Restaurant Hunter",
          description: "Visit 10 vegan restaurants",
          icon: "🏪",
          category: "restaurants",
          points: 50,
          isUnlocked: false,
          progress: 7,
          maxProgress: 10,
        },
        {
          id: "4",
          title: "Community Builder",
          description: "Make 20 posts in the community",
          icon: "💬",
          category: "community",
          points: 30,
          isUnlocked: false,
          progress: 15,
          maxProgress: 20,
        },
        {
          id: "5",
          title: "Health Advocate",
          description: "Consult with 3 vegan doctors",
          icon: "👨‍⚕️",
          category: "health",
          points: 40,
          isUnlocked: false,
          progress: 1,
          maxProgress: 3,
        },
        {
          id: "6",
          title: "Map Explorer",
          description: "Discover 15 locations on the map",
          icon: "🗺️",
          category: "exploration",
          points: 35,
          isUnlocked: false,
          progress: 8,
          maxProgress: 15,
        },
        {
          id: "7",
          title: "Review Master",
          description: "Write 10 reviews",
          icon: "⭐",
          category: "community",
          points: 20,
          isUnlocked: false,
          progress: 6,
          maxProgress: 10,
        },
        {
          id: "8",
          title: "Streak Champion",
          description: "Maintain a 7-day login streak",
          icon: "🔥",
          category: "community",
          points: 15,
          isUnlocked: false,
          progress: 5,
          maxProgress: 7,
        },
      ];

      setAchievements(mockAchievements);

      // Calculate user stats
      const unlockedCount = mockAchievements.filter((a) => a.isUnlocked).length;
      const totalPoints = mockAchievements
        .filter((a) => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0);

      const level = Math.floor(totalPoints / 100) + 1;
      const rank = getRank(level);

      setUserStats({
        totalPoints,
        level,
        achievementsUnlocked: unlockedCount,
        totalAchievements: mockAchievements.length,
        streak: 5,
        rank,
      });
    } catch {
      toast.error("Failed to load achievements");
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user, loadAchievements]);

  const getRank = (level: number): string => {
    if (level >= 20) return "Vegan Master";
    if (level >= 15) return "Vegan Expert";
    if (level >= 10) return "Vegan Enthusiast";
    if (level >= 5) return "Vegan Explorer";
    return "Vegan Beginner";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "community":
        return <Users className="h-4 w-4" />;
      case "restaurants":
        return <ChefHat className="h-4 w-4" />;
      case "recipes":
        return <Star className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "exploration":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "community":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
      case "restaurants":
        return "bg-primary/10 text-primary";
      case "recipes":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "health":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "exploration":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredAchievements = (category: string) => {
    if (category === "all") return achievements;
    return achievements.filter((a) => a.category === category);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <Trophy className="text-muted-foreground/60 mx-auto mb-4 h-16 w-16" />
          <h2 className="text-foreground mb-2 text-2xl font-bold">Sign in to view achievements</h2>
          <p className="text-muted-foreground">Please sign in to access your achievements and progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Achievements & Progress</h1>
          <p className="text-muted-foreground">Track your vegan journey and unlock amazing achievements</p>
        </div>

        {/* User Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-primary mb-2 text-3xl font-bold">{userStats.level}</div>
              <div className="text-muted-foreground text-sm">Level</div>
              <div className="text-muted-foreground/60 mt-1 text-xs">{userStats.rank}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-blue-600">{userStats.totalPoints}</div>
              <div className="text-muted-foreground text-sm">Total Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-purple-600">
                {userStats.achievementsUnlocked}/{userStats.totalAchievements}
              </div>
              <div className="text-muted-foreground text-sm">Achievements</div>
              <Progress
                value={(userStats.achievementsUnlocked / userStats.totalAchievements) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-3xl font-bold text-orange-600">{userStats.streak}</div>
              <div className="text-muted-foreground text-sm">Day Streak</div>
              <div className="text-muted-foreground/60 mt-1 text-xs">🔥 Keep it up!</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="exploration">Exploration</TabsTrigger>
          </TabsList>

          {["all", "community", "restaurants", "recipes", "health", "exploration"].map(
            (category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAchievements(category).map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`transition-all duration-300 ${
                        achievement.isUnlocked
                          ? "border-primary/20 bg-primary/5"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="text-foreground font-semibold">{achievement.title}</h3>
                              {achievement.isUnlocked && (
                                <Badge variant="default" className="bg-primary/10 text-primary">
                                  Unlocked
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3 text-sm">{achievement.description}</p>

                            <div className="mb-3 flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className={getCategoryColor(achievement.category)}
                              >
                                {getCategoryIcon(achievement.category)}
                                <span className="ml-1 capitalize">{achievement.category}</span>
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {achievement.points} pts
                                </span>
                              </div>
                            </div>

                            {!achievement.isUnlocked && (
                              <div className="space-y-2">
                                <div className="text-muted-foreground/60 flex justify-between text-xs">
                                  <span>Progress</span>
                                  <span>
                                    {achievement.progress}/{achievement.maxProgress}
                                  </span>
                                </div>
                                <Progress
                                  value={(achievement.progress / achievement.maxProgress) * 100}
                                  className="h-2"
                                />
                              </div>
                            )}

                            {achievement.isUnlocked && achievement.unlockedAt && (
                              <div className="text-muted-foreground/60 mt-2 text-xs">
                                Unlocked {achievement.unlockedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )
          )}
        </Tabs>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-primary/5 flex items-center gap-3 rounded-lg p-3">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="text-foreground text-sm font-medium">Achievement Unlocked!</p>
                  <p className="text-muted-foreground text-xs">First Steps - Complete your profile</p>
                </div>
                <div className="text-muted-foreground/60 ml-auto text-xs">
                  {new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/40">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="text-foreground text-sm font-medium">Level Up!</p>
                  <p className="text-muted-foreground text-xs">You reached Level 2</p>
                </div>
                <div className="text-muted-foreground/60 ml-auto text-xs">
                  {new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
