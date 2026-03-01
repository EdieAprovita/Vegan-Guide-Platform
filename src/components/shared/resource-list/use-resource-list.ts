/**
 * useResourceList<T>
 *
 * Generic hook that encapsulates ALL shared state and side-effects previously
 * duplicated across SimpleRestaurantList, SimpleMarketList, SimpleDoctorList
 * and SimpleRecipeList:
 *
 *  - Hydration guard (`mounted`)
 *  - Item list state (`items: T[]`)
 *  - Pagination (`page`, `hasMore`)
 *  - Global loading flag
 *  - Search string
 *  - Dynamic select-filter values (stored as Record<string, string>)
 *  - Fetch callback using a ref for the current page to avoid stale closures
 *  - Response normalisation: Array | BackendEnvelope<T> -> T[]
 *  - Toast error notifications via sonner
 *
 * ## Stale-closure / infinite-loop fix
 *
 * The original SimpleMarketList / SimpleDoctorList had a bug: `page` was in
 * the `useCallback` dependency array, so changing `page` produced a new
 * `fetchItems` reference, which triggered the `useEffect([fetchItems])`
 * immediately — doing a fresh full-page-1 fetch right after a load-more.
 *
 * Fix: we store the current page in a `useRef` and read it from there inside
 * the callback.  This means `page` is NOT in the `useCallback` dep array, so
 * filter/search changes still cause a clean re-fetch (the callback is
 * recreated), but a `setPage` call alone does NOT recreate the callback and
 * therefore does NOT trigger an extra fetch cycle.
 *
 * The hook is NOT a "use client" boundary itself; the components that use it
 * must carry that directive.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { FetchFn, FilterConfig, UseResourceListReturn } from "./types";

interface UseResourceListOptions<T> {
  /** Pre-fetched items (SSR). Skips the first client fetch when provided. */
  initialItems?: T[];
  /** Items per page. */
  pageSize?: number;
  /** The async function that retrieves a page of resources. */
  fetchFn: FetchFn<T>;
  /** Dynamic filter configurations (determines which keys live in filterValues). */
  filters?: FilterConfig[];
  /** Label used in toast error messages and console logs, e.g. "restaurants". */
  errorLabel?: string;
}

export function useResourceList<T>({
  initialItems = [],
  pageSize = 12,
  fetchFn,
  filters = [],
  errorLabel = "items",
}: UseResourceListOptions<T>): UseResourceListReturn<T> {
  // -------------------------------------------------------------------------
  // Hydration guard — prevents SSR/CSR mismatch
  // -------------------------------------------------------------------------
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // -------------------------------------------------------------------------
  // Core state
  // -------------------------------------------------------------------------
  const [items, setItems] = useState<T[]>(
    Array.isArray(initialItems) ? initialItems : []
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Store page in a ref so the fetch callback can read the current value
  // without being recreated every time page changes (avoids infinite loops).
  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // -------------------------------------------------------------------------
  // Filter state
  // -------------------------------------------------------------------------
  const [search, setSearchState] = useState("");

  // Build the initial filter value map from the provided FilterConfig array.
  // Each key maps to an empty string (no filter applied).
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () =>
      filters.reduce<Record<string, string>>((acc, f) => {
        acc[f.key] = "";
        return acc;
      }, {})
  );

  // -------------------------------------------------------------------------
  // Fetch callback
  //
  // Intentionally does NOT include `page` in the dependency array.
  // Instead we read `pageRef.current` which always holds the latest page value
  // without causing the callback to be recreated on every page increment.
  //
  // Dependencies that DO need to recreate the callback (triggering a fresh
  // fetch via the useEffect below): mounted, search, filterValues, pageSize,
  // fetchFn, errorLabel.
  // -------------------------------------------------------------------------
  const fetchItems = useCallback(
    async (isLoadMore = false, currentPage?: number) => {
      if (!mounted) return;

      // Determine the page to request.
      // - For a fresh fetch (isLoadMore=false): always page 1.
      // - For load-more: currentPage if provided, else current page + 1.
      //   We read from the ref to get the latest value without a stale closure.
      const targetPage =
        currentPage ?? (isLoadMore ? pageRef.current + 1 : 1);

      try {
        setLoading(true);

        const params = {
          search: search.trim(),
          // Spread dynamic filter values (cuisine, specialty, etc.)
          ...filterValues,
          page: targetPage,
          limit: pageSize,
        };

        const response = await fetchFn(params);

        // Normalise the backend response.
        //
        // The backend returns one of:
        //   (a) BackendEnvelope<T>: { success: true, message?: "...", data: T[] }
        //   (b) A plain T[]  (legacy or mocked endpoints)
        //
        // processBackendResponse from config.ts handles this same branching;
        // we replicate it here to keep the hook self-contained and avoid
        // importing from a lib layer (keeping dependency direction clean).
        let data: T[];

        if (Array.isArray(response)) {
          data = response as T[];
        } else if (
          response !== null &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray((response as { data: unknown }).data)
        ) {
          data = (response as { data: T[] }).data;
        } else {
          // Unexpected shape — treat as empty to avoid rendering garbage.
          console.warn(
            `useResourceList: unexpected response shape for "${errorLabel}"`,
            response
          );
          data = [];
        }

        if (isLoadMore) {
          setItems((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            ...data,
          ]);
          setPage(targetPage);
        } else {
          setItems(data);
          setPage(1);
        }

        setHasMore(data.length === pageSize);
      } catch (error) {
        console.error(`Error fetching ${errorLabel}:`, error);
        toast.error(`Failed to load ${errorLabel}`);

        // Reset list only on fresh fetches so existing items stay visible
        // when a load-more fails.
        if (!isLoadMore) {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // `page` is deliberately excluded — we use pageRef.current instead.
    [mounted, search, filterValues, pageSize, fetchFn, errorLabel]
  );

  // -------------------------------------------------------------------------
  // Trigger a fresh fetch whenever filters, search or mounted state changes.
  // `fetchItems` is recreated only when those values change (not when `page`
  // changes), so this effect does not fire after a load-more page increment.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (mounted) {
      fetchItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItems, mounted]);

  // -------------------------------------------------------------------------
  // Public setters
  //
  // Both handlers reset page to 1 BEFORE updating the filter/search state so
  // that the next fetchItems call (triggered by the useEffect) always starts
  // at page 1.  We update pageRef synchronously to keep it in sync.
  // -------------------------------------------------------------------------
  const handleSetSearch = useCallback((value: string) => {
    setPage(1);
    pageRef.current = 1;
    setSearchState(value);
  }, []);

  const handleSetFilterValue = useCallback((key: string, value: string) => {
    setPage(1);
    pageRef.current = 1;
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleLoadMore = useCallback(() => {
    fetchItems(true);
  }, [fetchItems]);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    mounted,
    items,
    loading,
    search,
    page,
    hasMore,
    filterValues,
    setSearch: handleSetSearch,
    setFilterValue: handleSetFilterValue,
    handleLoadMore,
  };
}
