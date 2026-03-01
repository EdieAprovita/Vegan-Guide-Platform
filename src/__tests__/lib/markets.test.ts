import {
  getMarkets,
  getMarket,
  createMarket,
  updateMarket,
  deleteMarket,
  addMarketReview,
  getNearbyMarkets,
  getMarketsByProducts,
  getAdvancedMarkets,
  CreateMarketData,
} from "@/lib/api/markets";
import { API_CONFIG } from "@/lib/api/config";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

const sampleMarket: CreateMarketData = {
  marketName: "Green Farmers Market",
  address: "456 Organic Ave",
  contact: [{ phone: "555-0200", email: "hello@greenmarket.com" }],
  products: ["vegetables", "fruits"],
  hours: [{ day: "Saturday", open: "08:00", close: "14:00" }],
};

// ---------------------------------------------------------------------------
describe("getMarkets", () => {
  it("calls /markets with an empty query string when no params are provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarkets();

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/markets?`);
  });

  it("appends all scalar params to the URL", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarkets({
      page: 2,
      limit: 10,
      search: "organic",
      products: "vegetables",
      rating: 4,
      location: "Brooklyn",
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
    expect(url).toContain("search=organic");
    expect(url).toContain("products=vegetables");
    expect(url).toContain("rating=4");
    expect(url).toContain("location=Brooklyn");
  });

  it("appends geospatial and sort params", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarkets({ latitude: 40.71, longitude: -74.0, radius: 3, sortBy: "distance" });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("radius=3");
    expect(url).toContain("sortBy=distance");
  });

  it("propagates fetch errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

    await expect(getMarkets()).rejects.toThrow("Network failure");
  });
});

// ---------------------------------------------------------------------------
describe("getMarket", () => {
  it("fetches a single market by id", async () => {
    const payload = { success: true, data: { _id: "m1", marketName: "Green Market" } };
    mockOkJson(payload);

    const result = await getMarket("m1");

    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/markets/m1`, expect.any(Object));
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Market not found");

    await expect(getMarket("missing")).rejects.toThrow("Market not found");
  });
});

// ---------------------------------------------------------------------------
describe("createMarket", () => {
  it("sends POST to /markets with JSON body and auth header", async () => {
    const payload = { success: true, data: { _id: "new1", ...sampleMarket } };
    mockOkJson(payload);

    const result = await createMarket(sampleMarket, "my-token");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/markets`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toMatchObject({ marketName: "Green Farmers Market" });
    expect(options.headers).toMatchObject({ Authorization: "Bearer my-token" });
    expect(result).toEqual(payload);
  });

  it("omits auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await createMarket(sampleMarket);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on server error", async () => {
    mockError(422, "Validation failed");

    await expect(createMarket(sampleMarket, "tok")).rejects.toThrow("Validation failed");
  });
});

// ---------------------------------------------------------------------------
describe("updateMarket", () => {
  it("sends PUT to /markets/:id with partial data", async () => {
    mockOkJson({ success: true, data: { _id: "m1", marketName: "Updated Name" } });

    const result = await updateMarket("m1", { marketName: "Updated Name" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/markets/m1`);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body as string)).toEqual({ marketName: "Updated Name" });
    expect(result).toMatchObject({ data: { marketName: "Updated Name" } });
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: {} });

    await updateMarket("m1", { products: ["herbs"] });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(403, "Forbidden");

    await expect(updateMarket("m1", {}, "tok")).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
describe("deleteMarket", () => {
  it("sends DELETE to /markets/:id with auth header", async () => {
    mockOkJson({ success: true, data: null });

    await deleteMarket("m1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/markets/m1`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not found");

    await expect(deleteMarket("m99", "tok")).rejects.toThrow("Not found");
  });
});

// ---------------------------------------------------------------------------
describe("addMarketReview", () => {
  it("sends POST to /markets/add-review/:id", async () => {
    const payload = { success: true, data: { _id: "m1" } };
    mockOkJson(payload);

    const result = await addMarketReview("m1", { rating: 5, comment: "Fresh produce!" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/markets/add-review/m1`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5, comment: "Fresh produce!" });
    expect(result).toEqual(payload);
  });

  it("sends without token when not provided", async () => {
    mockOkJson({ success: true, data: {} });

    await addMarketReview("m1", { rating: 4, comment: "Good selection." });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });
});

// ---------------------------------------------------------------------------
describe("getNearbyMarkets", () => {
  it("calls /markets with geo params and sortBy=distance", async () => {
    mockOkJson({ success: true, data: [] });

    await getNearbyMarkets({ latitude: 40.71, longitude: -74.0 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("sortBy=distance");
  });

  it("appends optional params when provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getNearbyMarkets({
      latitude: 40.71,
      longitude: -74.0,
      radius: 10,
      limit: 5,
      products: "fruits",
      minRating: 4,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("radius=10");
    expect(url).toContain("limit=5");
    expect(url).toContain("products=fruits");
    expect(url).toContain("rating=4");
  });
});

// ---------------------------------------------------------------------------
describe("getMarketsByProducts", () => {
  it("calls /markets with the products filter", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarketsByProducts("herbs");

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("products=herbs");
  });

  it("appends sortBy=distance when lat and lng are both provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarketsByProducts("vegetables", { latitude: 40.71, longitude: -74.0 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("sortBy=distance");
  });

  it("does not append sortBy when only one coordinate is provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getMarketsByProducts("spices", { latitude: 40.71 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("sortBy=");
  });
});

// ---------------------------------------------------------------------------
describe("getAdvancedMarkets", () => {
  it("builds a URL with all advanced params", async () => {
    mockOkJson({ success: true, data: [] });

    await getAdvancedMarkets({
      page: 1,
      limit: 5,
      search: "organic",
      products: ["vegetables", "fruits"],
      minRating: 3,
      latitude: 40.71,
      longitude: -74.0,
      radius: 8,
      sortBy: "rating",
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=1");
    expect(url).toContain("limit=5");
    expect(url).toContain("search=organic");
    expect(url).toContain("rating=3");
    expect(url).toContain("latitude=40.71");
    expect(url).toContain("longitude=-74");
    expect(url).toContain("radius=8");
    expect(url).toContain("sortBy=rating");
    // products are appended multiple times
    const raw = url as string;
    expect(raw.split("products=").length - 1).toBe(2);
  });

  it("handles empty products array gracefully", async () => {
    mockOkJson({ success: true, data: [] });

    await getAdvancedMarkets({ products: [] });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("products=");
  });
});
