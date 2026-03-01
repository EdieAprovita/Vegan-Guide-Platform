/**
 * Generic ResourceList type system.
 *
 * Covers the four concrete list variants:
 *   - SimpleRestaurantList
 *   - SimpleMarketList
 *   - SimpleDoctorList
 *   - SimpleRecipeList
 *
 * All variants share the same fetch/state/filter/pagination contract.
 * Only the API function, card renderer, filter config and grid layout differ.
 */

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Filter configuration
// ---------------------------------------------------------------------------

/**
 * Describes a single <select> option within a FilterConfig.
 */
export interface FilterOption {
  /** Displayed text in the <option> element. */
  label: string;
  /** Submitted value sent in the API request. */
  value: string;
}

/**
 * Describes a single <select> filter column in the filter bar.
 *
 * The `key` must be the exact query-param name that the API function expects
 * (e.g. "cuisine", "specialty", "products", "category", "difficulty").
 */
export interface FilterConfig {
  /** Unique identifier used as the key in the dynamic filter state map. */
  key: string;
  /** Placeholder text shown as the first "empty" option (e.g. "All Cuisines"). */
  placeholder: string;
  /** All selectable options for this filter. */
  options: FilterOption[];
}

// ---------------------------------------------------------------------------
// API / fetch contract
// ---------------------------------------------------------------------------

/**
 * Base filter parameters shared by every fetch call.
 *
 * The index signature uses `unknown` so that resource-specific keys
 * (cuisine, specialty, etc.) can be spread into the params object without
 * a TypeScript error.  Concrete API functions narrow their own accepted
 * params via their own interfaces.
 */
export interface BaseFilterParams {
  search?: string;
  location?: string;
  rating?: number;
  page?: number;
  limit?: number;
  /** Catch-all for resource-specific filter keys (cuisine, specialty, etc.). */
  [key: string]: unknown;
}

/**
 * The standard envelope returned by the backend for list endpoints:
 *   { success: true, message?: "...", data: T[] }
 *
 * Some endpoints may return the array directly; both shapes are handled by
 * the response normaliser in useResourceList.
 */
export interface BackendEnvelope<T> {
  success: boolean;
  message?: string;
  data: T[];
}

/**
 * Signature of the async function that fetches a page of resources.
 *
 * Returns either:
 *   - A plain array  T[]  (legacy / simple endpoints)
 *   - A backend envelope  BackendEnvelope<T>  (standard endpoints)
 *
 * Using `unknown` as the return type and narrowing inside the hook avoids
 * the structural-typing conflicts that arise from the `[key: string]: unknown`
 * index signature on BackendEnvelope.
 */
export type FetchFn<T> = (params: BaseFilterParams) => Promise<unknown>;

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the generic ResourceList<T> component.
 *
 * T is constrained to objects that have a string `_id` property so the
 * component can use it as a React list key without an unsafe cast.
 */
export interface ResourceListProps<T extends { _id: string }> {
  /**
   * Items pre-fetched on the server (SSR / SSG).
   * When provided the component skips the initial client fetch.
   */
  initialItems?: T[];

  /** Items per page. Defaults to 12. */
  pageSize?: number;

  /** Whether to render the filter bar. Defaults to true. */
  showFilters?: boolean;

  /** Optional heading rendered above the list. */
  title?: string;

  /** Placeholder text inside the search input. Defaults to "Search...". */
  searchPlaceholder?: string;

  /**
   * Async function that fetches a page of resources.
   * Injected by each concrete wrapper so the hook stays resource-agnostic.
   */
  fetchFn: FetchFn<T>;

  /**
   * Renders one card for a single item.
   * The implementation is fully opaque to the generic component.
   * The caller is responsible for providing a stable React key (usually by
   * wrapping the card in a keyed element inside renderCard).
   */
  renderCard: (item: T) => ReactNode;

  /**
   * Dynamic filter columns rendered in the filter bar (beyond the always-
   * present search input).
   */
  filters?: FilterConfig[];

  /**
   * Tailwind grid classes applied to the card grid.
   * Must start with "grid" and include column/gap classes.
   * Defaults to "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3".
   */
  gridClassName?: string;

  /**
   * Approximate height used by the skeleton card placeholders.
   * Defaults to "h-[300px]".
   */
  skeletonCardHeight?: string;

  /**
   * Resource name used in the empty-state message
   * (e.g. "restaurants", "markets").  Defaults to "items".
   */
  emptyLabel?: string;

  /**
   * Resource name used in error toast messages and console logs
   * (e.g. "restaurants", "markets").  Defaults to "items".
   */
  errorLabel?: string;
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

/**
 * Everything useResourceList exposes to the component layer.
 */
export interface UseResourceListReturn<T> {
  mounted: boolean;
  items: T[];
  loading: boolean;
  search: string;
  page: number;
  hasMore: boolean;
  /** Current values of all dynamic (select) filters, keyed by FilterConfig.key. */
  filterValues: Record<string, string>;
  setSearch: (value: string) => void;
  setFilterValue: (key: string, value: string) => void;
  handleLoadMore: () => void;
}
