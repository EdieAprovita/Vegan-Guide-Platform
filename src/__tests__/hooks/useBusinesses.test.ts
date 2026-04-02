import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useBusinesses,
  useBusiness,
  useNearbyBusinesses,
  useBusinessSearch,
  useBusinessMutations,
} from "@/hooks/useBusinesses";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as businessesApi from "@/lib/api/businesses";

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@/lib/api/businesses", () => ({
  getBusinesses: jest.fn(),
  getBusiness: jest.fn(),
  getBusinessesByProximity: jest.fn(),
  searchBusinesses: jest.fn(),
  createBusiness: jest.fn(),
  updateBusiness: jest.fn(),
  deleteBusiness: jest.fn(),
  addBusinessReview: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;

const mockBusiness = {
  _id: "b1",
  namePlace: "Vegan Cafe",
  address: "123 Green St",
  image: "/cafe.jpg",
  contact: [{ phone: "555-1234" }],
  budget: 2,
  typeBusiness: "restaurant",
  hours: [],
  rating: 4.5,
  numReviews: 8,
  reviews: [],
  author: { _id: "u1", username: "owner" },
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  locationMock.mockReturnValue({
    userCoords: { lat: 10, lng: 20 },
    getCurrentPosition: jest.fn().mockResolvedValue(undefined),
  });
  jest.clearAllMocks();
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});

describe("useBusinesses", () => {
  it("auto-fetches businesses on mount and updates state", async () => {
    (businessesApi.getBusinesses as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockBusiness],
    });

    const { result } = renderHook(() => useBusinesses(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(businessesApi.getBusinesses).toHaveBeenCalled();
    expect(result.current.businesses).toEqual([mockBusiness]);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("injects user coordinates when useUserLocation filter is set", async () => {
    (businessesApi.getBusinesses as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockBusiness],
    });

    const { result } = renderHook(() => useBusinesses({ useUserLocation: true, radius: 5 }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(businessesApi.getBusinesses).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 10, lng: 20, radius: 5 }),
      expect.any(AbortSignal)
    );
  });

  it("uses default radius of 10 when useUserLocation is true but no radius given", async () => {
    (businessesApi.getBusinesses as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useBusinesses({ useUserLocation: true }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(businessesApi.getBusinesses).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 10, lng: 20, radius: 10 }),
      expect.any(AbortSignal)
    );
  });

  it("skips auto-fetch when autoFetch is false", async () => {
    const { result } = renderHook(() => useBusinesses({ autoFetch: false }), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {});

    expect(businessesApi.getBusinesses).not.toHaveBeenCalled();
    expect(result.current.businesses).toEqual([]);
  });

  it("sets error state when fetch fails", async () => {
    (businessesApi.getBusinesses as jest.Mock).mockRejectedValue(new Error("fetch failed"));

    const { result } = renderHook(() => useBusinesses(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("fetch failed");
    expect(result.current.businesses).toEqual([]);
  });

  it("refetch triggers a new request", async () => {
    (businessesApi.getBusinesses as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockBusiness],
    });

    const { result } = renderHook(() => useBusinesses(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(businessesApi.getBusinesses).toHaveBeenCalledTimes(2);
  });
});

describe("useBusiness", () => {
  it("fetches a single business by id", async () => {
    (businessesApi.getBusiness as jest.Mock).mockResolvedValue({ data: mockBusiness });

    const { result } = renderHook(() => useBusiness("b1"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(businessesApi.getBusiness).toHaveBeenCalledWith("b1", expect.any(AbortSignal));
    expect(result.current.business).toEqual(mockBusiness);
    expect(result.current.error).toBeNull();
  });

  it("does not fetch when no id is provided", async () => {
    const { result } = renderHook(() => useBusiness(undefined), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(businessesApi.getBusiness).not.toHaveBeenCalled();
    expect(result.current.business).toBeNull();
  });

  it("sets error when fetch fails", async () => {
    (businessesApi.getBusiness as jest.Mock).mockRejectedValue(new Error("not found"));

    const { result } = renderHook(() => useBusiness("b99"), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("not found");
    expect(result.current.business).toBeNull();
  });
});

describe("useNearbyBusinesses", () => {
  it("searches nearby businesses using user coordinates", async () => {
    (businessesApi.getBusinessesByProximity as jest.Mock).mockResolvedValue({
      data: [mockBusiness],
    });

    const { result } = renderHook(() => useNearbyBusinesses(5), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.searchNearby();
    });

    expect(businessesApi.getBusinessesByProximity).toHaveBeenCalledWith(10, 20, 5);
    expect(result.current.businesses).toEqual([mockBusiness]);
  });

  it("uses custom coordinates when provided", async () => {
    (businessesApi.getBusinessesByProximity as jest.Mock).mockResolvedValue({
      data: [mockBusiness],
    });

    const { result } = renderHook(() => useNearbyBusinesses(8), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.searchNearby({ lat: 50, lng: 60 });
    });

    expect(businessesApi.getBusinessesByProximity).toHaveBeenCalledWith(50, 60, 8);
  });

  it("requests geolocation when userCoords is null and no custom coords provided", async () => {
    const getCurrentPosition = jest.fn().mockResolvedValue(undefined);
    locationMock.mockReturnValue({ userCoords: null, getCurrentPosition });

    const { result } = renderHook(() => useNearbyBusinesses(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.searchNearby();
    });

    expect(getCurrentPosition).toHaveBeenCalled();
    expect(businessesApi.getBusinessesByProximity).not.toHaveBeenCalled();
  });

  it("sets error when geolocation fails", async () => {
    const getCurrentPosition = jest.fn().mockRejectedValue(new Error("denied"));
    locationMock.mockReturnValue({ userCoords: null, getCurrentPosition });

    const { result } = renderHook(() => useNearbyBusinesses(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.searchNearby();
    });

    expect(result.current.error).toBe("No se pudo obtener la ubicación");
  });

  it("sets error when proximity search fails", async () => {
    (businessesApi.getBusinessesByProximity as jest.Mock).mockRejectedValue(
      new Error("proximity error")
    );

    const { result } = renderHook(() => useNearbyBusinesses(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.searchNearby();
    });

    expect(result.current.error).toBe("proximity error");
  });
});

describe("useBusinessSearch", () => {
  it("returns search results for a given query", async () => {
    (businessesApi.searchBusinesses as jest.Mock).mockResolvedValue({ data: [mockBusiness] });

    const { result } = renderHook(() => useBusinessSearch(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.search("vegan cafe");
    });

    expect(businessesApi.searchBusinesses).toHaveBeenCalledWith("vegan cafe", {});
    expect(result.current.results).toEqual([mockBusiness]);
    expect(result.current.loading).toBe(false);
  });

  it("does not search when query is blank", async () => {
    const { result } = renderHook(() => useBusinessSearch(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.search("  ");
    });

    expect(businessesApi.searchBusinesses).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });

  it("sets error when search fails", async () => {
    (businessesApi.searchBusinesses as jest.Mock).mockRejectedValue(new Error("search error"));

    const { result } = renderHook(() => useBusinessSearch(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.search("cafe");
    });

    expect(result.current.error).toBe("search error");
  });

  it("clearResults resets state", async () => {
    (businessesApi.searchBusinesses as jest.Mock).mockResolvedValue({ data: [mockBusiness] });

    const { result } = renderHook(() => useBusinessSearch(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.search("vegan");
    });

    expect(result.current.results).toHaveLength(1);

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

describe("useBusinessMutations", () => {
  it("creates a business", async () => {
    (businessesApi.createBusiness as jest.Mock).mockResolvedValue({ data: mockBusiness });

    const { result } = renderHook(() => useBusinessMutations(), { wrapper: createQueryWrapper() });

    let created: unknown;
    await act(async () => {
      created = await result.current.createBusiness({
        namePlace: "Vegan Cafe",
        address: "123 Green St",
        image: "/cafe.jpg",
        contact: [],
        budget: 2,
        typeBusiness: "restaurant",
        hours: [],
      });
    });

    expect(businessesApi.createBusiness).toHaveBeenCalledWith(
      expect.objectContaining({ namePlace: "Vegan Cafe" })
    );
    expect(created).toEqual(mockBusiness);
    expect(result.current.loading).toBe(false);
  });

  it("updates a business", async () => {
    const updated = { ...mockBusiness, namePlace: "Updated Cafe" };
    (businessesApi.updateBusiness as jest.Mock).mockResolvedValue({ data: updated });

    const { result } = renderHook(() => useBusinessMutations(), { wrapper: createQueryWrapper() });

    let updatedResult: unknown;
    await act(async () => {
      updatedResult = await result.current.updateBusiness("b1", { namePlace: "Updated Cafe" });
    });

    expect(businessesApi.updateBusiness).toHaveBeenCalledWith("b1", { namePlace: "Updated Cafe" });
    expect(updatedResult).toEqual(updated);
  });

  it("deletes a business", async () => {
    (businessesApi.deleteBusiness as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useBusinessMutations(), { wrapper: createQueryWrapper() });

    await act(async () => {
      await result.current.deleteBusiness("b1");
    });

    expect(businessesApi.deleteBusiness).toHaveBeenCalledWith("b1");
    expect(result.current.loading).toBe(false);
  });

  it("adds a review to a business", async () => {
    (businessesApi.addBusinessReview as jest.Mock).mockResolvedValue({ data: mockBusiness });

    const { result } = renderHook(() => useBusinessMutations(), { wrapper: createQueryWrapper() });

    let reviewResult: unknown;
    await act(async () => {
      reviewResult = await result.current.addReview("b1", {
        rating: 5,
        comment: "Great place!",
      });
    });

    expect(businessesApi.addBusinessReview).toHaveBeenCalledWith("b1", {
      rating: 5,
      comment: "Great place!",
    });
    expect(reviewResult).toEqual(mockBusiness);
  });

  it("propagates errors from createBusiness", async () => {
    (businessesApi.createBusiness as jest.Mock).mockRejectedValue(new Error("create failed"));

    const { result } = renderHook(() => useBusinessMutations(), { wrapper: createQueryWrapper() });

    await expect(
      result.current.createBusiness({
        namePlace: "Test",
        address: "123",
        image: "/img.jpg",
        contact: [],
        budget: 1,
        typeBusiness: "cafe",
        hours: [],
      })
    ).rejects.toThrow("create failed");

    expect(result.current.loading).toBe(false);
  });
});
