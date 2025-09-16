import {
  useNearbySanctuaries,
  useSanctuariesByType,
  useAdvancedSanctuarySearch,
  useSanctuaryMutations,
} from "@/hooks/useSanctuaries";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as sanctuariesApi from "@/lib/api/sanctuaries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/sanctuaries", () => ({
  getNearbySanctuaries: jest.fn(),
  getSanctuariesByType: jest.fn(),
  getAdvancedSanctuaries: jest.fn(),
  createSanctuary: jest.fn(),
  updateSanctuary: jest.fn(),
  deleteSanctuary: jest.fn(),
  addSanctuaryReview: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;
const useMutationMock = useMutation as unknown as jest.Mock;
const useQueryClientMock = useQueryClient as unknown as jest.Mock;

describe("sanctuary query hooks", () => {
  let queryConfigs: any[];
  let mutationConfigs: any[];
  let consoleErrorSpy: jest.SpyInstance;
  const invalidateQueries = jest.fn();

  beforeEach(() => {
    queryConfigs = [];
    mutationConfigs = [];

    locationMock.mockReturnValue({
      userCoords: { lat: 5, lng: 6 },
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

  it("fetches nearby sanctuaries using coordinates", async () => {
    (sanctuariesApi.getNearbySanctuaries as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    useNearbySanctuaries({ radius: 4, typeofSanctuary: "wildlife" });

    const config = queryConfigs[0];
    await config.queryFn();
    expect(sanctuariesApi.getNearbySanctuaries).toHaveBeenCalledWith({
      latitude: 5,
      longitude: 6,
      radius: 4,
      limit: 20,
      typeofSanctuary: "wildlife",
      minRating: undefined,
    });
  });

  it("requests geolocation when coordinates absent", async () => {
    const askLocation = jest.fn().mockResolvedValue(undefined);
    locationMock.mockReturnValueOnce({ userCoords: null, getCurrentPosition: askLocation });

    useNearbySanctuaries();

    const config = queryConfigs[0];
    await config.queryFn();
    expect(askLocation).toHaveBeenCalled();
    expect(sanctuariesApi.getNearbySanctuaries).not.toHaveBeenCalled();
  });

  it("configures sanctuary type query", async () => {
    (sanctuariesApi.getSanctuariesByType as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    useSanctuariesByType("rescue", { includeLocation: true, limit: 2 });

    const config = queryConfigs[0];
    await config.queryFn();
    expect(sanctuariesApi.getSanctuariesByType).toHaveBeenCalledWith("rescue", {
      page: undefined,
      limit: 2,
      latitude: 5,
      longitude: 6,
      radius: 10,
    });
  });

  it("configures advanced sanctuary search", async () => {
    (sanctuariesApi.getAdvancedSanctuaries as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    useAdvancedSanctuarySearch({
      search: "haven",
      typeofSanctuary: ["wildlife"],
      minRating: 5,
      radius: 15,
      includeLocation: true,
      sortBy: "distance",
    });

    const config = queryConfigs[0];
    await config.queryFn();
    expect(sanctuariesApi.getAdvancedSanctuaries).toHaveBeenCalledWith({
      search: "haven",
      typeofSanctuary: ["wildlife"],
      minRating: 5,
      sortBy: "distance",
      limit: 50,
      latitude: 5,
      longitude: 6,
      radius: 15,
    });
  });

  it("invalidates caches after sanctuary mutations", async () => {
    (sanctuariesApi.createSanctuary as jest.Mock).mockResolvedValue({});
    (sanctuariesApi.updateSanctuary as jest.Mock).mockResolvedValue({});
    (sanctuariesApi.deleteSanctuary as jest.Mock).mockResolvedValue({});
    (sanctuariesApi.addSanctuaryReview as jest.Mock).mockResolvedValue({});

    useSanctuaryMutations();

    expect(useMutationMock).toHaveBeenCalledTimes(4);

    await mutationConfigs[0].mutationFn({ data: { sanctuaryName: "Hope" } });
    await mutationConfigs[1].mutationFn({ id: "1", data: { sanctuaryName: "New" } });
    await mutationConfigs[2].mutationFn({ id: "1" });
    await mutationConfigs[3].mutationFn({ id: "1", review: { rating: 5, comment: "Great" } });

    mutationConfigs.forEach((config) => config.onSuccess());

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["sanctuaries"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["nearbySanctuaries"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["sanctuariesByType"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["advancedSanctuarySearch"] });
  });
});
