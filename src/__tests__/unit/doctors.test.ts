import {
  getDoctors,
  getDoctor,
  getNearbyDoctors,
  getDoctorsBySpecialty,
  getAdvancedDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  addDoctorReview,
  Doctor,
  DoctorSearchParams,
} from "@/lib/api/doctors";

// Mock the API config
jest.mock("@/lib/api/config", () => ({
  apiRequest: jest.fn(),
  getApiHeaders: jest.fn(() => ({ "Content-Type": "application/json" })),
  processBackendResponse: jest.fn((response) => response.data),
}));

const { apiRequest } = require("@/lib/api/config");

const mockDoctor: Doctor = {
  _id: "64f8e2a1c9d4b5e6f7890123",
  name: "Dr. Ana García",
  specialty: "Nutrition",
  address: "Calle 123 #45-67, Bogotá",
  location: {
    type: "Point",
    coordinates: [-74.0817, 4.6097],
  },
  author: {
    _id: "64f8e2a1c9d4b5e6f7890456",
    username: "healthuser",
    photo: "profile.jpg",
  },
  contact: [
    {
      phone: "+57 1 234 5678",
      email: "dr.garcia@email.com",
      website: "https://drgarcia.com",
    },
  ],
  education: ["MD - Universidad Nacional", "Especialización en Nutrición"],
  experience: "10 años de experiencia en nutrición vegana",
  languages: ["Spanish", "English"],
  rating: 4.5,
  numReviews: 28,
  reviews: [
    {
      user: "64f8e2a1c9d4b5e6f7890789",
      rating: 5,
      comment: "Excellent nutritionist, very knowledgeable about vegan diets",
      date: "2024-01-15T10:00:00Z",
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

describe("Doctors API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctors", () => {
    it("should fetch doctors without parameters", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const result = await getDoctors();

      expect(apiRequest).toHaveBeenCalledWith("/doctors?");
      expect(result).toEqual(mockResponse);
    });

    it("should fetch doctors with all search parameters", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params: DoctorSearchParams = {
        page: 1,
        limit: 10,
        search: "nutrition",
        specialty: "Nutrition",
        rating: 4,
        location: "Bogotá",
        latitude: 4.6097,
        longitude: -74.0817,
        radius: 5,
        sortBy: "distance",
      };

      const result = await getDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?page=1&limit=10&search=nutrition&specialty=Nutrition&rating=4&location=Bogot%C3%A1&latitude=4.6097&longitude=-74.0817&radius=5&sortBy=distance"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle partial parameters", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = { specialty: "Nutrition", rating: 4 };
      const result = await getDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith("/doctors?specialty=Nutrition&rating=4");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getDoctor", () => {
    it("should fetch a specific doctor by id", async () => {
      const mockResponse = { data: mockDoctor };
      apiRequest.mockResolvedValue(mockResponse);

      const result = await getDoctor("64f8e2a1c9d4b5e6f7890123");

      expect(apiRequest).toHaveBeenCalledWith("/doctors/64f8e2a1c9d4b5e6f7890123");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getNearbyDoctors", () => {
    it("should fetch nearby doctors with required coordinates", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = {
        latitude: 4.6097,
        longitude: -74.0817,
        radius: 10,
        specialty: "Nutrition",
        minRating: 4,
        limit: 20,
      };

      const result = await getNearbyDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?latitude=4.6097&longitude=-74.0817&radius=10&limit=20&specialty=Nutrition&rating=4&sortBy=distance"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should fetch nearby doctors with minimal parameters", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = {
        latitude: 4.6097,
        longitude: -74.0817,
      };

      const result = await getNearbyDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?latitude=4.6097&longitude=-74.0817&sortBy=distance"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getDoctorsBySpecialty", () => {
    it("should fetch doctors by specialty without location", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const result = await getDoctorsBySpecialty("Nutrition");

      expect(apiRequest).toHaveBeenCalledWith("/doctors?specialty=Nutrition");
      expect(result).toEqual(mockResponse);
    });

    it("should fetch doctors by specialty with location and pagination", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = {
        page: 2,
        limit: 15,
        latitude: 4.6097,
        longitude: -74.0817,
        radius: 20,
      };

      const result = await getDoctorsBySpecialty("Nutrition", params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?specialty=Nutrition&page=2&limit=15&latitude=4.6097&longitude=-74.0817&radius=20&sortBy=distance"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getAdvancedDoctors", () => {
    it("should perform advanced search with all parameters", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 12,
        search: "vegan nutrition",
        specialty: "Nutrition",
        minRating: 4,
        languages: ["Spanish", "English"],
        latitude: 4.6097,
        longitude: -74.0817,
        radius: 15,
        sortBy: "rating" as const,
      };

      const result = await getAdvancedDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?page=1&limit=12&search=vegan+nutrition&specialty=Nutrition&rating=4&languages=Spanish&languages=English&latitude=4.6097&longitude=-74.0817&radius=15&sortBy=rating"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle search without location", async () => {
      const mockResponse = { data: [mockDoctor] };
      apiRequest.mockResolvedValue(mockResponse);

      const params = {
        search: "nutrition",
        specialty: "Nutrition",
        sortBy: "name" as const,
      };

      const result = await getAdvancedDoctors(params);

      expect(apiRequest).toHaveBeenCalledWith(
        "/doctors?search=nutrition&specialty=Nutrition&sortBy=name"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createDoctor", () => {
    it("should create a new doctor", async () => {
      const mockResponse = { data: mockDoctor };
      apiRequest.mockResolvedValue(mockResponse);

      const createData = {
        name: "Dr. Ana García",
        specialty: "Nutrition",
        address: "Calle 123 #45-67, Bogotá",
        location: {
          type: "Point",
          coordinates: [-74.0817, 4.6097] as [number, number],
        },
        contact: [
          {
            phone: "+57 1 234 5678",
            email: "dr.garcia@email.com",
          },
        ],
        education: ["MD - Universidad Nacional"],
        experience: "10 años de experiencia",
        languages: ["Spanish", "English"],
      };

      const result = await createDoctor(createData, "mock-token");

      expect(apiRequest).toHaveBeenCalledWith("/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateDoctor", () => {
    it("should update a doctor", async () => {
      const mockResponse = { data: { ...mockDoctor, name: "Dr. Ana García Updated" } };
      apiRequest.mockResolvedValue(mockResponse);

      const updateData = { name: "Dr. Ana García Updated" };
      const result = await updateDoctor("64f8e2a1c9d4b5e6f7890123", updateData, "mock-token");

      expect(apiRequest).toHaveBeenCalledWith("/doctors/64f8e2a1c9d4b5e6f7890123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteDoctor", () => {
    it("should delete a doctor", async () => {
      const mockResponse = { data: undefined };
      apiRequest.mockResolvedValue(mockResponse);

      const result = await deleteDoctor("64f8e2a1c9d4b5e6f7890123", "mock-token");

      expect(apiRequest).toHaveBeenCalledWith("/doctors/64f8e2a1c9d4b5e6f7890123", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("addDoctorReview", () => {
    it("should add a review to a doctor", async () => {
      const updatedDoctor = {
        ...mockDoctor,
        rating: 4.6,
        numReviews: 29,
        reviews: [
          ...mockDoctor.reviews,
          {
            user: "64f8e2a1c9d4b5e6f7890999",
            rating: 5,
            comment: "Great experience!",
            date: "2024-01-20T10:00:00Z",
          },
        ],
      };

      const mockResponse = { data: updatedDoctor };
      apiRequest.mockResolvedValue(mockResponse);

      const reviewData = {
        rating: 5,
        comment: "Great experience!",
      };

      const result = await addDoctorReview("64f8e2a1c9d4b5e6f7890123", reviewData, "mock-token");

      expect(apiRequest).toHaveBeenCalledWith("/doctors/add-review/64f8e2a1c9d4b5e6f7890123", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Error handling", () => {
    it("should handle API errors for getDoctors", async () => {
      const error = new Error("Network error");
      apiRequest.mockRejectedValue(error);

      await expect(getDoctors()).rejects.toThrow("Network error");
    });

    it("should handle API errors for getNearbyDoctors", async () => {
      const error = new Error("Location not found");
      apiRequest.mockRejectedValue(error);

      await expect(
        getNearbyDoctors({
          latitude: 4.6097,
          longitude: -74.0817,
        })
      ).rejects.toThrow("Location not found");
    });

    it("should handle API errors for createDoctor", async () => {
      const error = new Error("Validation error");
      apiRequest.mockRejectedValue(error);

      const createData = {
        name: "Dr. Test",
        specialty: "Nutrition",
        address: "Test Address",
        contact: [],
        education: [],
        experience: "Test experience",
        languages: ["Spanish"],
      };

      await expect(createDoctor(createData)).rejects.toThrow("Validation error");
    });
  });
});
