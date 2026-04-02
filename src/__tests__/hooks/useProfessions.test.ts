/**
 * H-14: useProfessions — all query hooks must forward the AbortSignal provided
 * by TanStack Query to the underlying API call.
 */

import { useQuery } from "@tanstack/react-query";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as professionsApi from "@/lib/api/professions";
import {
  useProfessions,
  useProfession,
  useNearbyProfessions,
  useProfessionsByCategory,
  useProfessionalProfiles,
  useProfessionalProfile,
  useNearbyProfessionalProfiles,
  useAdvancedProfessionalProfileSearch,
} from "@/hooks/useProfessions";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/professions", () => ({
  getProfessions: jest.fn(),
  getProfession: jest.fn(),
  getNearbyProfessions: jest.fn(),
  getProfessionsByCategory: jest.fn(),
  getProfessionalProfiles: jest.fn(),
  getProfessionalProfile: jest.fn(),
  getNearbyProfessionalProfiles: jest.fn(),
  getAdvancedProfessionalProfiles: jest.fn(),
  createProfession: jest.fn(),
  updateProfession: jest.fn(),
  deleteProfession: jest.fn(),
  addProfessionReview: jest.fn(),
  createProfessionalProfile: jest.fn(),
  updateProfessionalProfile: jest.fn(),
  deleteProfessionalProfile: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;

const TEST_SIGNAL = new AbortController().signal;

beforeEach(() => {
  locationMock.mockReturnValue({
    userCoords: { lat: 40, lng: -3 },
    getCurrentPosition: jest.fn(),
  });

  (professionsApi.getProfessions as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (professionsApi.getProfession as jest.Mock).mockResolvedValue({ success: true, data: {} });
  (professionsApi.getNearbyProfessions as jest.Mock).mockResolvedValue({ success: true, data: [] });
  (professionsApi.getProfessionsByCategory as jest.Mock).mockResolvedValue({
    success: true,
    data: [],
  });
  (professionsApi.getProfessionalProfiles as jest.Mock).mockResolvedValue({
    success: true,
    data: [],
  });
  (professionsApi.getProfessionalProfile as jest.Mock).mockResolvedValue({
    success: true,
    data: {},
  });
  (professionsApi.getNearbyProfessionalProfiles as jest.Mock).mockResolvedValue({
    success: true,
    data: [],
  });
  (professionsApi.getAdvancedProfessionalProfiles as jest.Mock).mockResolvedValue({
    success: true,
    data: [],
  });

  useQueryMock.mockImplementation(
    (config: { queryFn: (ctx: { signal: AbortSignal }) => unknown }) => {
      config.queryFn({ signal: TEST_SIGNAL });
      return { data: undefined };
    }
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("H-14: useProfessions signal forwarding", () => {
  it("useProfessions forwards signal to getProfessions", () => {
    useProfessions();
    expect(professionsApi.getProfessions).toHaveBeenCalledWith(undefined, TEST_SIGNAL);
  });

  it("useProfession forwards signal to getProfession", () => {
    useProfession("prof-1");
    expect(professionsApi.getProfession).toHaveBeenCalledWith("prof-1", TEST_SIGNAL);
  });

  it("useNearbyProfessions forwards signal to getNearbyProfessions", () => {
    useNearbyProfessions({ radius: 8 });
    expect(professionsApi.getNearbyProfessions).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 40, longitude: -3, radius: 8 }),
      TEST_SIGNAL
    );
  });

  it("useProfessionsByCategory forwards signal to getProfessionsByCategory", () => {
    useProfessionsByCategory({ category: "nutrition" });
    expect(professionsApi.getProfessionsByCategory).toHaveBeenCalledWith(
      expect.objectContaining({ category: "nutrition" }),
      TEST_SIGNAL
    );
  });

  it("useProfessionalProfiles forwards signal to getProfessionalProfiles", () => {
    useProfessionalProfiles();
    expect(professionsApi.getProfessionalProfiles).toHaveBeenCalledWith(undefined, TEST_SIGNAL);
  });

  it("useProfessionalProfile forwards signal to getProfessionalProfile", () => {
    useProfessionalProfile("pp-1");
    expect(professionsApi.getProfessionalProfile).toHaveBeenCalledWith("pp-1", TEST_SIGNAL);
  });

  it("useNearbyProfessionalProfiles forwards signal to getNearbyProfessionalProfiles", () => {
    useNearbyProfessionalProfiles({ radius: 3 });
    expect(professionsApi.getNearbyProfessionalProfiles).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 40, longitude: -3, radius: 3 }),
      TEST_SIGNAL
    );
  });

  it("useAdvancedProfessionalProfileSearch forwards signal to getAdvancedProfessionalProfiles", () => {
    useAdvancedProfessionalProfileSearch({ search: "dietitian" });
    expect(professionsApi.getAdvancedProfessionalProfiles).toHaveBeenCalledWith(
      expect.objectContaining({ search: "dietitian" }),
      TEST_SIGNAL
    );
  });
});
