/**
 * Tests for the base useRecipes and useRecipe TanStack Query hooks
 * (migrated from Zustand store tests).
 */
import { renderHook } from "@testing-library/react";
import { useRecipes, useRecipe } from "@/hooks/useRecipes";
import * as recipesApi from "@/lib/api/recipes";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/recipes", () => ({
  getRecipes: jest.fn(),
  getRecipe: jest.fn(),
  createRecipe: jest.fn(),
  updateRecipe: jest.fn(),
  deleteRecipe: jest.fn(),
  addRecipeReview: jest.fn(),
}));

const useQueryMock = useQuery as unknown as jest.Mock;

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

beforeEach(() => {
  useQueryMock.mockReturnValue({ data: [mockRecipe], isLoading: false, isError: false });
  jest.clearAllMocks();
  useQueryMock.mockReturnValue({ data: [mockRecipe], isLoading: false, isError: false });
});

describe("useRecipes query hook", () => {
  it("calls useQuery with recipes queryKey", () => {
    renderHook(() => useRecipes({ search: "tacos" }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["recipes", expect.objectContaining({ search: "tacos" })],
      })
    );
  });

  it("returns data from useQuery", () => {
    const { result } = renderHook(() => useRecipes());
    expect(result.current.data).toEqual([mockRecipe]);
  });

  it("passes params to queryFn that calls getRecipes", async () => {
    let capturedConfig: any;
    useQueryMock.mockImplementation((config: any) => {
      capturedConfig = config;
      return { data: [], isLoading: false };
    });

    (recipesApi.getRecipes as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockRecipe],
    });

    renderHook(() => useRecipes({ search: "tacos" }));

    await capturedConfig.queryFn();
    expect(recipesApi.getRecipes).toHaveBeenCalledWith(
      expect.objectContaining({ search: "tacos" })
    );
  });
});

describe("useRecipe single query", () => {
  it("calls useQuery with single recipe queryKey", () => {
    renderHook(() => useRecipe("r1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["recipes", "r1"],
        enabled: true,
      })
    );
  });

  it("disables query when id is empty", () => {
    renderHook(() => useRecipe(""));

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});
