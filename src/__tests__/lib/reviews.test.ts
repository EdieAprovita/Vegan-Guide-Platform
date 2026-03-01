import {
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  removeReviewHelpful,
  getRestaurantReviews,
  getRestaurantReviewStats,
  createRestaurantReview,
} from "@/lib/api/reviews";
import { API_CONFIG } from "@/lib/api/config";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

// ---------------------------------------------------------------------------
describe("getReview", () => {
  it("fetches a single review by id", async () => {
    const payload = { success: true, data: { _id: "rv1", rating: 5, comment: "Excellent!" } };
    mockOkJson(payload);

    const result = await getReview("rv1");

    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/reviews/rv1`, expect.any(Object));
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Review not found");

    await expect(getReview("missing")).rejects.toThrow("Review not found");
  });
});

// ---------------------------------------------------------------------------
describe("updateReview", () => {
  it("sends PUT to /reviews/:id with partial data and auth header", async () => {
    const payload = { success: true, data: { _id: "rv1", rating: 4 } };
    mockOkJson(payload);

    const result = await updateReview("rv1", { rating: 4, comment: "Updated comment." }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/reviews/rv1`);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 4, comment: "Updated comment." });
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(result).toEqual(payload);
  });

  it("omits auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await updateReview("rv1", { rating: 3 });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(403, "Forbidden");

    await expect(updateReview("rv1", { rating: 5 }, "tok")).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
describe("deleteReview", () => {
  it("sends DELETE to /reviews/:id with auth header", async () => {
    mockOkJson({ success: true, data: null });

    await deleteReview("rv1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/reviews/rv1`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: null });

    await deleteReview("rv1");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not found");

    await expect(deleteReview("rv99", "tok")).rejects.toThrow("Not found");
  });
});

// ---------------------------------------------------------------------------
describe("markReviewHelpful", () => {
  it("sends POST to /reviews/:id/helpful with auth header", async () => {
    const payload = { success: true, data: { _id: "rv1", helpfulCount: 3 } };
    mockOkJson(payload);

    const result = await markReviewHelpful("rv1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/reviews/rv1/helpful`);
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(result).toEqual(payload);
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: {} });

    await markReviewHelpful("rv1");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(409, "Already marked helpful");

    await expect(markReviewHelpful("rv1", "tok")).rejects.toThrow("Already marked helpful");
  });
});

// ---------------------------------------------------------------------------
describe("removeReviewHelpful", () => {
  it("sends DELETE to /reviews/:id/helpful with auth header", async () => {
    const payload = { success: true, data: { _id: "rv1", helpfulCount: 2 } };
    mockOkJson(payload);

    const result = await removeReviewHelpful("rv1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/reviews/rv1/helpful`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(result).toEqual(payload);
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: {} });

    await removeReviewHelpful("rv1");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });
});

// ---------------------------------------------------------------------------
describe("getRestaurantReviews", () => {
  it("fetches reviews for a restaurant by id", async () => {
    const payload = { success: true, data: [{ _id: "rv1", rating: 4 }] };
    mockOkJson(payload);

    const result = await getRestaurantReviews("rest1");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${BASE}/restaurants/rest1/reviews`),
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("appends pagination params when provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getRestaurantReviews("rest1", { page: 2, limit: 5 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=5");
  });

  it("throws on non-ok response", async () => {
    mockError(500, "Server error");

    await expect(getRestaurantReviews("rest1")).rejects.toThrow("Server error");
  });
});

// ---------------------------------------------------------------------------
describe("getRestaurantReviewStats", () => {
  it("fetches review stats for a restaurant", async () => {
    const payload = {
      success: true,
      data: { averageRating: 4.5, totalReviews: 10, ratingDistribution: { 5: 7, 4: 3 } },
    };
    mockOkJson(payload);

    const result = await getRestaurantReviewStats("rest1");

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/restaurants/rest1/reviews/stats`,
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Stats not found");

    await expect(getRestaurantReviewStats("missing")).rejects.toThrow("Stats not found");
  });
});

// ---------------------------------------------------------------------------
describe("createRestaurantReview", () => {
  it("sends POST to /restaurants/:id/reviews with review data and auth header", async () => {
    const payload = { success: true, data: { _id: "rv2", rating: 5 } };
    mockOkJson(payload);

    const result = await createRestaurantReview(
      "rest1",
      { rating: 5, comment: "Best vegan food!" },
      "tok"
    );

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/restaurants/rest1/reviews`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5, comment: "Best vegan food!" });
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
    expect(result).toEqual(payload);
  });

  it("sends without auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await createRestaurantReview("rest1", { rating: 3, comment: "Decent food here." });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on server error", async () => {
    mockError(400, "Invalid review data");

    await expect(
      createRestaurantReview("rest1", { rating: 0, comment: "x" }, "tok")
    ).rejects.toThrow("Invalid review data");
  });
});
