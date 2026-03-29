import { renderHook, act } from "@testing-library/react";
import { useReviews, useReview, reviewKeys } from "@/hooks/useReviews";
import * as reviewsApi from "@/lib/api/reviews";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
jest.mock("@/lib/api/reviews", () => ({
  getReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
  markReviewHelpful: jest.fn(),
  removeReviewHelpful: jest.fn(),
  getRestaurantReviews: jest.fn(),
  getRestaurantReviewStats: jest.fn(),
  createRestaurantReview: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: jest.fn(),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

import { useSession } from "next-auth/react";

const useSessionMock = useSession as unknown as jest.Mock;
const useInfiniteQueryMock = useInfiniteQuery as unknown as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;
const useMutationMock = useMutation as unknown as jest.Mock;
const useQueryClientMock = useQueryClient as unknown as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockReview = {
  _id: "rev1",
  user: { _id: "u1", username: "testuser" },
  rating: 4,
  comment: "Great place!",
  resourceType: "restaurant" as const,
  resourceId: "rest1",
  helpful: [],
  helpfulCount: 0,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockStats = {
  averageRating: 4.0,
  totalReviews: 1,
  ratingDistribution: { 4: 1, 5: 0, 3: 0, 2: 0, 1: 0 },
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
const setUnauthenticated = () =>
  useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });

const setAuthenticated = () =>
  useSessionMock.mockReturnValue({
    data: { user: { id: "user-1", name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  });

/** Stubs useInfiniteQuery with a default happy-path response */
function stubInfiniteQuery(pages: (typeof mockReview)[][] = [[mockReview]]) {
  useInfiniteQueryMock.mockReturnValue({
    data: { pages, pageParams: pages.map((_, i) => i + 1) },
    isFetching: false,
    error: null,
    refetch: jest.fn().mockResolvedValue(undefined),
    fetchNextPage: jest.fn().mockResolvedValue(undefined),
    hasNextPage: false,
  });
}

/** Stubs useQuery with optional return data */
function stubQuery(returnData: unknown = null) {
  useQueryMock.mockReturnValue({
    data: returnData,
    isLoading: false,
    error: null,
  });
}

/** Stubs all mutations and returns the cache helpers for assertion */
function stubMutations() {
  const invalidateQueries = jest.fn();
  const setQueryData = jest.fn();
  const removeQueries = jest.fn();

  useQueryClientMock.mockReturnValue({ invalidateQueries, setQueryData, removeQueries });

  useMutationMock.mockImplementation((config: { mutationFn: (...a: unknown[]) => unknown }) => ({
    mutateAsync: (...args: unknown[]) => config.mutationFn(...args),
    error: null,
  }));

  return { invalidateQueries, setQueryData, removeQueries };
}

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  setUnauthenticated();
  stubInfiniteQuery();
  stubQuery();
  stubMutations();
});

afterAll(() => consoleErrorSpy.mockRestore());

// ---------------------------------------------------------------------------
// reviewKeys — pure function, no hook context needed
// ---------------------------------------------------------------------------
describe("reviewKeys", () => {
  it("list key includes resourceType and resourceId", () => {
    expect(reviewKeys.list("restaurant", "rest1")).toEqual([
      "reviews",
      "list",
      "restaurant",
      "rest1",
    ]);
  });

  it("stats key includes resourceType and resourceId", () => {
    expect(reviewKeys.stats("restaurant", "rest1")).toEqual([
      "reviews",
      "stats",
      "restaurant",
      "rest1",
    ]);
  });

  it("detail key includes reviewId", () => {
    expect(reviewKeys.detail("rev1")).toEqual(["reviews", "detail", "rev1"]);
  });
});

// ---------------------------------------------------------------------------
// useReviews
// ---------------------------------------------------------------------------
describe("useReviews", () => {
  const defaultParams = { resourceType: "restaurant", resourceId: "rest1" };

  // -------------------------------------------------------------------------
  // Query configuration
  // -------------------------------------------------------------------------
  it("configures the infinite list query with correct key and enabled=true by default", () => {
    renderHook(() => useReviews(defaultParams));

    expect(useInfiniteQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: reviewKeys.list("restaurant", "rest1"),
        enabled: true,
      })
    );
  });

  it("sets enabled=false when autoFetch is false", () => {
    renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    expect(useInfiniteQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it("sets enabled=false when resourceId is empty", () => {
    renderHook(() => useReviews({ resourceType: "restaurant", resourceId: "" }));

    expect(useInfiniteQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it("configures the stats query only for restaurant resource type", () => {
    renderHook(() => useReviews(defaultParams));

    const statsCall = useQueryMock.mock.calls.find(
      ([config]: [{ queryKey: string[] }]) =>
        JSON.stringify(config.queryKey) ===
        JSON.stringify(reviewKeys.stats("restaurant", "rest1"))
    );
    expect(statsCall).toBeDefined();
    expect(statsCall[0].enabled).toBe(true);
  });

  it("does not enable the stats query for non-restaurant resource types", () => {
    renderHook(() => useReviews({ resourceType: "recipe", resourceId: "rec1" }));

    const statsCall = useQueryMock.mock.calls.find(
      ([cfg]: [{ enabled: boolean; queryKey: string[] }]) =>
        cfg.queryKey?.[1] === "stats"
    );
    expect(statsCall?.[0].enabled).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Return shape
  // -------------------------------------------------------------------------
  it("flattens infinite pages into the reviews array", () => {
    stubInfiniteQuery([[mockReview], [{ ...mockReview, _id: "rev2" }]]);

    const { result } = renderHook(() => useReviews(defaultParams));

    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.reviews[0]._id).toBe("rev1");
    expect(result.current.reviews[1]._id).toBe("rev2");
  });

  it("returns reviews=[] when no data is available", () => {
    useInfiniteQueryMock.mockReturnValue({
      data: undefined,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.reviews).toEqual([]);
  });

  it("exposes loading=true when isFetching is true", () => {
    useInfiniteQueryMock.mockReturnValue({
      data: undefined,
      isFetching: true,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.loading).toBe(true);
  });

  it("exposes error string from the list query", () => {
    useInfiniteQueryMock.mockReturnValue({
      data: undefined,
      isFetching: false,
      error: new Error("fetch error"),
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.error).toBe("fetch error");
  });

  it("exposes error=null when there is no error", () => {
    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.error).toBeNull();
  });

  it("reflects hasMore from hasNextPage", () => {
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [[mockReview]], pageParams: [1] },
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: true,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.hasMore).toBe(true);
  });

  it("returns totalReviews equal to flattened reviews length", () => {
    stubInfiniteQuery([[mockReview, { ...mockReview, _id: "rev2" }]]);

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.totalReviews).toBe(2);
  });

  it("returns server stats for restaurant resource type", () => {
    useQueryMock.mockReturnValue({ data: mockStats, isLoading: false, error: null });

    const { result } = renderHook(() => useReviews(defaultParams));
    expect(result.current.stats).toEqual(mockStats);
  });

  it("derives stats client-side for non-restaurant resource types", () => {
    stubInfiniteQuery([[
      { ...mockReview, rating: 5 },
      { ...mockReview, _id: "rev2", rating: 3 },
    ]]);
    useQueryMock.mockReturnValue({ data: null, isLoading: false, error: null });

    const { result } = renderHook(() =>
      useReviews({ resourceType: "recipe", resourceId: "rec1" })
    );

    expect(result.current.stats?.averageRating).toBe(4); // (5+3)/2
    expect(result.current.stats?.totalReviews).toBe(2);
    expect(result.current.stats?.ratingDistribution[5]).toBe(1);
    expect(result.current.stats?.ratingDistribution[3]).toBe(1);
  });

  it("returns stats=null for non-restaurant with no reviews", () => {
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [[]], pageParams: [1] },
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
    });

    const { result } = renderHook(() =>
      useReviews({ resourceType: "recipe", resourceId: "rec1" })
    );
    expect(result.current.stats).toBeNull();
  });

  // -------------------------------------------------------------------------
  // refetch / loadMore
  // -------------------------------------------------------------------------
  it("refetch delegates to the TanStack refetch function", async () => {
    const refetchFn = jest.fn().mockResolvedValue(undefined);
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [[mockReview]], pageParams: [1] },
      isFetching: false,
      error: null,
      refetch: refetchFn,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    await act(async () => { await result.current.refetch(); });

    expect(refetchFn).toHaveBeenCalled();
  });

  it("loadMore calls fetchNextPage when hasMore is true and not fetching", async () => {
    const fetchNextPage = jest.fn().mockResolvedValue(undefined);
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [[mockReview]], pageParams: [1] },
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage,
      hasNextPage: true,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    await act(async () => { await result.current.loadMore(); });

    expect(fetchNextPage).toHaveBeenCalled();
  });

  it("loadMore does nothing when hasMore is false", async () => {
    const fetchNextPage = jest.fn();
    useInfiniteQueryMock.mockReturnValue({
      data: { pages: [[mockReview]], pageParams: [1] },
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage,
      hasNextPage: false,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    await act(async () => { await result.current.loadMore(); });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("loadMore does nothing when isFetching is true", async () => {
    const fetchNextPage = jest.fn();
    useInfiniteQueryMock.mockReturnValue({
      data: undefined,
      isFetching: true,
      error: null,
      refetch: jest.fn(),
      fetchNextPage,
      hasNextPage: true,
    });

    const { result } = renderHook(() => useReviews(defaultParams));
    await act(async () => { await result.current.loadMore(); });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // addReview
  // -------------------------------------------------------------------------
  it("addReview throws when not authenticated", async () => {
    const { result } = renderHook(() =>
      useReviews({ ...defaultParams, autoFetch: false })
    );

    await expect(result.current.addReview({ rating: 5, comment: "Great!" })).rejects.toThrow(
      "Debes iniciar sesión para crear una review"
    );
  });

  it("addReview calls createRestaurantReview and returns the new review", async () => {
    setAuthenticated();
    (reviewsApi.createRestaurantReview as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReviews(defaultParams));
    let newReview: unknown;
    await act(async () => {
      newReview = await result.current.addReview({ rating: 4, comment: "Great place!" });
    });

    expect(reviewsApi.createRestaurantReview).toHaveBeenCalledWith("rest1", {
      rating: 4,
      comment: "Great place!",
    });
    expect(newReview).toEqual(mockReview);
  });

  it("addReview propagates API errors", async () => {
    setAuthenticated();
    (reviewsApi.createRestaurantReview as jest.Mock).mockRejectedValue(new Error("create error"));

    const { result } = renderHook(() => useReviews(defaultParams));
    await expect(
      act(async () => { await result.current.addReview({ rating: 4, comment: "test" }); })
    ).rejects.toThrow("create error");
  });

  // -------------------------------------------------------------------------
  // updateReview
  // -------------------------------------------------------------------------
  it("updateReview throws when not authenticated", async () => {
    const { result } = renderHook(() =>
      useReviews({ ...defaultParams, autoFetch: false })
    );

    await expect(result.current.updateReview("rev1", { comment: "updated" })).rejects.toThrow(
      "Debes iniciar sesión para actualizar una review"
    );
  });

  it("updateReview calls updateReviewApi and returns updated review", async () => {
    setAuthenticated();
    const updatedReview = { ...mockReview, comment: "updated" };
    (reviewsApi.updateReview as jest.Mock).mockResolvedValue({ data: updatedReview });

    const { result } = renderHook(() => useReviews(defaultParams));
    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateReview("rev1", { comment: "updated" });
    });

    expect(reviewsApi.updateReview).toHaveBeenCalledWith("rev1", { comment: "updated" });
    expect(updated).toEqual(updatedReview);
  });

  // -------------------------------------------------------------------------
  // deleteReview
  // -------------------------------------------------------------------------
  it("deleteReview throws when not authenticated", async () => {
    const { result } = renderHook(() =>
      useReviews({ ...defaultParams, autoFetch: false })
    );

    await expect(result.current.deleteReview("rev1")).rejects.toThrow(
      "Debes iniciar sesión para eliminar una review"
    );
  });

  it("deleteReview calls deleteReviewApi and returns true on success", async () => {
    setAuthenticated();
    (reviewsApi.deleteReview as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useReviews(defaultParams));
    let success: unknown;
    await act(async () => {
      success = await result.current.deleteReview("rev1");
    });

    expect(reviewsApi.deleteReview).toHaveBeenCalledWith("rev1");
    expect(success).toBe(true);
  });

  // -------------------------------------------------------------------------
  // toggleHelpful
  // -------------------------------------------------------------------------
  it("toggleHelpful throws when not authenticated", async () => {
    const { result } = renderHook(() =>
      useReviews({ ...defaultParams, autoFetch: false })
    );

    await expect(result.current.toggleHelpful("rev1", true)).rejects.toThrow(
      "Debes iniciar sesión para votar"
    );
  });

  it("toggleHelpful calls markReviewHelpful when isHelpful=true", async () => {
    setAuthenticated();
    const updatedReview = { ...mockReview, helpfulCount: 1 };
    (reviewsApi.markReviewHelpful as jest.Mock).mockResolvedValue({ data: updatedReview });

    const { result } = renderHook(() => useReviews(defaultParams));
    let isHelpful: boolean | undefined;
    await act(async () => {
      isHelpful = await result.current.toggleHelpful("rev1", true);
    });

    expect(reviewsApi.markReviewHelpful).toHaveBeenCalledWith("rev1");
    expect(isHelpful).toBe(true);
  });

  it("toggleHelpful calls removeReviewHelpful when isHelpful=false", async () => {
    setAuthenticated();
    (reviewsApi.removeReviewHelpful as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReviews(defaultParams));
    await act(async () => {
      await result.current.toggleHelpful("rev1", false);
    });

    expect(reviewsApi.removeReviewHelpful).toHaveBeenCalledWith("rev1");
  });

  it("toggleHelpful returns false and swallows errors when API call fails", async () => {
    setAuthenticated();
    (reviewsApi.markReviewHelpful as jest.Mock).mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useReviews(defaultParams));
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.toggleHelpful("rev1", true);
    });

    expect(outcome).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Query fn integration — verify queryFn / getNextPageParam logic
  // -------------------------------------------------------------------------
  it("infinite query fn calls getRestaurantReviews with page param and limit", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockResolvedValue({ data: [mockReview] });

    renderHook(() => useReviews({ ...defaultParams, limit: 5 }));

    const [[config]] = useInfiniteQueryMock.mock.calls;
    await config.queryFn({ pageParam: 2 });

    expect(reviewsApi.getRestaurantReviews).toHaveBeenCalledWith("rest1", {
      page: 2,
      limit: 5,
    });
  });

  it("stats query fn calls getRestaurantReviewStats", async () => {
    (reviewsApi.getRestaurantReviewStats as jest.Mock).mockResolvedValue({ data: mockStats });

    renderHook(() => useReviews(defaultParams));

    const statsCallConfig = useQueryMock.mock.calls.find(
      ([cfg]: [{ queryKey: string[] }]) => cfg.queryKey?.[1] === "stats"
    )?.[0];

    expect(statsCallConfig).toBeDefined();
    await statsCallConfig.queryFn();
    expect(reviewsApi.getRestaurantReviewStats).toHaveBeenCalledWith("rest1");
  });

  it("getNextPageParam returns next page when last page is full", () => {
    renderHook(() => useReviews({ ...defaultParams, limit: 2 }));

    const [[config]] = useInfiniteQueryMock.mock.calls;
    const fullPage = [mockReview, { ...mockReview, _id: "rev2" }];
    expect(config.getNextPageParam(fullPage, [], 1)).toBe(2);
  });

  it("getNextPageParam returns undefined when last page is not full", () => {
    renderHook(() => useReviews({ ...defaultParams, limit: 10 }));

    const [[config]] = useInfiniteQueryMock.mock.calls;
    expect(config.getNextPageParam([mockReview], [], 1)).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Cache invalidation on mutations
  // -------------------------------------------------------------------------
  it("addReview mutation invalidates list and stats queries on success", () => {
    setAuthenticated();
    const { invalidateQueries } = stubMutations();

    renderHook(() => useReviews(defaultParams));

    // Grab the first mutation config (addReview)
    const addMutationConfig = useMutationMock.mock.calls[0][0];
    addMutationConfig.onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: reviewKeys.list("restaurant", "rest1"),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: reviewKeys.stats("restaurant", "rest1"),
    });
  });
});

// ---------------------------------------------------------------------------
// useReview
// ---------------------------------------------------------------------------
describe("useReview", () => {
  it("configures the detail query with the reviewId key", () => {
    renderHook(() => useReview("rev1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: reviewKeys.detail("rev1"),
        enabled: true,
      })
    );
  });

  it("sets enabled=false when reviewId is empty", () => {
    renderHook(() => useReview(""));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it("returns the review from query data", () => {
    useQueryMock.mockReturnValue({ data: mockReview, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));

    expect(result.current.review).toEqual(mockReview);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns review=null when query data is undefined", () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));
    expect(result.current.review).toBeNull();
  });

  it("returns loading=true when isLoading is true", () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));
    expect(result.current.loading).toBe(true);
  });

  it("returns error string from query error", () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
    });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));
    expect(result.current.error).toBe("not found");
  });

  it("detail query fn calls getReview with the review id", async () => {
    (reviewsApi.getReview as jest.Mock).mockResolvedValue({ data: mockReview });
    stubMutations();

    renderHook(() => useReview("rev1"));

    const [[config]] = useQueryMock.mock.calls;
    await config.queryFn();

    expect(reviewsApi.getReview).toHaveBeenCalledWith("rev1");
  });

  it("updateReview throws when not authenticated", async () => {
    useQueryMock.mockReturnValue({ data: mockReview, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));

    await expect(result.current.updateReview({ comment: "new comment" })).rejects.toThrow(
      "Debes iniciar sesión para actualizar una review"
    );
  });

  it("updateReview calls updateReviewApi and returns updated review", async () => {
    setAuthenticated();
    const updatedReview = { ...mockReview, comment: "updated" };
    (reviewsApi.updateReview as jest.Mock).mockResolvedValue({ data: updatedReview });
    useQueryMock.mockReturnValue({ data: mockReview, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));
    let updated: unknown;
    await act(async () => {
      updated = await result.current.updateReview({ comment: "updated" });
    });

    expect(reviewsApi.updateReview).toHaveBeenCalledWith("rev1", { comment: "updated" });
    expect(updated).toEqual(updatedReview);
  });

  it("deleteReview throws when not authenticated", async () => {
    useQueryMock.mockReturnValue({ data: mockReview, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));

    await expect(result.current.deleteReview()).rejects.toThrow(
      "Debes iniciar sesión para eliminar una review"
    );
  });

  it("deleteReview calls deleteReviewApi and returns true on success", async () => {
    setAuthenticated();
    (reviewsApi.deleteReview as jest.Mock).mockResolvedValue({});
    useQueryMock.mockReturnValue({ data: mockReview, isLoading: false, error: null });
    stubMutations();

    const { result } = renderHook(() => useReview("rev1"));
    let success: unknown;
    await act(async () => {
      success = await result.current.deleteReview();
    });

    expect(reviewsApi.deleteReview).toHaveBeenCalledWith("rev1");
    expect(success).toBe(true);
  });
});
