import { apiRequest, getApiHeaders, BackendResponse, ApiError } from "./config";
import { buildSearchParams } from "./utils";
import { GeoLocation } from "@/types/geospatial";

export interface Business {
  _id: string;
  namePlace: string;
  address: string;
  location?: GeoLocation;
  image: string;
  contact: Array<{
    phone?: string;
    email?: string;
    website?: string;
  }>;
  budget: number;
  typeBusiness: string;
  hours: { dayOfWeek: string; openTime: string; closeTime: string }[];
  rating?: number;
  numReviews?: number;
  reviews?: BusinessReview[];
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessData {
  namePlace: string;
  address: string;
  location?: GeoLocation;
  image: string;
  contact: Array<{
    phone?: string;
    email?: string;
    website?: string;
  }>;
  budget: number;
  typeBusiness: string;
  hours: { dayOfWeek: string; openTime: string; closeTime: string }[];
}

export interface BusinessReview {
  rating: number;
  comment: string;
}

export interface BusinessFilters {
  page?: number;
  limit?: number;
  search?: string;
  typeBusiness?: string;
  rating?: number;
  location?: string;
  // Nuevos parámetros geoespaciales
  lat?: number;
  lng?: number;
  radius?: number; // en kilómetros
  budget?: number;
}

export async function getBusinesses(filters?: BusinessFilters) {
  // Geospatial params are only sent when both lat and lng are present (original logic).
  const geoParams =
    filters?.lat !== undefined && filters?.lng !== undefined
      ? {
          lat: filters.lat,
          lng: filters.lng,
          ...(filters.radius !== undefined ? { radius: filters.radius } : {}),
        }
      : {};

  const searchParams = buildSearchParams({
    page: filters?.page,
    limit: filters?.limit,
    search: filters?.search,
    typeBusiness: filters?.typeBusiness,
    rating: filters?.rating,
    location: filters?.location,
    budget: filters?.budget,
    ...geoParams,
  });

  const queryString = searchParams.toString();
  const url = queryString ? `/businesses?${queryString}` : "/businesses";

  try {
    return await apiRequest<BackendResponse<Business[]>>(url);
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

export async function getBusiness(id: string) {
  try {
    return await apiRequest<BackendResponse<Business>>(`/businesses/${id}`);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.status
      const isApiError = (error as any)?.status !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] as unknown as Business };
      }
    }
    throw error;
  }
}

export async function createBusiness(data: CreateBusinessData, token?: string) {
  return apiRequest<BackendResponse<Business>>("/businesses", {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateBusiness(
  id: string,
  data: Partial<CreateBusinessData>,
  token?: string
) {
  return apiRequest<BackendResponse<Business>>(`/businesses/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteBusiness(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/businesses/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addBusinessReview(id: string, review: BusinessReview, token?: string) {
  return apiRequest<BackendResponse<Business>>(`/businesses/${id}/reviews`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

export async function getBusinessReviews(
  id: string,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const searchParams = buildSearchParams({
    page: params?.page,
    limit: params?.limit,
  });

  try {
    return await apiRequest<BackendResponse<BusinessReview[]>>(
      `/businesses/${id}/reviews?${searchParams.toString()}`
    );
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

// Nueva función para búsqueda por proximidad
export async function getBusinessesByProximity(lat: number, lng: number, radius: number = 5) {
  try {
    return await apiRequest<BackendResponse<Business[]>>(
      `/businesses/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
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

// Nueva función para búsqueda avanzada
export async function searchBusinesses(query: string, filters: BusinessFilters = {}) {
  const searchParams = buildSearchParams({ q: query, ...filters });

  try {
    return await apiRequest<BackendResponse<Business[]>>(
      `/businesses/search?${searchParams.toString()}`
    );
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
