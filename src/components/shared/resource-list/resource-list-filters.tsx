"use client";

/**
 * ResourceListFilters
 *
 * Renders the filter bar shared by all ResourceList variants:
 *   - A search input with a leading Search icon (always present)
 *   - Zero or more dynamic <select> filters driven by FilterConfig[]
 *
 * This component is intentionally stateless: all values and change handlers
 * come from the parent via useResourceList.
 *
 * Accessibility
 * -------------
 * - The search <input> has an explicit aria-label and type="search".
 * - Each <select> gets an aria-label derived from its placeholder text.
 * - The Search icon is aria-hidden since the input label covers it.
 *
 * Grid layout
 * -----------
 * The number of columns scales with the total number of filter widgets
 * (search + selects), capped at 4 to avoid cramped layouts on wide screens.
 */

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FilterConfig } from "./types";

/** Tailwind classes shared by all <select> elements. */
const SELECT_CLASS =
  "border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none";

interface ResourceListFiltersProps {
  /** Current search string. */
  search: string;
  /** Called when the user types in the search input. */
  onSearchChange: (value: string) => void;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /** Dynamic filter column definitions. */
  filters?: FilterConfig[];
  /** Current value for each dynamic filter, keyed by FilterConfig.key. */
  filterValues: Record<string, string>;
  /** Called when a select filter changes. */
  onFilterChange: (key: string, value: string) => void;
}

export function ResourceListFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues,
  onFilterChange,
}: ResourceListFiltersProps) {
  // Derive the column count from total widgets (1 search + N selects), max 4.
  const totalWidgets = 1 + filters.length;
  const colCount = Math.min(Math.max(totalWidgets, 1), 4);

  const gridClass =
    colCount <= 2
      ? "grid-cols-1 md:grid-cols-2"
      : colCount === 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <Card>
      <CardContent className="p-6">
        <div className={`grid gap-4 ${gridClass}`}>
          {/* ------------------------------------------------------------------
              Search input — always rendered first
          ------------------------------------------------------------------ */}
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* ------------------------------------------------------------------
              Dynamic select filters — one per FilterConfig
          ------------------------------------------------------------------ */}
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filterValues[filter.key] ?? ""}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              aria-label={filter.placeholder}
              className={SELECT_CLASS}
            >
              <option value="">{filter.placeholder}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
