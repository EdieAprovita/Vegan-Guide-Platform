import {
  useNearbyRestaurants,
  useRestaurantsByCuisine,
  useAdvancedRestaurantSearch,
  useRestaurantMutations,
} from "@/hooks/useRestaurants";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as restaurantsApi from "@/lib/api/restaurants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/restaurants", () => ({
  getNearbyRestaurants: jest.fn(),
  getRestaurantsByCuisine: jest.fn(),
  getAdvancedRestaurants: jest.fn(),
  createRestaurant: jest.fn(),
  updateRestaurant: jest.fn(),
  deleteRestaurant: jest.fn(),
  addRestaurantReview: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;
const useMutationMock = useMutation as unknown as jest.Mock;
const useQueryClientMock = useQueryClient as unknown as jest.Mock;

describe("restaurant query hooks", () => {
  let queryConfigs: any[];
  let mutationConfigs: any[];
  const invalidateQueries = jest.fn();
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    queryConfigs = [];
    mutationConfigs = [];
    locationMock.mockReturnValue({
      userCoords: { lat: 1, lng: 2 },
      getCurrentPosition: jest.fn().mockResolvedValue(undefined),
    });

    useQueryMock.mockImplementation((config: any) => {
      queryConfigs.push(config);
      return { data: [] };
    });

    useMutationMock.mockImplementation((config: any) => {
      mutationConfigs.push(config);
      return {
        mutateAsync: config.mutationFn,
      };
    });

    useQueryClientMock.mockReturnValue({ invalidateQueries });

    consoleErrorSpy = jest.spyOn(global.console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it("configures nearby restaurants query with coordinates", async () => {
    (restaurantsApi.getNearbyRestaurants as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    useNearbyRestaurants({ radius: 7, limit: 5, cuisine: "vegan", minRating: 4 });

    expect(useQueryMock).toHaveBeenCalled();
    const config = queryConfigs[0];
    expect(config.queryKey).toEqual([
      "nearbyRestaurants",
      { lat: 1, lng: 2 },
      { radius: 7, limit: 5, cuisine: "vegan", minRating: 4 },
    ]);

    await config.queryFn();
    expect(restaurantsApi.getNearbyRestaurants).toHaveBeenCalledWith({
      latitude: 1,
      longitude: 2,
      radius: 7,
      limit: 5,
      cuisine: "vegan",
      minRating: 4,
    });
  });

  it("requests geolocation when coordinates missing", async () => {
    const requestLocation = jest.fn().mockResolvedValue(undefined);
    locationMock.mockReturnValueOnce({ userCoords: null, getCurrentPosition: requestLocation });

    useNearbyRestaurants({});

    const config = queryConfigs[0];
    await config.queryFn();
    expect(requestLocation).toHaveBeenCalled();
    expect(restaurantsApi.getNearbyRestaurants).not.toHaveBeenCalled();
  });

  it("configures cuisine query with optional location", async () => {
    (restaurantsApi.getRestaurantsByCuisine as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    useRestaurantsByCuisine("vegan", { includeLocation: true, limit: 3 });

    const config = queryConfigs[0];
    expect(config.queryKey).toEqual([
      "restaurantsByCuisine",
      "vegan",
      { lat: 1, lng: 2 },
      { includeLocation: true, limit: 3 },
    ]);

    await config.queryFn();
    expect(restaurantsApi.getRestaurantsByCuisine).toHaveBeenCalledWith("vegan", {
      page: undefined,
      limit: 3,
      latitude: 1,
      longitude: 2,
      radius: 10,
    });
  });

  it("configures advanced restaurant search", async () => {
    (restaurantsApi.getAdvancedRestaurants as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const params = {
      search: "salads",
      cuisine: ["vegan"],
      minRating: 4,
      radius: 12,
      sortBy: "distance" as const,
      includeLocation: true,
    };

    useAdvancedRestaurantSearch(params);

    const config = queryConfigs[0];
    expect(config.queryKey[0]).toBe("advancedRestaurantSearch");

    await config.queryFn();
    expect(restaurantsApi.getAdvancedRestaurants).toHaveBeenCalledWith({
      search: "salads",
      cuisine: ["vegan"],
      minRating: 4,
      sortBy: "distance",
      limit: 50,
      latitude: 1,
      longitude: 2,
      radius: 12,
    });
  });

  it("wraps restaurant mutations with invalidations", async () => {
    (restaurantsApi.createRestaurant as jest.Mock).mockResolvedValue({});
    (restaurantsApi.updateRestaurant as jest.Mock).mockResolvedValue({});
    (restaurantsApi.deleteRestaurant as jest.Mock).mockResolvedValue({});
    (restaurantsApi.addRestaurantReview as jest.Mock).mockResolvedValue({});

    const { createRestaurant, updateRestaurant, deleteRestaurant, addReview } =
      useRestaurantMutations();

    expect(useMutationMock).toHaveBeenCalledTimes(4);

    await mutationConfigs[0].mutationFn({ data: { restaurantName: "Test" } });
    await mutationConfigs[1].mutationFn({ id: "1", data: { restaurantName: "New" } });
    await mutationConfigs[2].mutationFn({ id: "1" });
    await mutationConfigs[3].mutationFn({ id: "1", review: { rating: 5, comment: "Great" } });

    mutationConfigs.forEach((config) => config.onSuccess());

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["restaurants"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["nearbyRestaurants"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["restaurantsByCuisine"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["advancedRestaurantSearch"] });

    expect(createRestaurant).toBeDefined();
    expect(updateRestaurant).toBeDefined();
    expect(deleteRestaurant).toBeDefined();
    expect(addReview).toBeDefined();
  });
});
