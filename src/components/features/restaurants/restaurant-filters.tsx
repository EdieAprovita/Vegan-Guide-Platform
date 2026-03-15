"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";

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
] as const;

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
] as const;

export interface RestaurantFilterValues {
  search: string;
  cuisine: string;
  minRating: string;
  page: string;
}

interface RestaurantFiltersProps {
  values: RestaurantFilterValues;
}

export function RestaurantFilters({ values }: RestaurantFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Partial<RestaurantFilterValues>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 whenever a filter changes (but not when page itself changes)
      if (!("page" in updates)) {
        params.delete("page");
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("search") as HTMLInputElement;
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ search: input.value })}`);
    });
  };

  const handleCuisineChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ cuisine: value })}`);
    });
  };

  const handleRatingChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ minRating: value })}`);
    });
  };

  const hasActiveFilters = values.search || values.cuisine || values.minRating;

  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              name="search"
              placeholder="Search restaurants..."
              defaultValue={values.search}
              className="pl-10"
              aria-label="Search restaurants"
            />
          </form>

          {/* Cuisine */}
          <select
            value={values.cuisine}
            onChange={(e) => handleCuisineChange(e.target.value)}
            aria-label="Filter by cuisine"
            className="border-input focus:ring-ring h-10 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          >
            <option value="">All cuisines</option>
            {CUISINE_OPTIONS.map((cuisine) => (
              <option key={cuisine} value={cuisine}>
                {cuisine}
              </option>
            ))}
          </select>

          {/* Min Rating */}
          <select
            value={values.minRating}
            onChange={(e) => handleRatingChange(e.target.value)}
            aria-label="Filter by minimum rating"
            className="border-input focus:ring-ring h-10 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              disabled={isPending}
              aria-label="Clear all filters"
            >
              <X className="mr-1 h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2" aria-live="polite" aria-label="Active filters">
            {values.search && (
              <span className="bg-emerald-50 text-emerald-700 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                Search: {values.search}
              </span>
            )}
            {values.cuisine && (
              <span className="bg-emerald-50 text-emerald-700 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                Cuisine: {values.cuisine}
              </span>
            )}
            {values.minRating && (
              <span className="bg-emerald-50 text-emerald-700 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
                {values.minRating}+ stars
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
