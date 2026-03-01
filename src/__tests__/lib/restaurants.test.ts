import {
  getRestaurants,
  getRestaurant,
  getTopRatedRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addRestaurantReview,
  getNearbyRestaurants,
  getRestaurantsByCuisine,
  getAdvancedRestaurants,
  CreateRestaurantData,
} from "@/lib/api/restaurants";
import { API_CONFIG } from "@/lib/api/config";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

const sampleRestaurant: CreateRestaurantData = {
  restaurantName: "Leafy Greens Bistro",
  address: "789 Plant St",
  contact: [{ phone: "555-0300", facebook: "https://facebook.com/leafy", instagram: "https://instagram.com/leafy" }],
  cuisine: ["Vegan", "Mediterranean"],
};

// ---------------------------------------------------------------------------
describe("getRestaurants", () => {
  it("returns backend data when fetch succeeds with no params", async () => {
    const payload = { success: true, data: [] };
    mockOkJson(payload);

    const result = await getRestaurants();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${BASE}/restaurants`),
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("appends all scalar query params to the URL", async () => {
    mockOkJson({ success: true, data: [] });

    await getRestaurants({
      page: 2,
      limit: 5,
      search: "sushi",
      cuisine: "Asian",
      rating: 4,
      location: "Manhattan",
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=5");
    expect(url).toContain("search=sushi");
    expect(url).toContain("cuisine=Asian");
    expect(url).toContain("rating=4");
    expect(url).toContain("location=Manhattan");
  });

  it("appends geospatial and sortBy params", async () => {
    mockOkJson({ success: true, data: [] });

    await getRestaurants({ latitude: 40.71, longitude: -74.0, radius: 5, sortBy: "distance" });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("radius=5");
    expect(url).toContain("sortBy=distance");
  });

  it("falls back to mock data on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await getRestaurants();

    // The function catches errors and returns mock data
    expect(result).toMatchObject({ success: true });
    expect(Array.isArray((result as { data: unknown[] }).data)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe("getRestaurant", () => {
  it("fetches a single restaurant by id", async () => {
    const payload = { success: true, data: { _id: "r1", restaurantName: "Bistro" } };
    mockOkJson(payload);

    const result = await getRestaurant("r1");

    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/restaurants/r1`, expect.any(Object));
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Restaurant not found");

    await expect(getRestaurant("missing")).rejects.toThrow("Restaurant not found");
  });
});

// ---------------------------------------------------------------------------
describe("getTopRatedRestaurants", () => {
  it("calls /restaurants/top-rated with default limit of 10", async () => {
    mockOkJson({ success: true, data: [] });

    await getTopRatedRestaurants();

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/restaurants/top-rated");
    expect(url).toContain("limit=10");
  });

  it("accepts a custom limit", async () => {
    mockOkJson({ success: true, data: [] });

    await getTopRatedRestaurants(5);

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("limit=5");
  });
});

// ---------------------------------------------------------------------------
describe("createRestaurant", () => {
  it("sends POST to /restaurants with JSON body and auth header", async () => {
    const payload = { success: true, data: { _id: "new1", ...sampleRestaurant } };
    mockOkJson(payload);

    const result = await createRestaurant(sampleRestaurant, "my-token");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/restaurants`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toMatchObject({ restaurantName: "Leafy Greens Bistro" });
    expect(options.headers).toMatchObject({ Authorization: "Bearer my-token" });
    expect(result).toEqual(payload);
  });

  it("omits auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await createRestaurant(sampleRestaurant);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on server error", async () => {
    mockError(422, "Validation failed");

    await expect(createRestaurant(sampleRestaurant, "tok")).rejects.toThrow("Validation failed");
  });
});

// ---------------------------------------------------------------------------
describe("updateRestaurant", () => {
  it("sends PUT to /restaurants/:id with partial data", async () => {
    mockOkJson({ success: true, data: { _id: "r1", restaurantName: "New Name" } });

    const result = await updateRestaurant("r1", { restaurantName: "New Name" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/restaurants/r1`);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body as string)).toEqual({ restaurantName: "New Name" });
    expect(result).toBeDefined();
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: {} });

    await updateRestaurant("r1", { cuisine: ["Italian"] });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });
});

// ---------------------------------------------------------------------------
describe("deleteRestaurant", () => {
  it("sends DELETE to /restaurants/:id with auth header", async () => {
    mockOkJson({ success: true, data: null });

    await deleteRestaurant("r1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/restaurants/r1`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not found");

    await expect(deleteRestaurant("r99", "tok")).rejects.toThrow("Not found");
  });
});

// ---------------------------------------------------------------------------
describe("addRestaurantReview", () => {
  it("sends POST to /restaurants/add-review/:id", async () => {
    const payload = { success: true, data: { _id: "r1" } };
    mockOkJson(payload);

    const result = await addRestaurantReview("r1", { rating: 5, comment: "Amazing food!" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/restaurants/add-review/r1`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5, comment: "Amazing food!" });
    expect(result).toEqual(payload);
  });

  it("sends without token when not provided", async () => {
    mockOkJson({ success: true, data: {} });

    await addRestaurantReview("r1", { rating: 4, comment: "Really good food." });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });
});

// ---------------------------------------------------------------------------
describe("getNearbyRestaurants", () => {
  it("calls /restaurants with geo params and sortBy=distance", async () => {
    mockOkJson({ success: true, data: [] });

    await getNearbyRestaurants({ latitude: 40.71, longitude: -74.0 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("sortBy=distance");
  });

  it("appends optional cuisine and minRating params", async () => {
    mockOkJson({ success: true, data: [] });

    await getNearbyRestaurants({
      latitude: 40.71,
      longitude: -74.0,
      radius: 3,
      limit: 10,
      cuisine: "Thai",
      minRating: 4,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("radius=3");
    expect(url).toContain("limit=10");
    expect(url).toContain("cuisine=Thai");
    expect(url).toContain("rating=4");
  });

  it("falls back to mock data on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Offline"));

    const result = await getNearbyRestaurants({ latitude: 0, longitude: 0 });

    expect(result).toMatchObject({ success: true });
  });
});

// ---------------------------------------------------------------------------
describe("getRestaurantsByCuisine", () => {
  it("calls /restaurants with the cuisine filter", async () => {
    mockOkJson({ success: true, data: [] });

    await getRestaurantsByCuisine("Italian");

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("cuisine=Italian");
  });

  it("appends sortBy=distance when both lat and lng are provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getRestaurantsByCuisine("Thai", { latitude: 40.71, longitude: -74.0 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("sortBy=distance");
  });

  it("falls back to mock data on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Offline"));

    const result = await getRestaurantsByCuisine("Mexican");

    expect(result).toMatchObject({ success: true });
  });
});

// ---------------------------------------------------------------------------
describe("getAdvancedRestaurants", () => {
  it("builds a URL with all advanced params", async () => {
    mockOkJson({ success: true, data: [] });

    await getAdvancedRestaurants({
      page: 1,
      limit: 5,
      search: "vegan",
      cuisine: ["Italian", "Mexican"],
      minRating: 3,
      latitude: 40.71,
      longitude: -74.0,
      radius: 8,
      sortBy: "rating",
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=1");
    expect(url).toContain("limit=5");
    expect(url).toContain("search=vegan");
    expect(url).toContain("rating=3");
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("radius=8");
    expect(url).toContain("sortBy=rating");
    // cuisine array should appear twice
    const raw = url as string;
    expect(raw.split("cuisine=").length - 1).toBe(2);
  });

  it("handles empty cuisine array gracefully", async () => {
    mockOkJson({ success: true, data: [] });

    await getAdvancedRestaurants({ cuisine: [] });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("cuisine=");
  });

  it("falls back to mock data on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Offline"));

    const result = await getAdvancedRestaurants({});

    expect(result).toMatchObject({ success: true });
  });
});
