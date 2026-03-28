/**
 * Tests for the base useRestaurants, useRestaurant, and useTopRatedRestaurants
 * TanStack Query hooks (migrated from Zustand).
 */
import { renderHook } from "@testing-library/react";
import { useRestaurants, useRestaurant, useTopRatedRestaurants } from "@/hooks/useRestaurants";
import * as restaurantsApi from "@/lib/api/restaurants";
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/restaurants", () => ({
  getRestaurants: jest.fn(),
  getRestaurant: jest.fn(),
  getTopRatedRestaurants: jest.fn(),
  getNearbyRestaurants: jest.fn(),
  getRestaurantsByCuisine: jest.fn(),
  getAdvancedRestaurants: jest.fn(),
  createRestaurant: jest.fn(),
  updateRestaurant: jest.fn(),
  deleteRestaurant: jest.fn(),
  addRestaurantReview: jest.fn(),
}));

const useQueryMock = useQuery as unknown as jest.Mock;

const mockRestaurant = {
  _id: "1",
  restaurantName: "Green Garden",
  name: "Green Garden",
  address: "123 Vegan St",
  cuisine: ["Vegan"],
  contact: [],
  rating: 4.5,
  numReviews: 10,
  reviews: [],
  author: { _id: "user1", username: "chef" },
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

beforeEach(() => {
  useQueryMock.mockReturnValue({ data: [mockRestaurant], isLoading: false, isError: false });
  jest.clearAllMocks();
  useQueryMock.mockReturnValue({ data: [mockRestaurant], isLoading: false, isError: false });
});

describe("useRestaurants query hook", () => {
  it("calls useQuery with restaurants queryKey", () => {
    renderHook(() => useRestaurants({ search: "green" }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["restaurants", expect.objectContaining({ search: "green" })],
      })
    );
  });

  it("returns data from useQuery", () => {
    const { result } = renderHook(() => useRestaurants());
    expect(result.current.data).toEqual([mockRestaurant]);
  });

  it("passes params to queryFn that calls getRestaurants", async () => {
    let capturedConfig: any;
    useQueryMock.mockImplementation((config: any) => {
      capturedConfig = config;
      return { data: [], isLoading: false };
    });

    (restaurantsApi.getRestaurants as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockRestaurant],
    });

    renderHook(() => useRestaurants({ search: "green" }));

    await capturedConfig.queryFn();
    expect(restaurantsApi.getRestaurants).toHaveBeenCalledWith(
      expect.objectContaining({ search: "green" })
    );
  });
});

describe("useRestaurant single query", () => {
  it("calls useQuery with single restaurant queryKey", () => {
    renderHook(() => useRestaurant("1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["restaurants", "1"],
        enabled: true,
      })
    );
  });

  it("disables query when id is empty", () => {
    renderHook(() => useRestaurant(""));

    expect(useQueryMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });
});

describe("useTopRatedRestaurants", () => {
  it("calls useQuery with topRated queryKey", () => {
    renderHook(() => useTopRatedRestaurants(5));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["restaurants", "topRated", 5],
      })
    );
  });
});
