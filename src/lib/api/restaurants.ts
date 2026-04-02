import {
  apiRequest,
  getApiHeaders,
  BackendListResponse,
  BackendResponse,
  shouldUseApiFallback,
  isNonApiTransportError,
} from "./config";
import { buildSearchParams } from "./utils";
import { Review } from "@/types";
import { GeoLocation } from "@/types/geospatial";

// WARNING: Mock/fallback data is only used for transport failures in
// development or explicit build-time fallback mode.
export interface Restaurant {
  _id: string;
  restaurantName: string;
  name: string; // Alias for restaurantName for compatibility
  address: string;
  city?: string; // City for display purposes
  country?: string; // Country for display purposes
  phone?: string; // Direct phone access for compatibility
  website?: string; // Website URL
  location?: GeoLocation;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  contact: {
    phone?: string;
    facebook?: string;
    instagram?: string;
  }[];
  cuisine: string[];
  image?: string; // Restaurant image
  rating: number;
  numReviews: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantData {
  restaurantName: string;
  address: string;
  location?: GeoLocation;
  contact: {
    phone?: string;
    facebook?: string;
    instagram?: string;
  }[];
  cuisine: string[];
  image?: string;
}

export interface RestaurantReview {
  rating: number;
  comment: string;
}

export interface RestaurantSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "restaurantName" | "createdAt";
}

export async function getRestaurants(params?: RestaurantSearchParams, signal?: AbortSignal) {
  const searchParams = buildSearchParams({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    cuisine: params?.cuisine,
    rating: params?.rating,
    location: params?.location,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy: params?.sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Restaurant>>(
      `/restaurants?${searchParams.toString()}`,
      { signal }
    );
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn(
        "[API Fallback] restaurants list: backend unavailable, returning empty data.",
        error
      );
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getRestaurant(id: string, signal?: AbortSignal) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/${id}`, { signal });
}

export async function getTopRatedRestaurants(limit: number = 10, signal?: AbortSignal) {
  return apiRequest<BackendListResponse<Restaurant>>(`/restaurants/top-rated?limit=${limit}`, {
    signal,
  });
}

export async function createRestaurant(data: CreateRestaurantData, token?: string) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateRestaurant(
  id: string,
  data: Partial<CreateRestaurantData>,
  token?: string
) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteRestaurant(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/restaurants/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addRestaurantReview(id: string, review: RestaurantReview, token?: string) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

export async function getNearbyRestaurants(
  params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
    cuisine?: string;
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
      cuisine: params.cuisine,
      minRating: params.minRating,
      sortBy: "distance",
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Restaurant>>(
      `/restaurants?${searchParams.toString()}`,
      { signal }
    );
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn(
        "[API Fallback] nearby restaurants: backend unavailable, returning empty data.",
        error
      );
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getRestaurantsByCuisine(
  cuisine: string,
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
    cuisine,
    page: params?.page,
    limit: params?.limit,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Restaurant>>(
      `/restaurants?${searchParams.toString()}`,
      { signal }
    );
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn(
        "[API Fallback] restaurants by cuisine: backend unavailable, returning empty data.",
        error
      );
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getAdvancedRestaurants(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    cuisine?: string[];
    minRating?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    sortBy?: "distance" | "rating" | "restaurantName" | "createdAt";
  },
  signal?: AbortSignal
) {
  const searchParams = buildSearchParams(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
      minRating: params.minRating,
      cuisine: params.cuisine,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      sortBy: params.sortBy,
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Restaurant>>(
      `/restaurants?${searchParams.toString()}`,
      { signal }
    );
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn(
        "[API Fallback] advanced restaurants: backend unavailable, returning empty data.",
        error
      );
      return { success: true, data: [] };
    }
    throw error;
  }
}
