"use client";

import { useState, useEffect, useCallback } from "react";
import { Restaurant, getRestaurants } from "@/lib/api/restaurants";
import { RestaurantCard } from "./restaurant-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface SimpleRestaurantListProps {
  initialRestaurants?: Restaurant[];
  showFilters?: boolean;
  title?: string;
}

const CUISINE_OPTIONS = [
  "Vegan",
  "Vegetarian",
  "Plant-based",
  "Raw",
  "Gluten-free",
  "Organic",
  "Mediterranean",
  "Asian",
  "Mexican",
  "Italian",
  "American",
  "Other",
];

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
];

export function SimpleRestaurantList({
  initialRestaurants = [],
  showFilters = true,
  title = "Restaurants",
}: SimpleRestaurantListProps) {
  const [mounted, setMounted] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    Array.isArray(initialRestaurants) ? initialRestaurants : []
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRestaurants = useCallback(
    async (isLoadMore = false, currentPage?: number) => {
      if (!mounted) return;

      // Use the passed currentPage or calculate based on isLoadMore
      const targetPage = currentPage ?? (isLoadMore ? page + 1 : 1);

      console.log("Fetching restaurants with filters:", {
        search: search.trim(),
        cuisine: cuisineFilter,
        rating: ratingFilter ? parseInt(ratingFilter) : undefined,
        location: locationFilter.trim(),
        page: targetPage,
        limit: 12,
      });

      try {
        setLoading(true);
        const filters = {
          search: search.trim(),
          cuisine: cuisineFilter,
          rating: ratingFilter ? parseInt(ratingFilter) : undefined,
          location: locationFilter.trim(),
          page: targetPage,
          limit: 12,
        };

        const response = await getRestaurants(filters);
        console.log("getRestaurants response:", response);

        // Extract restaurants from backend response format {success: true, data: [...]}
        const restaurantsData = Array.isArray(response) ? response : response?.data || [];
        console.log("Processed restaurants data:", restaurantsData);

        if (isLoadMore) {
          setRestaurants((prev) => [...(Array.isArray(prev) ? prev : []), ...restaurantsData]);
          setPage(targetPage);
        } else {
          setRestaurants(restaurantsData);
          setPage(1);
        }

        setHasMore(restaurantsData.length === 12);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast.error("Failed to load restaurants");
        // Ensure restaurants is always an array on error
        if (!isLoadMore) {
          setRestaurants([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [mounted, search, cuisineFilter, ratingFilter, locationFilter, page]
  );

  useEffect(() => {
    if (mounted) {
      fetchRestaurants();
    }
  }, [fetchRestaurants, mounted]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCuisineChange = (value: string) => {
    setCuisineFilter(value);
    setPage(1);
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchRestaurants(true);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Cuisine Filter */}
              <select
                value={cuisineFilter}
                onChange={(e) => handleCuisineChange(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">All Cuisines</option>
                {CUISINE_OPTIONS.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => handleRatingChange(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && restaurants.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !restaurants || !Array.isArray(restaurants) || restaurants.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No restaurants found.</p>
          <p className="text-gray-400">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants &&
              Array.isArray(restaurants) &&
              restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="min-w-[200px]"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
