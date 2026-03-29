"use client";

import { useCallback } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Review,
  CreateReviewData,
  ReviewStats,
  getReview,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
  markReviewHelpful,
  removeReviewHelpful,
  getRestaurantReviews,
  getRestaurantReviewStats,
  createRestaurantReview,
} from "@/lib/api/reviews";

// ---------------------------------------------------------------------------
// Query key factory — keeps cache keys consistent across the module
// ---------------------------------------------------------------------------
export const reviewKeys = {
  all: ["reviews"] as const,
  list: (resourceType: string, resourceId: string) =>
    ["reviews", "list", resourceType, resourceId] as const,
  stats: (resourceType: string, resourceId: string) =>
    ["reviews", "stats", resourceType, resourceId] as const,
  detail: (reviewId: string) => ["reviews", "detail", reviewId] as const,
};

// ---------------------------------------------------------------------------
// Shared stats-derivation helper (non-restaurant resource types fall back to
// a client-side calculation because no dedicated stats endpoint exists yet)
// ---------------------------------------------------------------------------
function deriveStats(resourceType: string, reviews: Review[]): ReviewStats | null {
  if (reviews.length === 0) return null;

  if (resourceType === "restaurant") {
    // Restaurant stats come from the server via the stats query — not derived here
    return null;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1;
  });

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution: distribution,
  };
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------
interface UseReviewsParams {
  resourceType: string;
  resourceId: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalReviews: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addReview: (data: CreateReviewData) => Promise<Review | null>;
  updateReview: (reviewId: string, data: Partial<CreateReviewData>) => Promise<Review | null>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  toggleHelpful: (reviewId: string, isHelpful: boolean) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// useReviews — list with pagination (infinite scroll / load-more)
// ---------------------------------------------------------------------------
export function useReviews({
  resourceType,
  resourceId,
  page: _page = 1,
  limit = 10,
  autoFetch = true,
}: UseReviewsParams): UseReviewsReturn {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const queryClient = useQueryClient();

  // ------------------------------------------------------------------
  // Infinite list query
  // ------------------------------------------------------------------
  const listQueryKey = reviewKeys.list(resourceType, resourceId);

  const {
    data: infiniteData,
    isFetching,
    error: listError,
    refetch: refetchInfinite,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: listQueryKey,
    queryFn: async ({ pageParam }) => {
      const response = await getRestaurantReviews(resourceId, {
        page: pageParam,
        limit,
      });
      return response.data ?? [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === limit ? lastPageParam + 1 : undefined,
    enabled: autoFetch && !!resourceId,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten pages into a single array
  const reviews: Review[] = infiniteData?.pages.flat() ?? [];
  const hasMore = hasNextPage ?? false;

  // ------------------------------------------------------------------
  // Stats query (restaurant only — other types derived client-side)
  // ------------------------------------------------------------------
  const statsQueryKey = reviewKeys.stats(resourceType, resourceId);

  const { data: serverStats } = useQuery({
    queryKey: statsQueryKey,
    queryFn: async () => {
      const response = await getRestaurantReviewStats(resourceId);
      return response.data ?? null;
    },
    enabled: autoFetch && !!resourceId && resourceType === "restaurant",
    staleTime: 5 * 60 * 1000,
  });

  // Resolve stats: server-provided for restaurants, derived for everything else
  const stats: ReviewStats | null =
    resourceType === "restaurant" ? (serverStats ?? null) : deriveStats(resourceType, reviews);

  // ------------------------------------------------------------------
  // Public helpers that preserve the original synchronous-looking API
  // ------------------------------------------------------------------
  const refetch = useCallback(async () => {
    await refetchInfinite();
  }, [refetchInfinite]);

  const loadMore = useCallback(async () => {
    if (hasMore && !isFetching) {
      await fetchNextPage();
    }
  }, [hasMore, isFetching, fetchNextPage]);

  // ------------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------------
  const addReviewMutation = useMutation({
    mutationFn: (data: CreateReviewData) => createRestaurantReview(resourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<CreateReviewData> }) =>
      updateReviewApi(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReviewApi(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
    },
  });

  const toggleHelpfulMutation = useMutation({
    mutationFn: ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) =>
      isHelpful ? markReviewHelpful(reviewId) : removeReviewHelpful(reviewId),
    onSuccess: (response) => {
      if (!response?.data) return;
      const updatedReview = response.data;
      // Optimistic-style cache update: patch the review in all cached pages
      queryClient.setQueryData(
        listQueryKey,
        (
          old:
            | { pages: Review[][]; pageParams: unknown[] }
            | undefined
        ) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((r) => (r._id === updatedReview._id ? updatedReview : r))
            ),
          };
        }
      );
    },
  });

  // ------------------------------------------------------------------
  // Wrapper functions that keep the original thrown-error contract
  // ------------------------------------------------------------------
  const addReview = useCallback(
    async (data: CreateReviewData): Promise<Review | null> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para crear una review");
      }
      const response = await addReviewMutation.mutateAsync(data);
      return response?.data ?? null;
    },
    [isAuthenticated, addReviewMutation]
  );

  const updateReview = useCallback(
    async (reviewId: string, data: Partial<CreateReviewData>): Promise<Review | null> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para actualizar una review");
      }
      const response = await updateReviewMutation.mutateAsync({ reviewId, data });
      return response?.data ?? null;
    },
    [isAuthenticated, updateReviewMutation]
  );

  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para eliminar una review");
      }
      await deleteReviewMutation.mutateAsync(reviewId);
      return true;
    },
    [isAuthenticated, deleteReviewMutation]
  );

  const toggleHelpful = useCallback(
    async (reviewId: string, isHelpful: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para votar");
      }
      try {
        const response = await toggleHelpfulMutation.mutateAsync({ reviewId, isHelpful });
        return !!response?.data;
      } catch {
        return false;
      }
    },
    [isAuthenticated, toggleHelpfulMutation]
  );

  // ------------------------------------------------------------------
  // Compose error string from any active mutation or the list query
  // ------------------------------------------------------------------
  const mutationError =
    addReviewMutation.error ??
    updateReviewMutation.error ??
    deleteReviewMutation.error ??
    null;

  const error: string | null =
    mutationError instanceof Error
      ? mutationError.message
      : listError instanceof Error
        ? listError.message
        : null;

  return {
    reviews,
    stats,
    loading: isFetching,
    error,
    hasMore,
    totalReviews: reviews.length,
    refetch,
    loadMore,
    addReview,
    updateReview,
    deleteReview,
    toggleHelpful,
  };
}

// ---------------------------------------------------------------------------
// useReview — single review by ID
// ---------------------------------------------------------------------------
export function useReview(reviewId: string) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const queryClient = useQueryClient();

  const detailQueryKey = reviewKeys.detail(reviewId);

  const {
    data: review,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: detailQueryKey,
    queryFn: async () => {
      const response = await getReview(reviewId);
      return response.data ?? null;
    },
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateReviewData>) => updateReviewApi(reviewId, data),
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(detailQueryKey, response.data);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReviewApi(reviewId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: detailQueryKey });
    },
  });

  const updateReviewLocal = useCallback(
    async (data: Partial<CreateReviewData>) => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para actualizar una review");
      }
      const response = await updateMutation.mutateAsync(data);
      return response?.data ?? null;
    },
    [isAuthenticated, updateMutation]
  );

  const deleteReviewLocal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("Debes iniciar sesión para eliminar una review");
    }
    await deleteMutation.mutateAsync();
    return true;
  }, [isAuthenticated, deleteMutation]);

  const mutationError = updateMutation.error ?? deleteMutation.error ?? null;

  const error: string | null =
    mutationError instanceof Error
      ? mutationError.message
      : queryError instanceof Error
        ? queryError.message
        : null;

  return {
    review: review ?? null,
    loading: isLoading,
    error,
    updateReview: updateReviewLocal,
    deleteReview: deleteReviewLocal,
  };
}
