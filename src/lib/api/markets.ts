import {
  apiRequest,
  getApiHeaders,
  BackendListResponse,
  BackendResponse,
  shouldUseApiFallback,
  isNonApiTransportError,
} from "./config";
import { buildSearchParams } from "./utils";
import { GeoLocation } from "@/types/geospatial";

export interface Market {
  _id: string;
  marketName: string;
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
  products: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
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

export interface CreateMarketData {
  marketName: string;
  address: string;
  location?: GeoLocation;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  products: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface MarketReview {
  rating: number;
  comment: string;
}

export interface MarketSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  products?: string;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "marketName" | "createdAt";
}

export async function getMarkets(params?: MarketSearchParams, signal?: AbortSignal) {
  const searchParams = buildSearchParams({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
    products: params?.products,
    rating: params?.rating,
    location: params?.location,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy: params?.sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`, {
      signal,
    });
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn("[API Fallback] markets list: backend unavailable, returning empty data.", error);
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getMarket(id: string, signal?: AbortSignal) {
  try {
    return await apiRequest<BackendResponse<Market>>(`/markets/${id}`, { signal });
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn("[API Fallback] market detail: backend unavailable, returning empty object.", error);
      return { success: true, data: {} as Market };
    }
    throw error;
  }
}

export async function createMarket(data: CreateMarketData, token?: string) {
  return apiRequest<BackendResponse<Market>>(`/markets`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateMarket(id: string, data: Partial<CreateMarketData>, token?: string) {
  return apiRequest<BackendResponse<Market>>(`/markets/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteMarket(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/markets/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addMarketReview(id: string, review: MarketReview, token?: string) {
  return apiRequest<BackendResponse<Market>>(`/markets/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

export async function getNearbyMarkets(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  products?: string;
  minRating?: number;
}, signal?: AbortSignal) {
  const searchParams = buildSearchParams(
    {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      limit: params.limit,
      products: params.products,
      minRating: params.minRating,
      sortBy: "distance",
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`, { signal });
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn("[API Fallback] nearby markets: backend unavailable, returning empty data.", error);
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getMarketsByProducts(
  products: string,
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
    products,
    page: params?.page,
    limit: params?.limit,
    latitude: params?.latitude,
    longitude: params?.longitude,
    radius: params?.radius,
    sortBy,
  });

  try {
    return await apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`, { signal });
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn("[API Fallback] markets by products: backend unavailable, returning empty data.", error);
      return { success: true, data: [] };
    }
    throw error;
  }
}

export async function getAdvancedMarkets(params: {
  page?: number;
  limit?: number;
  search?: string;
  products?: string[];
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "marketName" | "createdAt";
}, signal?: AbortSignal) {
  const searchParams = buildSearchParams(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
      minRating: params.minRating,
      products: params.products,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      sortBy: params.sortBy,
    },
    { minRating: "rating" }
  );

  try {
    return await apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`, { signal });
  } catch (error) {
    if (shouldUseApiFallback() && isNonApiTransportError(error)) {
      console.warn("[API Fallback] advanced markets: backend unavailable, returning empty data.", error);
      return { success: true, data: [] };
    }
    throw error;
  }
}
