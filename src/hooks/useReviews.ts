import { useState, useEffect, useCallback } from "react";
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

export function useReviews({
  resourceType,
  resourceId,
  page = 1,
  limit = 10,
  autoFetch = true,
}: UseReviewsParams): UseReviewsReturn {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchReviews = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!resourceId) return;

      try {
        setLoading(true);
        setError(null);

        // Currently all resource types use the same endpoint
        // TODO: Implement specific endpoints when APIs become available for other resource types
        const response = await getRestaurantReviews(resourceId, { page: pageNum, limit });

        const newReviews = response.data || [];

        if (append) {
          setReviews((prev) => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
        }

        setHasMore(newReviews.length === limit);
        setCurrentPage(pageNum);

        // Update total count if available - use data length as fallback
        setTotalReviews(reviews.length);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar las reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    },
    [resourceId, limit, reviews.length]
  );

  const fetchStats = useCallback(async () => {
    if (!resourceId) return;

    try {
      let response;

      // Fetch stats based on resource type
      switch (resourceType) {
        case "restaurant":
          response = await getRestaurantReviewStats(resourceId);
          break;
        default:
          // For other resource types, calculate stats from reviews
          if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            reviews.forEach((review) => {
              distribution[review.rating as keyof typeof distribution]++;
            });

            const calculatedStats: ReviewStats = {
              averageRating,
              totalReviews: reviews.length,
              ratingDistribution: distribution,
            };

            setStats(calculatedStats);
            return;
          }
          return;
      }

      if (response?.data) {
        setStats(response.data);
      }
    } catch (err: unknown) {
      console.error("Error fetching review stats:", err);
      // Don't set error for stats, as it's not critical
    }
  }, [resourceType, resourceId, reviews]);

  const addReview = useCallback(
    async (data: CreateReviewData): Promise<Review | null> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para crear una review");
      }

      try {
        setLoading(true);
        setError(null);

        // Currently all resource types use the same endpoint
        // TODO: Implement specific endpoints when APIs become available for other resource types
        const response = await createRestaurantReview(resourceId, data);

        if (response?.data) {
          const newReview = response.data;
          setReviews((prev) => [newReview, ...prev]);
          setTotalReviews((prev) => prev + 1);

          // Refresh stats
          await fetchStats();

          return newReview;
        }

        return null;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al crear la review");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resourceId, isAuthenticated, fetchStats]
  );

  const updateReview = useCallback(
    async (reviewId: string, data: Partial<CreateReviewData>): Promise<Review | null> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para actualizar una review");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await updateReviewApi(reviewId, data);

        if (response?.data) {
          const updatedReview = response.data;
          setReviews((prev) =>
            prev.map((review) => (review._id === reviewId ? updatedReview : review))
          );

          // Refresh stats
          await fetchStats();

          return updatedReview;
        }

        return null;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al actualizar la review");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchStats]
  );

  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para eliminar una review");
      }

      try {
        setLoading(true);
        setError(null);

        await deleteReviewApi(reviewId);

        // Remove from local state
        setReviews((prev) => prev.filter((review) => review._id !== reviewId));
        setTotalReviews((prev) => Math.max(0, prev - 1));

        // Refresh stats
        await fetchStats();

        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al eliminar la review");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, fetchStats]
  );

  const toggleHelpful = useCallback(
    async (reviewId: string, isHelpful: boolean): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para votar");
      }

      try {
        let response;

        if (isHelpful) {
          response = await markReviewHelpful(reviewId);
        } else {
          response = await removeReviewHelpful(reviewId);
        }

        if (response?.data) {
          const updatedReview = response.data;
          setReviews((prev) =>
            prev.map((review) => (review._id === reviewId ? updatedReview : review))
          );

          return true;
        }

        return false;
      } catch (err: unknown) {
        console.error("Error toggling helpful vote:", err);
        return false;
      }
    },
    [isAuthenticated]
  );

  const refetch = useCallback(async () => {
    await fetchReviews(1, false);
  }, [fetchReviews]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchReviews(currentPage + 1, true);
    }
  }, [hasMore, loading, currentPage, fetchReviews]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && resourceId) {
      fetchReviews(1, false);
    }
  }, [autoFetch, resourceId, fetchReviews]);

  // Fetch stats when reviews change
  useEffect(() => {
    if (reviews.length > 0) {
      fetchStats();
    }
  }, [reviews, fetchStats]);

  return {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    totalReviews,
    refetch,
    loadMore,
    addReview,
    updateReview,
    deleteReview,
    toggleHelpful,
  };
}

// Hook for managing a single review
export function useReview(reviewId: string) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) {
      setLoading(false);
      return;
    }

    const fetchReview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getReview(reviewId);
        setReview(response.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar la review");
        console.error("Error fetching review:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId]);

  const updateReviewLocal = useCallback(
    async (data: Partial<CreateReviewData>) => {
      if (!isAuthenticated) {
        throw new Error("Debes iniciar sesión para actualizar una review");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await updateReviewApi(reviewId, data);

        if (response?.data) {
          setReview(response.data);
          return response.data;
        }

        return null;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al actualizar la review");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [reviewId, isAuthenticated]
  );

  const deleteReviewLocal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("Debes iniciar sesión para eliminar una review");
    }

    try {
      setLoading(true);
      setError(null);

      await deleteReviewApi(reviewId);
      setReview(null);

      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la review");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reviewId, isAuthenticated]);

  return {
    review,
    loading,
    error,
    updateReview: updateReviewLocal,
    deleteReview: deleteReviewLocal,
  };
}
