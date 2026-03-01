import {
  getBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  addBusinessReview,
  getBusinessReviews,
  getBusinessesByProximity,
  searchBusinesses,
  CreateBusinessData,
} from "@/lib/api/businesses";
import { API_CONFIG } from "@/lib/api/config";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

const sampleBusiness: CreateBusinessData = {
  namePlace: "Vegan Market",
  address: "123 Green St",
  image: "https://example.com/img.jpg",
  contact: [{ phone: "555-0100", email: "info@veganmarket.com" }],
  budget: 50,
  typeBusiness: "market",
  hours: [{ dayOfWeek: "Monday", openTime: "09:00", closeTime: "18:00" }],
};

// ---------------------------------------------------------------------------
describe("getBusinesses", () => {
  it("calls /businesses without query string when no filters provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinesses();

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/businesses`);
  });

  it("appends scalar filter params to the URL", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinesses({
      page: 1,
      limit: 10,
      search: "cafe",
      typeBusiness: "restaurant",
      rating: 4,
      location: "NYC",
      budget: 30,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=1");
    expect(url).toContain("limit=10");
    expect(url).toContain("search=cafe");
    expect(url).toContain("typeBusiness=restaurant");
    expect(url).toContain("rating=4");
    expect(url).toContain("location=NYC");
    expect(url).toContain("budget=30");
  });

  it("appends geospatial params when lat and lng are provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinesses({ lat: 40.71, lng: -74.0, radius: 5 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("lat=40.71");
    expect(url).toContain("lng=-74");
    expect(url).toContain("radius=5");
  });

  it("does not append radius when lat/lng are missing", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinesses({ radius: 10 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).not.toContain("radius=");
  });

  it("propagates fetch errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

    await expect(getBusinesses()).rejects.toThrow("Network failure");
  });
});

// ---------------------------------------------------------------------------
describe("getBusiness", () => {
  it("fetches a single business by id", async () => {
    const payload = { success: true, data: { _id: "b1", namePlace: "Vegan Market" } };
    mockOkJson(payload);

    const result = await getBusiness("b1");

    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/businesses/b1`, expect.any(Object));
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Business not found");

    await expect(getBusiness("missing")).rejects.toThrow("Business not found");
  });
});

// ---------------------------------------------------------------------------
describe("createBusiness", () => {
  it("sends POST to /businesses with JSON body and auth header", async () => {
    const payload = { success: true, data: { _id: "new1", ...sampleBusiness } };
    mockOkJson(payload);

    const result = await createBusiness(sampleBusiness, "my-token");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/businesses`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toMatchObject({ namePlace: "Vegan Market" });
    expect(options.headers).toMatchObject({ Authorization: "Bearer my-token" });
    expect(result).toEqual(payload);
  });

  it("omits Authorization header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await createBusiness(sampleBusiness);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on server error", async () => {
    mockError(422, "Validation failed");

    await expect(createBusiness(sampleBusiness, "tok")).rejects.toThrow("Validation failed");
  });
});

// ---------------------------------------------------------------------------
describe("updateBusiness", () => {
  it("sends PUT to /businesses/:id with partial data", async () => {
    const payload = { success: true, data: { _id: "b1", namePlace: "New Name" } };
    mockOkJson(payload);

    const result = await updateBusiness("b1", { namePlace: "New Name" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/businesses/b1`);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body as string)).toEqual({ namePlace: "New Name" });
    expect(result).toEqual(payload);
  });

  it("works without token", async () => {
    mockOkJson({ success: true, data: {} });

    await updateBusiness("b1", { budget: 100 });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(403, "Forbidden");

    await expect(updateBusiness("b1", {}, "tok")).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
describe("deleteBusiness", () => {
  it("sends DELETE to /businesses/:id with auth header", async () => {
    mockOkJson({ success: true, data: null });

    await deleteBusiness("b1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/businesses/b1`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not found");

    await expect(deleteBusiness("b99", "tok")).rejects.toThrow("Not found");
  });
});

// ---------------------------------------------------------------------------
describe("addBusinessReview", () => {
  it("sends POST to /businesses/:id/reviews with review payload", async () => {
    const payload = { success: true, data: { _id: "b1" } };
    mockOkJson(payload);

    const result = await addBusinessReview("b1", { rating: 5, comment: "Great place!" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/businesses/b1/reviews`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5, comment: "Great place!" });
    expect(result).toEqual(payload);
  });

  it("sends without token when not provided", async () => {
    mockOkJson({ success: true, data: {} });

    await addBusinessReview("b1", { rating: 3, comment: "Average place." });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on server error", async () => {
    mockError(400, "Bad review data");

    await expect(addBusinessReview("b1", { rating: 0, comment: "x" })).rejects.toThrow(
      "Bad review data"
    );
  });
});

// ---------------------------------------------------------------------------
describe("getBusinessReviews", () => {
  it("fetches reviews for a business by id", async () => {
    const payload = { success: true, data: [{ rating: 5, comment: "Loved it!" }] };
    mockOkJson(payload);

    const result = await getBusinessReviews("b1");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${BASE}/businesses/b1/reviews`),
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("appends pagination params when provided", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinessReviews("b1", { page: 2, limit: 5 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=5");
  });

  it("throws on non-ok response", async () => {
    mockError(500, "Server error");

    await expect(getBusinessReviews("b1")).rejects.toThrow("Server error");
  });
});

// ---------------------------------------------------------------------------
describe("getBusinessesByProximity", () => {
  it("calls the nearby endpoint with lat, lng and default radius", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinessesByProximity(40.71, -74.0);

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/businesses/nearby");
    expect(url).toContain("lat=40.71");
    expect(url).toContain("lng=-74");
    expect(url).toContain("radius=5");
  });

  it("accepts a custom radius", async () => {
    mockOkJson({ success: true, data: [] });

    await getBusinessesByProximity(40.71, -74.0, 15);

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("radius=15");
  });
});

// ---------------------------------------------------------------------------
describe("searchBusinesses", () => {
  it("calls /businesses/search with query and filters", async () => {
    mockOkJson({ success: true, data: [] });

    await searchBusinesses("vegan", { typeBusiness: "cafe", rating: 4 });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/businesses/search");
    expect(url).toContain("q=vegan");
    expect(url).toContain("typeBusiness=cafe");
    expect(url).toContain("rating=4");
  });

  it("calls /businesses/search with only the query when no filters given", async () => {
    mockOkJson({ success: true, data: [] });

    await searchBusinesses("bakery");

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("q=bakery");
  });
});
