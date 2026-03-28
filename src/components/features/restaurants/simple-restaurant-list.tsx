"use client";

import { useState } from "react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { RestaurantCard } from "./restaurant-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

interface SimpleRestaurantListProps {
  showFilters?: boolean;
  title?: string;
}

const PAGE_LIMIT = 12;

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
  showFilters = true,
  title = "Restaurants",
}: SimpleRestaurantListProps) {
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: restaurants = [],
    isLoading,
    isFetching,
  } = useRestaurants({
    search: search.trim() || undefined,
    cuisine: cuisineFilter || undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
    location: locationFilter.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const hasMore = restaurants.length === PAGE_LIMIT;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
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

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && restaurants.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[300px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No restaurants found.</p>
          <p className="text-muted-foreground/60">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
                className="min-w-[200px]"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
