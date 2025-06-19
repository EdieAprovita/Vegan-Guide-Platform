"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Heart, 
  ChefHat, 
  MapPin, 
  Users, 
  MessageSquare,
  Award,
  Target,
  Zap
} from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    setLoading(true);
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
      const unlockedCount = mockAchievements.filter(a => a.isUnlocked).length;
      const totalPoints = mockAchievements
        .filter(a => a.isUnlocked)
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
    } catch (error) {
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

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
        return "bg-blue-100 text-blue-800";
      case "restaurants":
        return "bg-green-100 text-green-800";
      case "recipes":
        return "bg-yellow-100 text-yellow-800";
      case "health":
        return "bg-red-100 text-red-800";
      case "exploration":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAchievements = (category: string) => {
    if (category === "all") return achievements;
    return achievements.filter(a => a.category === category);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view achievements</h2>
          <p className="text-gray-600">Please sign in to access your achievements and progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Achievements & Progress
          </h1>
          <p className="text-gray-600">
            Track your vegan journey and unlock amazing achievements
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.level}
              </div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="text-xs text-gray-500 mt-1">{userStats.rank}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userStats.achievementsUnlocked}/{userStats.totalAchievements}
              </div>
              <div className="text-sm text-gray-600">Achievements</div>
              <Progress 
                value={(userStats.achievementsUnlocked / userStats.totalAchievements) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {userStats.streak}
              </div>
              <div className="text-sm text-gray-600">Day Streak</div>
              <div className="text-xs text-gray-500 mt-1">🔥 Keep it up!</div>
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

          {["all", "community", "restaurants", "recipes", "health", "exploration"].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements(category).map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`transition-all duration-300 ${
                      achievement.isUnlocked
                        ? "border-green-200 bg-green-50/50"
                        : "hover:shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {achievement.title}
                            </h3>
                            {achievement.isUnlocked && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {achievement.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                              {getCategoryIcon(achievement.category)}
                              <span className="ml-1 capitalize">{achievement.category}</span>
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{achievement.points} pts</span>
                            </div>
                          </div>

                          {!achievement.isUnlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.maxProgress) * 100} 
                                className="h-2"
                              />
                            </div>
                          )}

                          {achievement.isUnlocked && achievement.unlockedAt && (
                            <div className="text-xs text-gray-500 mt-2">
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
          ))}
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
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="text-2xl">🎉</div>
                <div>
                  <p className="text-sm font-medium">Achievement Unlocked!</p>
                  <p className="text-xs text-gray-600">First Steps - Complete your profile</p>
                </div>
                <div className="ml-auto text-xs text-gray-500">
                  {new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl">📈</div>
                <div>
                  <p className="text-sm font-medium">Level Up!</p>
                  <p className="text-xs text-gray-600">You reached Level 2</p>
                </div>
                <div className="ml-auto text-xs text-gray-500">
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