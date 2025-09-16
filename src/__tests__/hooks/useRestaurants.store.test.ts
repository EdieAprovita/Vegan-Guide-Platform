import { act } from "@testing-library/react";
import { useRestaurants } from "@/hooks/useRestaurants";
import * as restaurantsApi from "@/lib/api/restaurants";

jest.mock("@/lib/api/restaurants", () => ({
  getRestaurants: jest.fn(),
  getRestaurant: jest.fn(),
  getTopRatedRestaurants: jest.fn(),
  createRestaurant: jest.fn(),
  updateRestaurant: jest.fn(),
  deleteRestaurant: jest.fn(),
  addRestaurantReview: jest.fn(),
}));

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

const resetStore = () => {
  useRestaurants.setState({
    restaurants: [],
    currentRestaurant: null,
    isLoading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
  });
};

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  resetStore();
  jest.clearAllMocks();
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe("useRestaurants store actions", () => {
  it("fetches restaurants successfully", async () => {
    (restaurantsApi.getRestaurants as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockRestaurant],
    });

    await act(async () => {
      await useRestaurants.getState().getRestaurants({ search: "green" });
    });

    const state = useRestaurants.getState();
    expect(restaurantsApi.getRestaurants).toHaveBeenCalledWith({ search: "green" });
    expect(state.restaurants).toEqual([mockRestaurant]);
    expect(state.error).toBeNull();
  });

  it("handles errors when fetching restaurants", async () => {
    (restaurantsApi.getRestaurants as jest.Mock).mockRejectedValue(new Error("fail"));

    await expect(useRestaurants.getState().getRestaurants()).rejects.toThrow("fail");

    const state = useRestaurants.getState();
    expect(state.restaurants).toEqual([]);
    expect(state.error).toBe("fail");
  });

  it("retrieves a single restaurant and updates state", async () => {
    (restaurantsApi.getRestaurant as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRestaurant,
    });

    await act(async () => {
      await useRestaurants.getState().getRestaurant("1");
    });

    expect(restaurantsApi.getRestaurant).toHaveBeenCalledWith("1");
    expect(useRestaurants.getState().currentRestaurant).toEqual(mockRestaurant);
  });

  it("loads top rated restaurants", async () => {
    (restaurantsApi.getTopRatedRestaurants as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockRestaurant],
    });

    await act(async () => {
      await useRestaurants.getState().getTopRatedRestaurants(5);
    });

    expect(restaurantsApi.getTopRatedRestaurants).toHaveBeenCalledWith(5);
    expect(useRestaurants.getState().restaurants).toEqual([mockRestaurant]);
  });

  it("creates a restaurant and prepends it to the list", async () => {
    (restaurantsApi.createRestaurant as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRestaurant,
    });

    await act(async () => {
      await useRestaurants.getState().createRestaurant(mockRestaurant, "token");
    });

    expect(restaurantsApi.createRestaurant).toHaveBeenCalledWith(mockRestaurant, "token");
    expect(useRestaurants.getState().restaurants[0]).toEqual(mockRestaurant);
  });

  it("updates restaurants list and current entry", async () => {
    const updated = { ...mockRestaurant, restaurantName: "Updated" };
    (restaurantsApi.updateRestaurant as jest.Mock).mockResolvedValue({
      success: true,
      data: updated,
    });

    useRestaurants.setState({
      restaurants: [mockRestaurant],
      currentRestaurant: mockRestaurant,
    });

    await act(async () => {
      await useRestaurants.getState().updateRestaurant("1", { restaurantName: "Updated" });
    });

    const state = useRestaurants.getState();
    expect(state.restaurants[0]).toEqual(updated);
    expect(state.currentRestaurant).toEqual(updated);
  });

  it("removes restaurants when deleting", async () => {
    (restaurantsApi.deleteRestaurant as jest.Mock).mockResolvedValue(undefined);

    useRestaurants.setState({
      restaurants: [mockRestaurant],
      currentRestaurant: mockRestaurant,
    });

    await act(async () => {
      await useRestaurants.getState().deleteRestaurant("1");
    });

    const state = useRestaurants.getState();
    expect(state.restaurants).toEqual([]);
    expect(state.currentRestaurant).toBeNull();
  });

  it("updates reviews list when adding a review", async () => {
    const withReview = { ...mockRestaurant, reviews: [{ rating: 5, comment: "Great" }] };
    (restaurantsApi.addRestaurantReview as jest.Mock).mockResolvedValue({
      success: true,
      data: withReview,
    });

    useRestaurants.setState({
      restaurants: [mockRestaurant],
      currentRestaurant: mockRestaurant,
    });

    await act(async () => {
      await useRestaurants.getState().addRestaurantReview("1", { rating: 5, comment: "Great" });
    });

    expect(useRestaurants.getState().restaurants[0].reviews).toEqual(withReview.reviews);
  });
});
