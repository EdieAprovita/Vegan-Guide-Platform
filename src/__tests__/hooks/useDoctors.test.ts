import { renderHook } from "@testing-library/react";
import {
  useDoctors,
  useDoctor,
  useNearbyDoctors,
  useDoctorsBySpecialty,
  useAdvancedDoctorSearch,
  useDoctorMutations,
} from "@/hooks/useDoctors";
import { useUserLocation } from "@/hooks/useGeolocation";
import * as doctorsApi from "@/lib/api/doctors";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

jest.mock("@/hooks/useGeolocation", () => ({
  useUserLocation: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock("@/lib/api/doctors", () => ({
  getDoctors: jest.fn(),
  getDoctor: jest.fn(),
  searchDoctors: jest.fn(),
  addDoctorReview: jest.fn(),
  getNearbyDoctors: jest.fn(),
  getDoctorsBySpecialty: jest.fn(),
  getAdvancedDoctors: jest.fn(),
  createDoctor: jest.fn(),
  updateDoctor: jest.fn(),
  deleteDoctor: jest.fn(),
}));

const locationMock = useUserLocation as jest.Mock;
const useQueryMock = useQuery as unknown as jest.Mock;
const useMutationMock = useMutation as unknown as jest.Mock;
const useQueryClientMock = useQueryClient as unknown as jest.Mock;

const mockDoctor = {
  _id: "d1",
  name: "Dr. Vegan",
  specialty: "Nutrition",
  address: "123 Green St",
  author: { _id: "u1", username: "author" },
  contact: [],
  education: [],
  experience: "10 years",
  languages: ["English"],
  rating: 4.8,
  numReviews: 15,
  reviews: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

beforeEach(() => {
  locationMock.mockReturnValue({
    userCoords: { lat: 10, lng: 20 },
    getCurrentPosition: jest.fn().mockResolvedValue({ lat: 10, lng: 20 }),
  });
  useQueryMock.mockReturnValue({ data: [mockDoctor], isLoading: false, isError: false });
  useMutationMock.mockReturnValue({ mutate: jest.fn(), isPending: false });
  useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
  jest.clearAllMocks();
  // Re-set after clearAllMocks
  locationMock.mockReturnValue({
    userCoords: { lat: 10, lng: 20 },
    getCurrentPosition: jest.fn().mockResolvedValue({ lat: 10, lng: 20 }),
  });
  useQueryMock.mockReturnValue({ data: [mockDoctor], isLoading: false, isError: false });
  useMutationMock.mockReturnValue({ mutate: jest.fn(), isPending: false });
  useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
});

describe("useDoctors", () => {
  it("calls useQuery with doctors queryKey and params", () => {
    renderHook(() => useDoctors({ specialty: "Nutrition", page: 1 }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["doctors", "list", expect.objectContaining({ specialty: "Nutrition", page: 1 })],
      })
    );
  });

  it("returns data from useQuery", () => {
    const { result } = renderHook(() => useDoctors());
    expect(result.current.data).toEqual([mockDoctor]);
  });
});

describe("useDoctor", () => {
  it("calls useQuery with single doctor queryKey", () => {
    renderHook(() => useDoctor("d1"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["doctors", "detail", "d1"],
        enabled: true,
      })
    );
  });

  it("disables query when id is empty", () => {
    renderHook(() => useDoctor(""));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});

describe("useNearbyDoctors", () => {
  it("calls useQuery with nearbyDoctors queryKey", () => {
    renderHook(() => useNearbyDoctors({ radius: 7 }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(["doctors", "nearby"]),
      })
    );
  });
});

describe("useDoctorsBySpecialty", () => {
  it("calls useQuery with specialty queryKey", () => {
    renderHook(() => useDoctorsBySpecialty("Nutrition"));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(["doctors", "bySpecialty", "Nutrition"]),
        enabled: true,
      })
    );
  });

  it("disables query when specialty is empty", () => {
    renderHook(() => useDoctorsBySpecialty(""));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});

describe("useAdvancedDoctorSearch", () => {
  it("calls useQuery with advancedDoctorSearch queryKey", () => {
    renderHook(() => useAdvancedDoctorSearch({ specialty: "Nutrition", limit: 12 }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: expect.arrayContaining(["doctors", "search"]),
      })
    );
  });
});

describe("useDoctorMutations", () => {
  it("returns mutation helpers", () => {
    const invalidateQueries = jest.fn();
    useQueryClientMock.mockReturnValue({ invalidateQueries });

    const { result } = renderHook(() => useDoctorMutations());

    expect(result.current.create).toBeDefined();
    expect(result.current.update).toBeDefined();
    expect(result.current.remove).toBeDefined();
    expect(result.current.addReview).toBeDefined();
  });
});
