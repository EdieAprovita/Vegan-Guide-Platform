"use client";

import { useState, useEffect, useCallback } from "react";
import { Restaurant, getRestaurants } from "@/lib/api/restaurants";
import { RestaurantCard } from "./restaurant-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";

interface RestaurantListProps {
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

export function RestaurantList({
  initialRestaurants = [],
  showFilters = true,
  title = "Restaurants",
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRestaurants = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const currentPage = reset ? 1 : page;
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: 12,
        };

        if (search) params.search = search;
        if (cuisineFilter) params.cuisine = cuisineFilter;
        if (ratingFilter) params.rating = parseInt(ratingFilter);

        const response = await getRestaurants(params);

        if (reset) {
          setRestaurants(response.data || []);
          setPage(1);
        } else {
          setRestaurants((prev) => [...prev, ...(response.data || [])]);
        }

        setHasMore((response.data || []).length === 12);
      } catch {
        toast.error("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    },
    [page, search, cuisineFilter, ratingFilter]
  );

  useEffect(() => {
    if (initialRestaurants.length === 0) {
      loadRestaurants(true);
    }
  }, [initialRestaurants.length, loadRestaurants]);

  const handleSearch = () => {
    loadRestaurants(true);
  };

  const handleFilterChange = () => {
    loadRestaurants(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadRestaurants(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">{restaurants.length} restaurants found</div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Cuisine Filter */}
              <Select
                value={cuisineFilter}
                onValueChange={(value) => {
                  setCuisineFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All cuisines</SelectItem>
                  {CUISINE_OPTIONS.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select
                value={ratingFilter}
                onValueChange={(value) => {
                  setRatingFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Grid */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && restaurants.length > 0 && (
        <div className="text-center">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="px-8">
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
