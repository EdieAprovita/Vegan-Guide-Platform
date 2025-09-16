import {
  useNearbyMarkets,
  useMarketsByProducts,
  useAdvancedMarketSearch,
  useMarketMutations,
} from "@/hooks/useMarkets";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as marketsApi from "@/lib/api/markets";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/markets", () => ({
  getNearbyMarkets: jest.fn(),
  getMarketsByProducts: jest.fn(),
  getAdvancedMarkets: jest.fn(),
  createMarket: jest.fn(),
  updateMarket: jest.fn(),
  deleteMarket: jest.fn(),
  addMarketReview: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;
const useMutationMock = useMutation as unknown as jest.Mock;
const useQueryClientMock = useQueryClient as unknown as jest.Mock;

describe("market query hooks", () => {
  let queryConfigs: any[];
  let mutationConfigs: any[];
  let consoleErrorSpy: jest.SpyInstance;
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    queryConfigs = [];
    mutationConfigs = [];

    locationMock.mockReturnValue({
      userCoords: { lat: 3, lng: 4 },
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

  it("fetches nearby markets with coordinates", async () => {
    (marketsApi.getNearbyMarkets as jest.Mock).mockResolvedValue({ success: true, data: [] });

    useNearbyMarkets({ radius: 8, products: "fruits", minRating: 3 });

    const config = queryConfigs[0];
    expect(config.queryKey[0]).toBe("nearbyMarkets");

    await config.queryFn();
    expect(marketsApi.getNearbyMarkets).toHaveBeenCalledWith({
      latitude: 3,
      longitude: 4,
      radius: 8,
      limit: 20,
      products: "fruits",
      minRating: 3,
    });
  });

  it("requests position when missing for nearby markets", async () => {
    const askLocation = jest.fn().mockResolvedValue(undefined);
    locationMock.mockReturnValueOnce({ userCoords: null, getCurrentPosition: askLocation });

    useNearbyMarkets();

    const config = queryConfigs[0];
    await config.queryFn();
    expect(askLocation).toHaveBeenCalled();
    expect(marketsApi.getNearbyMarkets).not.toHaveBeenCalled();
  });

  it("configures markets by products query", async () => {
    (marketsApi.getMarketsByProducts as jest.Mock).mockResolvedValue({ success: true, data: [] });

    useMarketsByProducts("tofu", { includeLocation: true, limit: 6 });

    const config = queryConfigs[0];
    await config.queryFn();
    expect(marketsApi.getMarketsByProducts).toHaveBeenCalledWith("tofu", {
      page: undefined,
      limit: 6,
      latitude: 3,
      longitude: 4,
      radius: 10,
    });
  });

  it("configures advanced market search", async () => {
    (marketsApi.getAdvancedMarkets as jest.Mock).mockResolvedValue({ success: true, data: [] });

    useAdvancedMarketSearch({
      search: "organic",
      products: ["greens"],
      minRating: 5,
      radius: 9,
      includeLocation: true,
      sortBy: "distance",
    });

    const config = queryConfigs[0];
    await config.queryFn();
    expect(marketsApi.getAdvancedMarkets).toHaveBeenCalledWith({
      search: "organic",
      products: ["greens"],
      minRating: 5,
      sortBy: "distance",
      limit: 50,
      latitude: 3,
      longitude: 4,
      radius: 9,
    });
  });

  it("invalidates caches after market mutations", async () => {
    (marketsApi.createMarket as jest.Mock).mockResolvedValue({});
    (marketsApi.updateMarket as jest.Mock).mockResolvedValue({});
    (marketsApi.deleteMarket as jest.Mock).mockResolvedValue({});
    (marketsApi.addMarketReview as jest.Mock).mockResolvedValue({});

    useMarketMutations();

    expect(useMutationMock).toHaveBeenCalledTimes(4);

    await mutationConfigs[0].mutationFn({ data: { marketName: "Fresh" } });
    await mutationConfigs[1].mutationFn({ id: "1", data: { marketName: "Updated" } });
    await mutationConfigs[2].mutationFn({ id: "1" });
    await mutationConfigs[3].mutationFn({ id: "1", review: { rating: 4, comment: "Good" } });

    mutationConfigs.forEach((config) => config.onSuccess());

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["markets"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["nearbyMarkets"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["marketsByProducts"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["advancedMarketSearch"] });
  });
});
