import { act } from "@testing-library/react";
import { useRecipes } from "@/hooks/useRecipes";
import * as recipesApi from "@/lib/api/recipes";
import { setupStoreTest } from "./store-test-utils";

jest.mock("@/lib/api/recipes", () => ({
  getRecipes: jest.fn(),
  getRecipe: jest.fn(),
  createRecipe: jest.fn(),
  updateRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
  addRecipeReview: jest.fn(),
}));

const mockRecipe = {
  _id: "r1",
  title: "Vegan Tacos",
  description: "Delicious vegan tacos",
  ingredients: ["tortilla", "beans", "avocado"],
  instructions: "Step 1: cook beans",
  cookingTime: 20,
  author: "user1",
  rating: 4.5,
  numReviews: 10,
  reviews: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

setupStoreTest(useRecipes, {
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
});

describe("useRecipes store actions", () => {
  it("loads recipes and resets pagination", async () => {
    (recipesApi.getRecipes as jest.Mock).mockResolvedValue({ success: true, data: [mockRecipe] });

    await act(async () => {
      await useRecipes.getState().getRecipes({ search: "tacos" });
    });

    const state = useRecipes.getState();
    expect(recipesApi.getRecipes).toHaveBeenCalledWith({ search: "tacos" });
    expect(state.recipes).toEqual([mockRecipe]);
    expect(state.currentPage).toBe(1);
    expect(state.isLoading).toBe(false);
  });

  it("sets empty array when response data is not an array", async () => {
    (recipesApi.getRecipes as jest.Mock).mockResolvedValue({ success: true, data: {} });

    await act(async () => {
      await useRecipes.getState().getRecipes();
    });

    expect(useRecipes.getState().recipes).toEqual([]);
  });

  it("propagates errors while fetching recipes", async () => {
    (recipesApi.getRecipes as jest.Mock).mockRejectedValue(new Error("network error"));

    await expect(useRecipes.getState().getRecipes()).rejects.toThrow("network error");

    const state = useRecipes.getState();
    expect(state.error).toBe("network error");
    expect(state.isLoading).toBe(false);
    expect(state.recipes).toEqual([]);
  });

  it("loads a single recipe by id into currentRecipe", async () => {
    (recipesApi.getRecipe as jest.Mock).mockResolvedValue({ success: true, data: mockRecipe });

    await act(async () => {
      await useRecipes.getState().getRecipe("r1");
    });

    const state = useRecipes.getState();
    expect(recipesApi.getRecipe).toHaveBeenCalledWith("r1");
    expect(state.currentRecipe).toEqual(mockRecipe);
    expect(state.isLoading).toBe(false);
  });

  it("propagates errors when fetching a single recipe", async () => {
    (recipesApi.getRecipe as jest.Mock).mockRejectedValue(new Error("not found"));

    await expect(useRecipes.getState().getRecipe("r1")).rejects.toThrow("not found");

    const state = useRecipes.getState();
    expect(state.error).toBe("not found");
  });

  it("creates a recipe and prepends it to the list", async () => {
    const existingRecipe = { ...mockRecipe, _id: "r0" };
    useRecipes.setState({ recipes: [existingRecipe] });

    (recipesApi.createRecipe as jest.Mock).mockResolvedValue({ success: true, data: mockRecipe });

    await act(async () => {
      await useRecipes.getState().createRecipe({
        title: "Vegan Tacos",
        description: "Delicious vegan tacos",
        ingredients: ["tortilla"],
        instructions: ["Cook"],
        preparationTime: 10,
        cookingTime: 20,
        servings: 2,
        difficulty: "easy",
        categories: ["Mexican"],
      });
    });

    const state = useRecipes.getState();
    expect(state.recipes[0]).toEqual(mockRecipe);
    expect(state.recipes[1]).toEqual(existingRecipe);
    expect(state.isLoading).toBe(false);
  });

  it("propagates errors when creating a recipe", async () => {
    (recipesApi.createRecipe as jest.Mock).mockRejectedValue(new Error("create failed"));

    await expect(
      useRecipes.getState().createRecipe({
        title: "Test",
        description: "Desc",
        ingredients: [],
        instructions: [],
        preparationTime: 5,
        cookingTime: 10,
        servings: 1,
        difficulty: "easy",
        categories: [],
      })
    ).rejects.toThrow("create failed");

    expect(useRecipes.getState().error).toBe("create failed");
  });

  it("updates an existing recipe in the list and currentRecipe", async () => {
    const updated = { ...mockRecipe, title: "Updated Tacos" };
    (recipesApi.updateRecipe as jest.Mock).mockResolvedValue({ success: true, data: updated });

    useRecipes.setState({ recipes: [mockRecipe], currentRecipe: mockRecipe });

    await act(async () => {
      await useRecipes.getState().updateRecipe("r1", { title: "Updated Tacos" });
    });

    const state = useRecipes.getState();
    expect(state.recipes[0]).toEqual(updated);
    expect(state.currentRecipe).toEqual(updated);
    expect(state.isLoading).toBe(false);
  });

  it("does not update currentRecipe when it has a different id", async () => {
    const updated = { ...mockRecipe, title: "Updated Tacos" };
    const otherRecipe = { ...mockRecipe, _id: "r99", title: "Other Recipe" };
    (recipesApi.updateRecipe as jest.Mock).mockResolvedValue({ success: true, data: updated });

    useRecipes.setState({ recipes: [mockRecipe], currentRecipe: otherRecipe });

    await act(async () => {
      await useRecipes.getState().updateRecipe("r1", { title: "Updated Tacos" });
    });

    // currentRecipe should remain unchanged since it belongs to a different id
    expect(useRecipes.getState().currentRecipe).toEqual(otherRecipe);
  });

  it("removes deleted recipe from the list and clears currentRecipe", async () => {
    (recipesApi.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

    useRecipes.setState({ recipes: [mockRecipe], currentRecipe: mockRecipe });

    await act(async () => {
      await useRecipes.getState().deleteRecipe("r1");
    });

    const state = useRecipes.getState();
    expect(state.recipes).toEqual([]);
    expect(state.currentRecipe).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("does not clear currentRecipe when deleting a different recipe id", async () => {
    const otherRecipe = { ...mockRecipe, _id: "r99" };
    (recipesApi.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

    useRecipes.setState({ recipes: [mockRecipe, otherRecipe], currentRecipe: otherRecipe });

    await act(async () => {
      await useRecipes.getState().deleteRecipe("r1");
    });

    const state = useRecipes.getState();
    expect(state.recipes).toEqual([otherRecipe]);
    expect(state.currentRecipe).toEqual(otherRecipe);
  });

  it("adds a recipe review and updates the list and currentRecipe", async () => {
    const updatedWithReview = { ...mockRecipe, numReviews: 11, rating: 4.6 };
    (recipesApi.addRecipeReview as jest.Mock).mockResolvedValue({
      success: true,
      data: updatedWithReview,
    });

    useRecipes.setState({ recipes: [mockRecipe], currentRecipe: mockRecipe });

    await act(async () => {
      await useRecipes
        .getState()
        .addRecipeReview("r1", { rating: 5, comment: "Excellent!" }, "token123");
    });

    const state = useRecipes.getState();
    expect(recipesApi.addRecipeReview).toHaveBeenCalledWith(
      "r1",
      { rating: 5, comment: "Excellent!" },
      "token123"
    );
    expect(state.recipes[0]).toEqual(updatedWithReview);
    expect(state.currentRecipe).toEqual(updatedWithReview);
  });

  it("propagates errors when adding a review", async () => {
    (recipesApi.addRecipeReview as jest.Mock).mockRejectedValue(new Error("review failed"));

    await expect(
      useRecipes.getState().addRecipeReview("r1", { rating: 3, comment: "okay" })
    ).rejects.toThrow("review failed");

    expect(useRecipes.getState().error).toBe("review failed");
  });
});
