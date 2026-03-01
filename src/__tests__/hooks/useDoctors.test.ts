import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useDoctors,
  useNearbyDoctors,
  useDoctorsBySpecialty,
  useAdvancedDoctorSearch,
} from "@/hooks/useDoctors";
import * as doctorsApi from "@/lib/api/doctors";
import * as geospatial from "@/lib/utils/geospatial";

jest.mock("@/lib/api/doctors", () => ({
  getDoctors: jest.fn(),
  getDoctor: jest.fn(),
  searchDoctors: jest.fn(),
  addDoctorReview: jest.fn(),
  getNearbyDoctors: jest.fn(),
  getDoctorsBySpecialty: jest.fn(),
  getAdvancedDoctors: jest.fn(),
}));

jest.mock("@/lib/utils/geospatial", () => ({
  getCurrentLocation: jest.fn(),
}));

// sonner is used inside the hook for toasts
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockDoctor = {
  _id: "d1",
  name: "Dr. Vegan",
  specialty: "Nutrition",
  rating: 4.8,
  numReviews: 15,
  reviews: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const getCurrentLocationMock = geospatial.getCurrentLocation as jest.Mock;

beforeEach(() => {
  getCurrentLocationMock.mockResolvedValue({ lat: 10, lng: 20 });
  jest.clearAllMocks();
});

describe("useDoctors", () => {
  it("starts with the provided initial doctors list", () => {
    const { result } = renderHook(() => useDoctors([mockDoctor as never]));

    expect(result.current.doctors).toEqual([mockDoctor]);
  });

  it("fetchDoctors loads doctors from the API", async () => {
    (doctorsApi.getDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.fetchDoctors();
    });

    expect(doctorsApi.getDoctors).toHaveBeenCalledWith();
    expect(result.current.doctors).toEqual([mockDoctor]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetchDoctors sets error and empty list on failure", async () => {
    (doctorsApi.getDoctors as jest.Mock).mockRejectedValue(new Error("API down"));

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.fetchDoctors();
    });

    expect(result.current.error).toBe("API down");
    expect(result.current.doctors).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("fetchDoctorsWithParams passes params to API", async () => {
    (doctorsApi.getDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.fetchDoctorsWithParams({ specialty: "Nutrition", page: 1, limit: 10 });
    });

    expect(doctorsApi.getDoctors).toHaveBeenCalledWith({ specialty: "Nutrition", page: 1, limit: 10 });
    expect(result.current.doctors).toEqual([mockDoctor]);
  });

  it("getDoctorById sets currentDoctor", async () => {
    (doctorsApi.getDoctor as jest.Mock).mockResolvedValue({ success: true, data: mockDoctor });

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.getDoctorById("d1");
    });

    expect(doctorsApi.getDoctor).toHaveBeenCalledWith("d1");
    expect(result.current.currentDoctor).toEqual(mockDoctor);
    expect(result.current.isLoading).toBe(false);
  });

  it("getDoctorById sets error on failure", async () => {
    (doctorsApi.getDoctor as jest.Mock).mockRejectedValue(new Error("not found"));

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.getDoctorById("d99");
    });

    expect(result.current.error).toBe("not found");
    expect(result.current.currentDoctor).toBeNull();
  });

  it("handleSearch filters doctors from the API", async () => {
    (doctorsApi.searchDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.handleSearch("vegan");
    });

    expect(doctorsApi.searchDoctors).toHaveBeenCalledWith("vegan");
    expect(result.current.doctors).toEqual([mockDoctor]);
  });

  it("handleAddReview calls addDoctorReview and refreshes the doctor", async () => {
    (doctorsApi.addDoctorReview as jest.Mock).mockResolvedValue({ success: true });
    (doctorsApi.getDoctor as jest.Mock).mockResolvedValue({ success: true, data: mockDoctor });

    const { result } = renderHook(() => useDoctors());

    await act(async () => {
      await result.current.handleAddReview("d1", { rating: 5, comment: "Excellent" });
    });

    expect(doctorsApi.addDoctorReview).toHaveBeenCalledWith("d1", {
      rating: 5,
      comment: "Excellent",
    });
    // After review, getDoctorById should be called to refresh the current doctor
    expect(doctorsApi.getDoctor).toHaveBeenCalledWith("d1");
  });

  it("getUserLocation sets and returns the location", async () => {
    const { result } = renderHook(() => useDoctors());

    let location: { lat: number; lng: number } | undefined;
    await act(async () => {
      location = await result.current.getUserLocation();
    });

    expect(location).toEqual({ lat: 10, lng: 20 });
    expect(result.current.userLocation).toEqual({ lat: 10, lng: 20 });
  });

  it("getUserLocation rethrows on failure", async () => {
    getCurrentLocationMock.mockRejectedValue(new Error("denied"));

    const { result } = renderHook(() => useDoctors());

    // The hook rethrows; capture the promise before asserting error state
    let thrownError: unknown = null;
    await act(async () => {
      try {
        await result.current.getUserLocation();
      } catch (e) {
        thrownError = e;
      }
    });

    expect((thrownError as Error)?.message).toBe("denied");
    expect(result.current.error).toBe("denied");
  });
});

describe("useNearbyDoctors", () => {
  it("fetches nearby doctors using obtained location", async () => {
    (doctorsApi.getNearbyDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useNearbyDoctors(7));

    await act(async () => {
      await result.current.fetchNearbyDoctors({ specialty: "Nutrition" });
    });

    expect(doctorsApi.getNearbyDoctors).toHaveBeenCalledWith({
      latitude: 10,
      longitude: 20,
      radius: 7,
      specialty: "Nutrition",
    });
    expect(result.current.doctors).toEqual([mockDoctor]);
    expect(result.current.isLoading).toBe(false);
  });

  it("sets error on failure", async () => {
    (doctorsApi.getNearbyDoctors as jest.Mock).mockRejectedValue(new Error("GPS fail"));

    const { result } = renderHook(() => useNearbyDoctors());

    await act(async () => {
      await result.current.fetchNearbyDoctors();
    });

    expect(result.current.error).toBe("GPS fail");
    expect(result.current.doctors).toEqual([]);
  });

  it("fetchWithLocation uses explicit coordinates", async () => {
    (doctorsApi.getNearbyDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useNearbyDoctors(5));

    await act(async () => {
      await result.current.fetchWithLocation(50, 60, { minRating: 4 });
    });

    expect(doctorsApi.getNearbyDoctors).toHaveBeenCalledWith({
      latitude: 50,
      longitude: 60,
      radius: 5,
      minRating: 4,
    });
    expect(result.current.userLocation).toEqual({ lat: 50, lng: 60 });
  });
});

describe("useDoctorsBySpecialty", () => {
  it("auto-fetches when specialty is provided", async () => {
    (doctorsApi.getDoctorsBySpecialty as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useDoctorsBySpecialty("Nutrition"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(doctorsApi.getDoctorsBySpecialty).toHaveBeenCalledWith(
      "Nutrition",
      expect.objectContaining({ specialty: "Nutrition" })
    );
    expect(result.current.doctors).toEqual([mockDoctor]);
  });

  it("does not auto-fetch when specialty is empty", async () => {
    const { result } = renderHook(() => useDoctorsBySpecialty(""));

    await act(async () => {});

    expect(doctorsApi.getDoctorsBySpecialty).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it("includes location when useLocation param is set", async () => {
    (doctorsApi.getDoctorsBySpecialty as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });

    const { result } = renderHook(() => useDoctorsBySpecialty("Cardiology"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchDoctorsBySpecialty({ useLocation: true, radius: 15 });
    });

    // The call with location params should appear somewhere in the call history.
    // After setting userLocation state, the useEffect may fire again without location params.
    const allCalls = (doctorsApi.getDoctorsBySpecialty as jest.Mock).mock.calls;
    const callWithLocation = allCalls.find(
      ([, params]) => params.latitude === 10 && params.longitude === 20 && params.radius === 15
    );
    expect(callWithLocation).toBeDefined();
    expect(callWithLocation![0]).toBe("Cardiology");
  });

  it("sets error on failure", async () => {
    (doctorsApi.getDoctorsBySpecialty as jest.Mock).mockRejectedValue(new Error("specialty error"));

    const { result } = renderHook(() => useDoctorsBySpecialty("Nutrition"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("specialty error");
    expect(result.current.doctors).toEqual([]);
  });
});

describe("useAdvancedDoctorSearch", () => {
  it("starts with empty state and hasMore true", () => {
    const { result } = renderHook(() => useAdvancedDoctorSearch());

    expect(result.current.doctors).toEqual([]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.currentPage).toBe(1);
  });

  it("searchDoctors fetches and updates state", async () => {
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: Array(12).fill(mockDoctor),
    });

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    await act(async () => {
      await result.current.searchDoctors({ specialty: "Nutrition", limit: 12 });
    });

    expect(result.current.doctors).toHaveLength(12);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.currentPage).toBe(1);
  });

  it("sets hasMore to false when results are fewer than limit", async () => {
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor], // only 1 result, less than default limit of 12
    });

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    await act(async () => {
      await result.current.searchDoctors({});
    });

    expect(result.current.hasMore).toBe(false);
  });

  it("appends results when append is true", async () => {
    const existingDoctor = { ...mockDoctor, _id: "d0" };
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    // Pre-populate doctors via setState is not exposed; instead run two searches
    await act(async () => {
      await result.current.searchDoctors({ page: 1, limit: 1, specialty: "X" });
    });

    // The first call returns mockDoctor, set manually for clarity
    expect(result.current.doctors).toHaveLength(1);

    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [existingDoctor],
    });

    await act(async () => {
      await result.current.searchDoctors({ page: 2, limit: 1, append: true });
    });

    expect(result.current.doctors).toHaveLength(2);
  });

  it("clearResults resets all state", async () => {
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor],
    });

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    await act(async () => {
      await result.current.searchDoctors({});
    });

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.doctors).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
    expect(result.current.currentPage).toBe(1);
  });

  it("loadMore increments page and appends results", async () => {
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: Array(12).fill(mockDoctor),
    });

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    await act(async () => {
      await result.current.searchDoctors({ page: 1, limit: 12 });
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasMore).toBe(true);

    (doctorsApi.getAdvancedDoctors as jest.Mock).mockResolvedValue({
      success: true,
      data: [mockDoctor], // only 1 result on next page
    });

    await act(async () => {
      await result.current.loadMore({});
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.doctors.length).toBeGreaterThan(12);
  });

  it("sets error on failed search", async () => {
    (doctorsApi.getAdvancedDoctors as jest.Mock).mockRejectedValue(new Error("search error"));

    const { result } = renderHook(() => useAdvancedDoctorSearch());

    await act(async () => {
      await result.current.searchDoctors({ specialty: "X" });
    });

    expect(result.current.error).toBe("search error");
    expect(result.current.doctors).toEqual([]);
  });
});
