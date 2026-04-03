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

  it("forwards AbortSignal to getDoctors in queryFn", async () => {
    (doctorsApi.getDoctors as jest.Mock).mockResolvedValue({ success: true, data: [mockDoctor] });
    renderHook(() => useDoctors({ specialty: "Nutrition" }));

    const queryOptions = useQueryMock.mock.calls[0][0];
    const signal = new AbortController().signal;

    await queryOptions.queryFn({ signal });

    expect(doctorsApi.getDoctors).toHaveBeenCalledWith(
      expect.objectContaining({ specialty: "Nutrition" }),
      signal
    );
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

  it("disables nearby query when user coordinates are unavailable", () => {
    locationMock.mockReturnValue({
      userCoords: null,
      getCurrentPosition: jest.fn(),
    });

    renderHook(() => useNearbyDoctors({ radius: 7 }));

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
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

  it("invalidates doctor lists and detail on update success", () => {
    const invalidateQueries = jest.fn();
    useQueryClientMock.mockReturnValue({ invalidateQueries });

    renderHook(() => useDoctorMutations());

    const updateMutationConfig = useMutationMock.mock.calls[1][0];
    updateMutationConfig.onSuccess(undefined, { id: "doctor-1", data: {} });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["doctors"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["doctors", "detail", "doctor-1"],
    });
  });

  it("createDoctor mutation forwards token to API function (H-05)", async () => {
    useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
    (doctorsApi.createDoctor as jest.Mock).mockResolvedValue({
      success: true,
      data: mockDoctor,
    });

    renderHook(() => useDoctorMutations());

    const createMutationConfig = useMutationMock.mock.calls[0][0];
    const mockData = {
      name: "Dr. Test",
      specialty: "Nutrition",
      address: {
        street: "123 Health St",
        city: "Wellness City",
        state: "CA",
        zipCode: "90210",
        country: "USA",
      },
      contact: {
        phone: "+1-555-0100",
        email: "dr.test@example.com",
      },
      education: [{ degree: "MD", institution: "Test Medical University", year: 2015 }],
      experience: 10,
      languages: ["English"],
    };
    const mockToken = "test-token-123";

    await createMutationConfig.mutationFn({ data: mockData, token: mockToken });

    expect(doctorsApi.createDoctor).toHaveBeenCalledWith(mockData, mockToken);
  });

  it("updateDoctor mutation forwards token to API function (H-05)", async () => {
    useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
    (doctorsApi.updateDoctor as jest.Mock).mockResolvedValue({
      success: true,
      data: mockDoctor,
    });

    renderHook(() => useDoctorMutations());

    const updateMutationConfig = useMutationMock.mock.calls[1][0];
    const mockData = { specialty: "Cardiology" };
    const mockToken = "test-token-456";

    await updateMutationConfig.mutationFn({ id: "doctor-1", data: mockData, token: mockToken });

    expect(doctorsApi.updateDoctor).toHaveBeenCalledWith("doctor-1", mockData, mockToken);
  });

  it("deleteDoctor mutation forwards token to API function (H-05)", async () => {
    useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
    (doctorsApi.deleteDoctor as jest.Mock).mockResolvedValue({ success: true });

    renderHook(() => useDoctorMutations());

    const removeMutationConfig = useMutationMock.mock.calls[2][0];
    const mockToken = "test-token-789";

    await removeMutationConfig.mutationFn({ id: "doctor-2", token: mockToken });

    expect(doctorsApi.deleteDoctor).toHaveBeenCalledWith("doctor-2", mockToken);
  });
});
