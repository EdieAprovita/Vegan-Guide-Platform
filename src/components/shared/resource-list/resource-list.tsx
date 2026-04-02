"use client";

/**
 * ResourceList<T>
 *
 * Generic list component that replaces the four near-identical variants:
 *   SimpleRestaurantList / SimpleMarketList / SimpleDoctorList / SimpleRecipeList
 *
 * What each variant provides (injected via props):
 *   - fetchFn        — async function that calls the resource API
 *   - renderCard     — renders one card element for a single item
 *   - filters        — select-filter column definitions
 *   - gridClassName  — Tailwind grid classes (allows 3-col vs 4-col grids)
 *
 * What this component handles (shared logic via useResourceList):
 *   - Hydration guard / pre-mount skeleton (prevents SSR/CSR mismatch)
 *   - Initial fetch on mount + re-fetch on filter/search change
 *   - Pagination (load-more pattern)
 *   - Loading skeleton during first fetch (items.length === 0 && loading)
 *   - Animated spinner inside the Load More button while paginating
 *   - Empty state with customisable label
 *   - Toast error notifications (handled inside the hook)
 *
 * Grid className contract
 * -----------------------
 * `gridClassName` must be a complete Tailwind grid class string that begins
 * with "grid" and contains column and gap utilities, e.g.:
 *   "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
 *   "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
 *
 * The same value is used for both the card grid and the skeleton grid.
 * No string manipulation is applied, so what you pass is exactly what gets
 * rendered (unlike earlier versions that tried to strip a leading "grid ").
 *
 * Key strategy
 * ------------
 * Items are keyed by `item._id` (the MongoDB document ID that every resource
 * type shares).  The generic type T is constrained to `{ _id: string }` to
 * enforce this at compile time.  Individual renderCard implementations do NOT
 * need to add their own wrapper key — the `key` is applied to the outer div.
 */

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResourceList } from "./use-resource-list";
import { ResourceListFilters } from "./resource-list-filters";
import type { ResourceListProps } from "./types";

/** Default Tailwind grid class used when the caller does not provide one. */
const DEFAULT_GRID_CLASS = "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";

/** Number of skeleton cards shown during pre-mount and initial loading. */
const SKELETON_COUNT = 6;

export function ResourceList<T extends { _id: string }>({
  initialItems = [],
  pageSize = 12,
  showFilters = true,
  title,
  searchPlaceholder = "Search...",
  fetchFn,
  renderCard,
  filters = [],
  gridClassName = DEFAULT_GRID_CLASS,
  skeletonCardHeight = "h-[300px]",
  emptyLabel = "items",
  errorLabel = "items",
}: ResourceListProps<T>) {
  const {
    mounted,
    items,
    loading,
    search,
    hasMore,
    filterValues,
    setSearch,
    setFilterValue,
    handleLoadMore,
  } = useResourceList<T>({
    initialItems,
    pageSize,
    fetchFn,
    filters,
    errorLabel,
  });

  // ---------------------------------------------------------------------------
  // Pre-mount: render a static skeleton to prevent hydration mismatch.
  //
  // The skeleton mirrors the post-mount layout exactly:
  //   - Filter bar skeleton (same grid columns)
  //   - Card grid skeleton (same grid class, same skeleton height)
  //
  // We build the filter-bar grid class here the same way ResourceListFilters
  // does so the layouts are identical before and after hydration.
  // ---------------------------------------------------------------------------
  if (!mounted) {
    const totalWidgets = 1 + filters.length;
    const colCount = Math.min(Math.max(totalWidgets, 1), 4);
    const filterGridClass =
      colCount <= 2
        ? "grid-cols-1 md:grid-cols-2"
        : colCount === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className={`grid gap-4 ${filterGridClass}`}>
              {/* Search skeleton */}
              <div className="h-10 animate-pulse rounded bg-gray-200" />
              {/* One skeleton per dynamic select filter */}
              {filters.map((f) => (
                <div key={f.key} className="h-10 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </div>
        )}

        <div className={gridClassName}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={`${skeletonCardHeight} animate-pulse rounded-lg bg-gray-200`} />
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Mounted render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Optional page heading */}
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      {/* Filter bar */}
      {showFilters && (
        <ResourceListFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValue}
        />
      )}

      {/* -----------------------------------------------------------------------
          Content area: loading skeleton | empty state | card grid + load more
          aria-live="polite" ensures screen readers announce content changes
          after filter/search updates without interrupting ongoing speech.
      ----------------------------------------------------------------------- */}
      <div
        aria-live="polite"
        aria-atomic="false"
        aria-busy={loading}
        aria-relevant="additions removals"
      >
        {/* Visually-hidden count announced to screen readers on each update */}
        <span className="sr-only">
          {loading
            ? `Cargando ${emptyLabel}…`
            : items.length === 0
              ? `No se encontraron ${emptyLabel}.`
              : `${items.length} ${emptyLabel} encontrado${items.length === 1 ? "" : "s"}.`}
        </span>

        {loading && items.length === 0 ? (
          // Initial loading skeleton — shown when the list is empty and a fetch
          // is in progress (first mount, or after a filter change that cleared
          // the previous page of results).
          <div className={gridClassName} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`${skeletonCardHeight} animate-pulse rounded-lg bg-gray-200`}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty state — no results for the current search/filter combination.
          <div role="status" className="py-12 text-center">
            <p className="text-muted-foreground text-lg">No {emptyLabel} found.</p>
            <p className="text-muted-foreground/70">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            {/* Card grid
                Each item is wrapped in a keyed div.  renderCard does NOT need
                to add a key; it just returns the card JSX.
            */}
            <div className={gridClassName}>
              {items.map((item) => (
                <div key={item._id}>{renderCard(item)}</div>
              ))}
            </div>

            {/* Load More button — only shown when there are potentially more pages */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outline"
                  className="min-w-[200px]"
                  aria-label={`Cargar mas ${emptyLabel}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
