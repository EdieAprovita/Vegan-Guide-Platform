"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Restaurant } from "@/lib/api/restaurants";
import { RestaurantCard } from "./restaurant-card";
import { RestaurantFilters, RestaurantFilterValues } from "./restaurant-filters";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RestaurantListPaginatedProps {
  restaurants: Restaurant[];
  filters: RestaurantFilterValues;
  currentPage: number;
  hasNextPage: boolean;
}

export function RestaurantListPaginated({
  restaurants,
  filters,
  currentPage,
  hasNextPage,
}: RestaurantListPaginatedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname, startTransition]
  );

  const hasActiveFilters = filters.search || filters.cuisine || filters.minRating;

  return (
    <div className="space-y-6">
      <RestaurantFilters values={filters} />

      {/* Results state */}
      {isPending ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[300px] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="text-muted-foreground mx-auto mb-4 h-12 w-12" aria-hidden="true" />
            <h3 className="text-foreground mb-2 text-lg font-medium">No restaurants found</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters."
                : "No restaurants are available yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            aria-label="Restaurant results"
          >
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>

          {/* Pagination */}
          {(currentPage > 1 || hasNextPage) && (
            <div className="flex items-center justify-center gap-4" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                aria-label="Previous page"
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Previous
              </Button>

              <span className="text-muted-foreground text-sm" aria-current="page">
                Page {currentPage}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(currentPage + 1)}
                disabled={!hasNextPage || isPending}
                aria-label="Next page"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
