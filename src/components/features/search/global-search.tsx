"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, MapPin, ChefHat, Store, Heart, User, Star } from "lucide-react";
import { getRestaurants } from "@/lib/api/restaurants";
import { getRecipes } from "@/lib/api/recipes";
import { getDoctors } from "@/lib/api/doctors";
import { getMarkets } from "@/lib/api/markets";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  type: "restaurant" | "recipe" | "doctor" | "market" | "business" | "sanctuary";
  title: string;
  description: string;
  rating?: number;
  location?: string;
  tags?: string[];
  url: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const searchAll = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const allResults: SearchResult[] = [];

      // Search restaurants
      try {
        const restaurants = await getRestaurants({ search: searchQuery, limit: 5 });
        const restaurantResults = (restaurants.restaurants || restaurants).map((restaurant: any) => ({
          id: restaurant._id,
          type: "restaurant" as const,
          title: restaurant.restaurantName,
          description: restaurant.address,
          rating: restaurant.rating,
          location: restaurant.address,
          tags: restaurant.cuisine,
          url: `/restaurants/${restaurant._id}`,
        }));
        allResults.push(...restaurantResults);
      } catch (error) {
        console.error("Error searching restaurants:", error);
      }

      // Search recipes
      try {
        const recipes = await getRecipes({ search: searchQuery, limit: 5 });
        const recipeResults = (recipes.recipes || recipes).map((recipe: any) => ({
          id: recipe._id,
          type: "recipe" as const,
          title: recipe.title,
          description: recipe.description,
          rating: recipe.averageRating,
          tags: recipe.categories,
          url: `/recipes/${recipe._id}`,
        }));
        allResults.push(...recipeResults);
      } catch (error) {
        console.error("Error searching recipes:", error);
      }

      // Search doctors
      try {
        const doctors = await getDoctors({ search: searchQuery, limit: 5 });
        const doctorResults = (doctors.doctors || doctors).map((doctor: any) => ({
          id: doctor._id,
          type: "doctor" as const,
          title: `Dr. ${doctor.name}`,
          description: doctor.specialty,
          rating: doctor.rating,
          location: doctor.address,
          tags: doctor.languages,
          url: `/doctors/${doctor._id}`,
        }));
        allResults.push(...doctorResults);
      } catch (error) {
        console.error("Error searching doctors:", error);
      }

      // Search markets
      try {
        const markets = await getMarkets({ search: searchQuery, limit: 5 });
        const marketResults = (markets.markets || markets).map((market: any) => ({
          id: market._id,
          type: "market" as const,
          title: market.marketName,
          description: market.address,
          rating: market.rating,
          location: market.address,
          tags: market.products,
          url: `/markets/${market._id}`,
        }));
        allResults.push(...marketResults);
      } catch (error) {
        console.error("Error searching markets:", error);
      }

      // Sort results by rating (highest first)
      allResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchAll(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <ChefHat className="h-4 w-4" />;
      case "recipe":
        return <ChefHat className="h-4 w-4" />;
      case "doctor":
        return <User className="h-4 w-4" />;
      case "market":
        return <Store className="h-4 w-4" />;
      case "business":
        return <Store className="h-4 w-4" />;
      case "sanctuary":
        return <Heart className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "restaurant":
        return "Restaurant";
      case "recipe":
        return "Recipe";
      case "doctor":
        return "Doctor";
      case "market":
        return "Market";
      case "business":
        return "Business";
      case "sanctuary":
        return "Sanctuary";
      default:
        return type;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search restaurants, recipes, doctors, markets..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              className="pl-10 pr-4 w-full md:w-96"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(result.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{result.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {result.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{result.location}</span>
                            </div>
                          )}
                        </div>
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : query.trim() ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse our categories.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-600">
                  Search for restaurants, recipes, doctors, and markets.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 