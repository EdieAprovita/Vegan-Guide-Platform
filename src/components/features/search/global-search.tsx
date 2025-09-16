"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, MapPin, ChefHat, Store, Heart, User, Star } from "lucide-react";
import { getRestaurants } from "@/lib/api/restaurants";
import { getRecipes } from "@/lib/api/recipes";
import { getDoctors } from "@/lib/api/doctors";
import { getMarkets } from "@/lib/api/markets";
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
        const restaurantResults = (restaurants.data || []).map((restaurant) => ({
          id: restaurant._id as string,
          type: "restaurant" as const,
          title: restaurant.restaurantName as string,
          description: restaurant.address as string,
          rating: restaurant.rating as number,
          location: restaurant.address as string,
          tags: restaurant.cuisine as string[],
          url: `/restaurants/${restaurant._id}`,
        }));
        allResults.push(...restaurantResults);
      } catch (error) {
        console.error("Error searching restaurants:", error);
      }

      // Search recipes
      try {
        const recipes = await getRecipes({ search: searchQuery, limit: 5 });
        const recipeResults = (recipes.data || []).map((recipe) => ({
          id: recipe._id as string,
          type: "recipe" as const,
          title: recipe.title as string,
          description: recipe.description as string,
          rating: recipe.averageRating as number,
          tags: recipe.categories as string[],
          url: `/recipes/${recipe._id}`,
        }));
        allResults.push(...recipeResults);
      } catch (error) {
        console.error("Error searching recipes:", error);
      }

      // Search doctors
      try {
        const doctors = await getDoctors({ search: searchQuery, limit: 5 });
        const doctorResults = (doctors.data || []).map((doctor) => ({
          id: doctor._id as string,
          type: "doctor" as const,
          title: `Dr. ${doctor.name as string}`,
          description: doctor.specialty as string,
          rating: doctor.rating as number,
          location: doctor.address as string,
          tags: doctor.languages as string[],
          url: `/doctors/${doctor._id}`,
        }));
        allResults.push(...doctorResults);
      } catch (error) {
        console.error("Error searching doctors:", error);
      }

      // Search markets
      try {
        const markets = await getMarkets({ search: searchQuery, limit: 5 });
        const marketResults = (markets.data || []).map((market) => ({
          id: market._id as string,
          type: "market" as const,
          title: market.marketName as string,
          description: market.address as string,
          rating: market.rating as number,
          location: market.address as string,
          tags: market.products as string[],
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
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search restaurants, recipes, doctors, markets..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              className="w-full pr-4 pl-10 md:w-96"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getTypeIcon(result.type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="truncate font-medium text-gray-900">{result.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        <p className="mb-2 line-clamp-2 text-sm text-gray-600">
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
                          <div className="mt-2 flex flex-wrap gap-1">
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
              <div className="py-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse our categories.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">Start searching</h3>
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
