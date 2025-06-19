"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Heart, 
  Star, 
  MapPin, 
  ChefHat, 
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  type: "restaurant" | "recipe" | "doctor" | "market" | "post";
  title: string;
  description: string;
  image?: string;
  rating?: number;
  distance?: number;
  matchScore: number;
  reason: string;
  tags: string[];
}

interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  priceRange: string;
  location: string;
  healthGoals: string[];
  activityLevel: string;
}

export function RecommendationEngine() {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    dietaryRestrictions: ["vegan"],
    favoriteCuisines: ["italian", "asian", "mediterranean"],
    priceRange: "medium",
    location: "New York",
    healthGoals: ["weight-loss", "energy"],
    activityLevel: "moderate",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, userPreferences]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Mock recommendations based on user preferences
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          type: "restaurant",
          title: "Green Garden",
          description: "Organic vegan restaurant with farm-to-table ingredients",
          image: "/restaurants/green-garden.jpg",
          rating: 4.8,
          distance: 0.5,
          matchScore: 95,
          reason: "Matches your preference for organic food and Italian cuisine",
          tags: ["organic", "italian", "farm-to-table"],
        },
        {
          id: "2",
          type: "recipe",
          title: "Quinoa Buddha Bowl",
          description: "Nutritious bowl with quinoa, roasted vegetables, and tahini dressing",
          image: "/recipes/buddha-bowl.jpg",
          matchScore: 92,
          reason: "Perfect for your weight-loss goals and energy needs",
          tags: ["quinoa", "vegetables", "protein", "healthy"],
        },
        {
          id: "3",
          type: "doctor",
          title: "Dr. Sarah Johnson",
          description: "Plant-based nutritionist specializing in vegan diets",
          image: "/doctors/dr-johnson.jpg",
          rating: 4.9,
          distance: 2.1,
          matchScore: 88,
          reason: "Expert in vegan nutrition and weight management",
          tags: ["nutrition", "vegan", "weight-loss"],
        },
        {
          id: "4",
          type: "market",
          title: "Fresh Farmers Market",
          description: "Local farmers market with organic produce",
          image: "/markets/farmers-market.jpg",
          distance: 1.2,
          matchScore: 85,
          reason: "Great for finding fresh, organic ingredients",
          tags: ["organic", "local", "fresh"],
        },
        {
          id: "5",
          type: "post",
          title: "My 30-Day Vegan Challenge Results",
          description: "Personal journey and tips for transitioning to veganism",
          image: "/posts/vegan-challenge.jpg",
          matchScore: 82,
          reason: "Inspiring content from someone with similar goals",
          tags: ["journey", "tips", "motivation"],
        },
        {
          id: "6",
          type: "restaurant",
          title: "Zen Sushi",
          description: "Vegan sushi restaurant with creative plant-based rolls",
          image: "/restaurants/zen-sushi.jpg",
          rating: 4.6,
          distance: 1.8,
          matchScore: 80,
          reason: "Asian cuisine you love, completely vegan",
          tags: ["sushi", "asian", "creative"],
        },
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (recommendationId: string, isPositive: boolean) => {
    toast.success(
      isPositive 
        ? "Thanks for the feedback! We'll show you more like this." 
        : "Thanks for the feedback! We'll improve our recommendations."
    );
    
    // In a real app, this would send feedback to the backend
    console.log(`Feedback for ${recommendationId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <ChefHat className="h-4 w-4" />;
      case "recipe":
        return <Star className="h-4 w-4" />;
      case "doctor":
        return <Users className="h-4 w-4" />;
      case "market":
        return <MapPin className="h-4 w-4" />;
      case "post":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "restaurant":
        return "bg-green-100 text-green-800";
      case "recipe":
        return "bg-yellow-100 text-yellow-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "market":
        return "bg-purple-100 text-purple-800";
      case "post":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-gray-600";
  };

  const filteredRecommendations = (type: string) => {
    if (type === "all") return recommendations;
    return recommendations.filter(r => r.type === type);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in for personalized recommendations</h2>
          <p className="text-gray-600">We'll learn your preferences and suggest the best vegan options for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Personalized Recommendations
            </h1>
          </div>
          <p className="text-gray-600">
            Discover the best vegan options tailored to your preferences and goals
          </p>
        </div>

        {/* User Preferences Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userPreferences.dietaryRestrictions.map((restriction) => (
                <Badge key={restriction} variant="outline" className="capitalize">
                  {restriction}
                </Badge>
              ))}
              {userPreferences.favoriteCuisines.map((cuisine) => (
                <Badge key={cuisine} variant="outline" className="capitalize">
                  {cuisine}
                </Badge>
              ))}
              {userPreferences.healthGoals.map((goal) => (
                <Badge key={goal} variant="outline" className="capitalize">
                  {goal.replace("-", " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="restaurant">
              <ChefHat className="h-4 w-4 mr-2" />
              Restaurants ({recommendations.filter(r => r.type === "restaurant").length})
            </TabsTrigger>
            <TabsTrigger value="recipe">
              <Star className="h-4 w-4 mr-2" />
              Recipes ({recommendations.filter(r => r.type === "recipe").length})
            </TabsTrigger>
            <TabsTrigger value="doctor">
              <Users className="h-4 w-4 mr-2" />
              Doctors ({recommendations.filter(r => r.type === "doctor").length})
            </TabsTrigger>
            <TabsTrigger value="market">
              <MapPin className="h-4 w-4 mr-2" />
              Markets ({recommendations.filter(r => r.type === "market").length})
            </TabsTrigger>
            <TabsTrigger value="post">
              <TrendingUp className="h-4 w-4 mr-2" />
              Posts ({recommendations.filter(r => r.type === "post").length})
            </TabsTrigger>
          </TabsList>

          {["all", "restaurant", "recipe", "doctor", "market", "post"].map((type) => (
            <TabsContent key={type} value={type}>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Finding the perfect recommendations for you...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecommendations(type).map((recommendation) => (
                    <Card key={recommendation.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getTypeColor(recommendation.type)}>
                              {getTypeIcon(recommendation.type)}
                              <span className="ml-1 capitalize">{recommendation.type}</span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getMatchScoreColor(recommendation.matchScore)}`}>
                              {recommendation.matchScore}%
                            </div>
                            <div className="text-xs text-gray-500">Match</div>
                          </div>
                        </div>
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">{recommendation.description}</p>
                        
                        <div className="text-xs text-gray-500">
                          <p className="font-medium mb-1">Why we recommend this:</p>
                          <p>{recommendation.reason}</p>
                        </div>

                        {recommendation.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{recommendation.rating}</span>
                          </div>
                        )}

                        {recommendation.distance && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{recommendation.distance} miles away</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {recommendation.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <Button size="sm" className="flex-1 mr-2">
                            View Details
                          </Button>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(recommendation.id, true)}
                              className="h-8 w-8 p-0"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(recommendation.id, false)}
                              className="h-8 w-8 p-0"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Improve Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Improve Your Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Help us provide better recommendations by updating your preferences and providing feedback.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                Update Preferences
              </Button>
              <Button variant="outline">
                View History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 