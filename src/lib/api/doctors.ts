import {
  apiRequest,
  getApiHeaders,
  BackendListResponse,
  BackendResponse,
  ApiError,
} from "./config";
import { buildSearchParams } from "./utils";
import { GeoLocation } from "@/types/geospatial";

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  address: string;
  location?: GeoLocation;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  education: string[];
  experience: string;
  languages: string[];
  rating: number;
  numReviews: number;
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorData {
  name: string;
  specialty: string;
  address: string;
  location?: GeoLocation;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  education: string[];
  experience: string;
  languages: string[];
}

export interface DoctorReview {
  rating: number;
  comment: string;
}

export interface DoctorSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "name" | "createdAt";
}

export async function getDoctors(params?: DoctorSearchParams, signal?: AbortSignal) {
  const searchParams = buildSearchParams({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    specialty: params?.specialty,
    rating: params?.rating,
    location: params?.location,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy: params?.sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`, {
      signal,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] };
      }
    }
    throw error;
  }
}

export async function getDoctor(id: string, signal?: AbortSignal) {
  try {
    return await apiRequest<BackendResponse<Doctor>>(`/doctors/${id}`, { signal });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] as unknown as Doctor };
      }
    }
    throw error;
  }
}

export async function searchDoctors(query: string, signal?: AbortSignal) {
  const searchParams = buildSearchParams({ search: query });
  return apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`, { signal });
}

export async function createDoctor(data: CreateDoctorData, token?: string) {
  return apiRequest<BackendResponse<Doctor>>(`/doctors`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(id: string, data: Partial<CreateDoctorData>, token?: string) {
  return apiRequest<BackendResponse<Doctor>>(`/doctors/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/doctors/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addDoctorReview(id: string, review: DoctorReview, token?: string) {
  return apiRequest<BackendResponse<Doctor>>(`/doctors/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

export async function getNearbyDoctors(
  params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
    specialty?: string;
    minRating?: number;
  },
  signal?: AbortSignal
) {
  const searchParams = buildSearchParams(
    {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      limit: params.limit,
      specialty: params.specialty,
      minRating: params.minRating,
      sortBy: "distance",
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`, {
      signal,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] };
      }
    }
    throw error;
  }
}

export async function getDoctorsBySpecialty(
  specialty: string,
  params?: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  },
  signal?: AbortSignal
) {
  // sortBy is conditionally added only when both coordinates are present
  const sortBy =
    params?.latitude !== undefined && params?.longitude !== undefined ? "distance" : undefined;

  const searchParams = buildSearchParams({
    specialty,
    page: params?.page,
    limit: params?.limit,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`, {
      signal,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] };
      }
    }
    throw error;
  }
}

export async function getAdvancedDoctors(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    specialty?: string;
    minRating?: number;
    languages?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: "distance" | "rating" | "name" | "createdAt";
  },
  signal?: AbortSignal
) {
  const searchParams = buildSearchParams(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
      specialty: params.specialty,
      minRating: params.minRating,
      languages: params.languages,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      sortBy: params.sortBy,
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`, {
      signal,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] };
      }
    }
    throw error;
  }
}
