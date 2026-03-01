import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  addRecipeReview,
  CreateRecipeData,
} from "@/lib/api/recipes";
import { API_CONFIG } from "@/lib/api/config";
import { mockOkJson, mockError, setupFetchMocks } from "./fetch-mocks";

const BASE = API_CONFIG.BASE_URL;

setupFetchMocks();

// ---------------------------------------------------------------------------
describe("getRecipes", () => {
  it("calls /recipes with no params when called without arguments", async () => {
    const response = { success: true, data: [] };
    mockOkJson(response);

    const result = await getRecipes();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${BASE}/recipes`),
      expect.any(Object)
    );
    expect(result).toEqual(response);
  });

  it("appends provided query params to the URL", async () => {
    mockOkJson({ success: true, data: [] });

    await getRecipes({ page: 2, limit: 5, search: "tofu", category: "lunch", difficulty: "easy" });

    const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("limit=5");
    expect(calledUrl).toContain("search=tofu");
    expect(calledUrl).toContain("category=lunch");
    expect(calledUrl).toContain("difficulty=easy");
  });

  it("omits undefined params from the URL", async () => {
    mockOkJson({ success: true, data: [] });

    await getRecipes({ page: 1 });

    const calledUrl: string = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).not.toContain("search=");
    expect(calledUrl).not.toContain("category=");
  });

  it("propagates fetch errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network down"));

    await expect(getRecipes()).rejects.toThrow("Network down");
  });
});

// ---------------------------------------------------------------------------
describe("getRecipe", () => {
  it("fetches a single recipe by id", async () => {
    const payload = { success: true, data: { _id: "abc", title: "Salad" } };
    mockOkJson(payload);

    const result = await getRecipe("abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/recipes/abc`,
      expect.any(Object)
    );
    expect(result).toEqual(payload);
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Recipe not found");

    await expect(getRecipe("missing")).rejects.toThrow("Recipe not found");
  });
});

// ---------------------------------------------------------------------------
describe("createRecipe", () => {
  const data: CreateRecipeData = {
    title: "Vegan Tacos",
    description: "Delicious vegan tacos",
    ingredients: ["tortilla", "beans"],
    instructions: ["step1", "step2"],
    preparationTime: 10,
    cookingTime: 20,
    servings: 2,
    difficulty: "easy",
    categories: ["Mexican"],
  };

  it("posts to /recipes with FormData", async () => {
    const payload = { success: true, data: { _id: "new1", title: "Vegan Tacos" } };
    mockOkJson(payload);

    const result = await createRecipe(data, "my-token");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/recipes`);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.headers).toMatchObject({ Authorization: "Bearer my-token" });
    expect(result).toEqual(payload);
  });

  it("sends without auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await createRecipe(data);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("serialises array fields as JSON strings in FormData", async () => {
    mockOkJson({ success: true, data: {} });

    await createRecipe(data, "tok");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const formData: FormData = options.body;
    expect(formData.get("ingredients")).toBe(JSON.stringify(data.ingredients));
    expect(formData.get("instructions")).toBe(JSON.stringify(data.instructions));
    expect(formData.get("categories")).toBe(JSON.stringify(data.categories));
  });

  it("appends File values directly to FormData", async () => {
    mockOkJson({ success: true, data: {} });

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await createRecipe({ ...data, image: file }, "tok");

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const formData: FormData = options.body;
    expect(formData.get("image")).toBeInstanceOf(File);
  });

  it("throws on server error", async () => {
    mockError(422, "Validation error");

    await expect(createRecipe(data, "tok")).rejects.toThrow("Validation error");
  });
});

// ---------------------------------------------------------------------------
describe("updateRecipe", () => {
  it("sends PUT request with FormData to /recipes/:id", async () => {
    const payload = { success: true, data: { _id: "r1", title: "Updated" } };
    mockOkJson(payload);

    const result = await updateRecipe("r1", { title: "Updated" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/recipes/r1`);
    expect(options.method).toBe("PUT");
    expect(options.body).toBeInstanceOf(FormData);
    expect(result).toEqual(payload);
  });

  it("sends without auth header when no token provided", async () => {
    mockOkJson({ success: true, data: {} });

    await updateRecipe("r1", { title: "No auth" });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(403, "Forbidden");

    await expect(updateRecipe("r1", { title: "x" }, "tok")).rejects.toThrow("Forbidden");
  });
});

// ---------------------------------------------------------------------------
describe("deleteRecipe", () => {
  it("sends DELETE request to /recipes/:id", async () => {
    mockOkJson({ success: true, data: null });

    await deleteRecipe("r1", "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/recipes/r1`);
    expect(options.method).toBe("DELETE");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok" });
  });

  it("throws when server returns error", async () => {
    mockError(404, "Not found");

    await expect(deleteRecipe("r99", "tok")).rejects.toThrow("Not found");
  });
});

// ---------------------------------------------------------------------------
describe("addRecipeReview", () => {
  it("sends POST request to /recipes/add-review/:id", async () => {
    const payload = { success: true, data: { _id: "r1", rating: 5 } };
    mockOkJson(payload);

    const result = await addRecipeReview("r1", { rating: 5, comment: "Excellent!" }, "tok");

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${BASE}/recipes/add-review/r1`);
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ rating: 5, comment: "Excellent!" });
    expect(result).toEqual(payload);
  });

  it("sends without token when not provided", async () => {
    mockOkJson({ success: true, data: {} });

    await addRecipeReview("r1", { rating: 4, comment: "Good recipe." });

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("throws on non-ok response", async () => {
    mockError(400, "Invalid review");

    await expect(addRecipeReview("r1", { rating: 0, comment: "bad" }, "tok")).rejects.toThrow(
      "Invalid review"
    );
  });
});
