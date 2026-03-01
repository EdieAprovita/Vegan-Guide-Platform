import {
  searchUnified,
  searchByResourceType,
  getSearchSuggestions,
  getPopularSearches,
  getSearchAggregations,
  saveSearchQuery,
} from "@/lib/api/search";
import { API_CONFIG } from "@/lib/api/config";
import { SearchParams } from "@/types/search";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

// ---------------------------------------------------------------------------
describe("searchUnified", () => {
  it("calls /search with no query string when no filters are set", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchUnified({});

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${BASE}/search`);
  });

  it("appends pagination params", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchUnified({ page: 2, limit: 20 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=20");
  });

  it("appends all filter params to the URL", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    const params: SearchParams = {
      filters: {
        query: "vegan",
        resourceTypes: ["restaurants", "markets"],
        location: "NYC",
        radius: 10,
        minRating: 4,
        sortBy: "rating",
      },
    };

    await searchUnified(params);

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("q=vegan");
    expect(url).toContain("types=restaurants%2Cmarkets");
    expect(url).toContain("location=NYC");
    expect(url).toContain("radius=10");
    expect(url).toContain("minRating=4");
    expect(url).toContain("sort=rating");
  });

  it("appends coordinate params when coordinates are provided", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchUnified({
      filters: {
        query: "cafe",
        coordinates: { latitude: 40.71, longitude: -74.0 },
      } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("lat=40.71");
    expect(url).toContain("lng=-74");
  });

  it("appends budget params when budget filter is provided", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchUnified({
      filters: {
        query: "market",
        budget: { min: 10, max: 100 },
      } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("budgetMin=10");
    expect(url).toContain("budgetMax=100");
  });

  it("appends date range params when dateRange filter is provided", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchUnified({
      filters: {
        query: "event",
        dateRange: { from: "2024-01-01", to: "2024-12-31" },
      } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("dateFrom=2024-01-01");
    expect(url).toContain("dateTo=2024-12-31");
  });

  it("throws on non-ok response", async () => {
    mockError(500, "Search service unavailable");

    await expect(searchUnified({ filters: { query: "vegan" } as SearchParams["filters"] })).rejects.toThrow(
      "Search service unavailable"
    );
  });
});

// ---------------------------------------------------------------------------
describe("searchByResourceType", () => {
  it("calls /search/:resourceType with query params", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchByResourceType("restaurants", {
      page: 1,
      limit: 5,
      filters: { query: "pasta" } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain(`${BASE}/search/restaurants`);
    expect(url).toContain("page=1");
    expect(url).toContain("limit=5");
    expect(url).toContain("q=pasta");
  });

  it("appends geo params when coordinates filter is provided", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchByResourceType("markets", {
      filters: {
        query: "organic",
        coordinates: { latitude: 51.5, longitude: -0.12 },
        radius: 5,
      } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("lat=51.5");
    expect(url).toContain("lng=-0.12");
    expect(url).toContain("radius=5");
  });

  it("appends budget params when budget is in filters", async () => {
    mockOkJson({ success: true, data: { results: [] } });

    await searchByResourceType("businesses", {
      filters: {
        query: "spa",
        budget: { min: 20, max: 80 },
      } as SearchParams["filters"],
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("budgetMin=20");
    expect(url).toContain("budgetMax=80");
  });

  it("throws on non-ok response", async () => {
    mockError(400, "Bad request");

    await expect(searchByResourceType("doctors", {})).rejects.toThrow("Bad request");
  });
});

// ---------------------------------------------------------------------------
describe("getSearchSuggestions", () => {
  it("calls /search/suggestions with the query and a limit of 10", async () => {
    const payload = { success: true, data: ["vegan sushi", "vegan ramen"] };
    mockOkJson(payload);

    const result = await getSearchSuggestions("vegan");

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/search/suggestions");
    expect(url).toContain("q=vegan");
    expect(url).toContain("limit=10");
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(503, "Service unavailable");

    await expect(getSearchSuggestions("test")).rejects.toThrow("Service unavailable");
  });
});

// ---------------------------------------------------------------------------
describe("getPopularSearches", () => {
  it("calls /search/popular", async () => {
    const payload = { success: true, data: ["vegan restaurants", "organic markets"] };
    mockOkJson(payload);

    const result = await getPopularSearches();

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/search/popular`,
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(500, "Internal server error");

    await expect(getPopularSearches()).rejects.toThrow("Internal server error");
  });
});

// ---------------------------------------------------------------------------
describe("getSearchAggregations", () => {
  it("calls /search/aggregations without params when no filters are given", async () => {
    const payload = { success: true, data: { resourceTypes: {}, locations: [], priceRanges: [], ratings: {} } };
    mockOkJson(payload);

    await getSearchAggregations();

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/search/aggregations");
  });

  it("appends filter params to the aggregations URL", async () => {
    mockOkJson({ success: true, data: {} });

    await getSearchAggregations({
      query: "vegan",
      resourceTypes: ["restaurants", "recipes"],
      location: "Berlin",
      radius: 20,
      coordinates: { latitude: 52.52, longitude: 13.4 },
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("q=vegan");
    expect(url).toContain("types=restaurants%2Crecipes");
    expect(url).toContain("location=Berlin");
    expect(url).toContain("radius=20");
    expect(url).toContain("lat=52.52");
    expect(url).toContain("lng=13.4");
  });
});

// ---------------------------------------------------------------------------
describe("saveSearchQuery", () => {
  it("sends POST to /search/analytics with query and resourceType", async () => {
    const payload = { success: true, data: undefined };
    mockOkJson(payload);

    const result = await saveSearchQuery("vegan restaurants", "restaurants", "my-token");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/search/analytics`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({
      query: "vegan restaurants",
      resourceType: "restaurants",
    });
    expect(options.headers).toMatchObject({ Authorization: "Bearer my-token" });
    expect(result).toEqual(payload);
  });

  it("omits auth header when no token provided", async () => {
    mockOkJson({ success: true, data: undefined });

    await saveSearchQuery("markets");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("sends without resourceType when it is undefined", async () => {
    mockOkJson({ success: true, data: undefined });

    await saveSearchQuery("recipes");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body as string);
    expect(body.query).toBe("recipes");
    expect(body.resourceType).toBeUndefined();
  });

  it("throws on non-ok response", async () => {
    mockError(401, "Unauthorized");

    await expect(saveSearchQuery("test", "recipes", "bad-token")).rejects.toThrow("Unauthorized");
  });
});
