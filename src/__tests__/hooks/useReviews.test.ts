import { renderHook, act, waitFor } from "@testing-library/react";
import { useReviews, useReview } from "@/hooks/useReviews";
import * as reviewsApi from "@/lib/api/reviews";

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

// Mock next-auth/react so we can control isAuthenticated as a simple value
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

import { useSession } from "next-auth/react";
const useSessionMock = useSession as unknown as jest.Mock;

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

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

const setUnauthenticated = () => {
  useSessionMock.mockReturnValue({ data: null, status: "unauthenticated" });
};

const setAuthenticated = () => {
  useSessionMock.mockReturnValue({
    data: { user: { id: "user-1", name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  });
};

beforeEach(() => {
  setUnauthenticated();
  jest.clearAllMocks();
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe("useReviews", () => {
  const defaultParams = {
    resourceType: "restaurant",
    resourceId: "rest1",
  };

  it("auto-fetches reviews on mount and sets state", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockResolvedValue({
      data: [mockReview],
    });
    // Stats will also be fetched when reviews change
    (reviewsApi.getRestaurantReviewStats as jest.Mock).mockResolvedValue({
      data: mockStats,
    });

    const { result } = renderHook(() => useReviews(defaultParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(reviewsApi.getRestaurantReviews).toHaveBeenCalledWith("rest1", { page: 1, limit: 10 });
    expect(result.current.reviews).toEqual([mockReview]);
    expect(result.current.error).toBeNull();
  });

  it("does not auto-fetch when autoFetch is false", async () => {
    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await act(async () => {});

    expect(reviewsApi.getRestaurantReviews).not.toHaveBeenCalled();
    expect(result.current.reviews).toEqual([]);
  });

  it("does not fetch when resourceId is empty", async () => {
    renderHook(() => useReviews({ resourceType: "restaurant", resourceId: "" }));

    await act(async () => {});

    expect(reviewsApi.getRestaurantReviews).not.toHaveBeenCalled();
  });

  it("sets error on fetch failure", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockRejectedValue(new Error("fetch error"));

    const { result } = renderHook(() => useReviews(defaultParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("fetch error");
  });

  it("refetch re-loads reviews from page 1", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockResolvedValue({ data: [mockReview] });
    (reviewsApi.getRestaurantReviewStats as jest.Mock).mockResolvedValue({ data: mockStats });

    const { result } = renderHook(() => useReviews(defaultParams));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = (reviewsApi.getRestaurantReviews as jest.Mock).mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect((reviewsApi.getRestaurantReviews as jest.Mock).mock.calls.length).toBeGreaterThan(
      callsBefore
    );
  });

  // loadMore calls fetchReviews with the next page when hasMore is true.
  // Use a small limit of 1 so one review sets hasMore=true (1 === 1).
  it("loadMore triggers a page 2 fetch when hasMore is true", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockResolvedValue({ data: [mockReview] }); // always return 1 item so hasMore stays true
    (reviewsApi.getRestaurantReviewStats as jest.Mock).mockResolvedValue({ data: mockStats });

    const { result } = renderHook(() => useReviews({ ...defaultParams, limit: 1 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.reviews.length).toBe(1);
    });

    // 1 result === limit of 1 → hasMore should be true
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    // loadMore should have called getRestaurantReviews with page: 2
    const allCalls = (reviewsApi.getRestaurantReviews as jest.Mock).mock.calls;
    const page2Call = allCalls.find(([, params]) => params.page === 2);
    expect(page2Call).toBeDefined();
  });

  it("addReview throws when not authenticated", async () => {
    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await expect(result.current.addReview({ rating: 5, comment: "Great!" })).rejects.toThrow(
      "Debes iniciar sesión para crear una review"
    );
  });

  it("addReview posts a review when authenticated and prepends it to the list", async () => {
    setAuthenticated();
    (reviewsApi.createRestaurantReview as jest.Mock).mockResolvedValue({ data: mockReview });
    (reviewsApi.getRestaurantReviewStats as jest.Mock).mockResolvedValue({ data: mockStats });

    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    let newReview: unknown;
    await act(async () => {
      newReview = await result.current.addReview({ rating: 4, comment: "Great place!" });
    });

    expect(reviewsApi.createRestaurantReview).toHaveBeenCalledWith("rest1", {
      rating: 4,
      comment: "Great place!",
    });
    expect(newReview).toEqual(mockReview);
    expect(result.current.reviews[0]).toEqual(mockReview);
    expect(result.current.totalReviews).toBe(1);
  });

  it("addReview sets error state when API fails", async () => {
    setAuthenticated();
    (reviewsApi.createRestaurantReview as jest.Mock).mockRejectedValue(new Error("create error"));

    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    let caughtError: unknown = null;
    await act(async () => {
      try {
        await result.current.addReview({ rating: 4, comment: "test" });
      } catch (e) {
        caughtError = e;
      }
    });

    expect((caughtError as Error)?.message).toBe("create error");
    expect(result.current.error).toBe("create error");
  });

  it("updateReview throws when not authenticated", async () => {
    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await expect(result.current.updateReview("rev1", { comment: "updated" })).rejects.toThrow(
      "Debes iniciar sesión para actualizar una review"
    );
  });

  it("deleteReview throws when not authenticated", async () => {
    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await expect(result.current.deleteReview("rev1")).rejects.toThrow(
      "Debes iniciar sesión para eliminar una review"
    );
  });

  it("toggleHelpful throws when not authenticated", async () => {
    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await expect(result.current.toggleHelpful("rev1", true)).rejects.toThrow(
      "Debes iniciar sesión para votar"
    );
  });

  it("toggleHelpful marks a review as helpful when authenticated", async () => {
    setAuthenticated();
    const updatedReview = { ...mockReview, helpfulCount: 1 };
    (reviewsApi.markReviewHelpful as jest.Mock).mockResolvedValue({ data: updatedReview });

    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    let isHelpful: boolean | undefined;
    await act(async () => {
      isHelpful = await result.current.toggleHelpful("rev1", true);
    });

    expect(reviewsApi.markReviewHelpful).toHaveBeenCalledWith("rev1");
    expect(isHelpful).toBe(true);
  });

  it("toggleHelpful removes helpful mark when isHelpful is false", async () => {
    setAuthenticated();
    (reviewsApi.removeReviewHelpful as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReviews({ ...defaultParams, autoFetch: false }));

    await act(async () => {
      await result.current.toggleHelpful("rev1", false);
    });

    expect(reviewsApi.removeReviewHelpful).toHaveBeenCalledWith("rev1");
  });

  it("calculates stats from reviews when resourceType is not restaurant", async () => {
    (reviewsApi.getRestaurantReviews as jest.Mock).mockResolvedValue({
      data: [
        { ...mockReview, rating: 5 },
        { ...mockReview, _id: "rev2", rating: 3 },
      ],
    });

    const { result } = renderHook(() => useReviews({ resourceType: "recipe", resourceId: "rec1" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Stats are calculated locally from reviews for non-restaurant types
    await waitFor(() => expect(result.current.stats).not.toBeNull());

    expect(result.current.stats?.averageRating).toBe(4); // (5+3)/2
    expect(result.current.stats?.totalReviews).toBe(2);
  });
});

describe("useReview", () => {
  it("fetches a review by id on mount", async () => {
    (reviewsApi.getReview as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReview("rev1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(reviewsApi.getReview).toHaveBeenCalledWith("rev1");
    expect(result.current.review).toEqual(mockReview);
    expect(result.current.error).toBeNull();
  });

  it("sets loading to false without fetching when reviewId is empty", async () => {
    const { result } = renderHook(() => useReview(""));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(reviewsApi.getReview).not.toHaveBeenCalled();
    expect(result.current.review).toBeNull();
  });

  it("sets error when getReview fails", async () => {
    (reviewsApi.getReview as jest.Mock).mockRejectedValue(new Error("not found"));

    const { result } = renderHook(() => useReview("rev1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("not found");
    expect(result.current.review).toBeNull();
  });

  it("updateReview throws when not authenticated", async () => {
    // useSession is mocked globally; setUnauthenticated is already applied in beforeEach
    (reviewsApi.getReview as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReview("rev1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.updateReview({ comment: "new comment" })).rejects.toThrow(
      "Debes iniciar sesión para actualizar una review"
    );
  });

  it("deleteReview throws when not authenticated", async () => {
    // useSession is mocked globally; setUnauthenticated is already applied in beforeEach
    (reviewsApi.getReview as jest.Mock).mockResolvedValue({ data: mockReview });

    const { result } = renderHook(() => useReview("rev1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.deleteReview()).rejects.toThrow(
      "Debes iniciar sesión para eliminar una review"
    );
  });
});
