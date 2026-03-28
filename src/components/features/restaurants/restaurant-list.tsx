"use client";

import { useState } from "react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { RestaurantCard } from "./restaurant-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface RestaurantListProps {
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

export function RestaurantList({ showFilters = true, title = "Restaurants" }: RestaurantListProps) {
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: restaurants = [],
    isLoading,
    isFetching,
  } = useRestaurants({
    search: search || undefined,
    cuisine: cuisineFilter || undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
    page,
    limit: 12,
  });

  const hasMore = restaurants.length === 12;

  const handleSearch = () => {
    setPage(1);
  };

  const handleLoadMore = () => {
    if (isFetching || !hasMore) return;
    setPage((prev) => prev + 1);
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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Cuisine Filter */}
              <select
                value={cuisineFilter}
                onChange={(e) => {
                  setCuisineFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">All cuisines</option>
                {CUISINE_OPTIONS.map((cuisine) => (
                  <option key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={isFetching}>
                {isFetching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurant Grid */}
      {isLoading && restaurants.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[300px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : restaurants.length > 0 ? (
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
          <Button onClick={handleLoadMore} disabled={isFetching} variant="outline" className="px-8">
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
