import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from "./config";

export interface Market {
  _id: string;
  marketName: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
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
  location?: {
    type: string;
    coordinates: [number, number];
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

export async function getMarkets(params?: MarketSearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.products) searchParams.append("products", params.products);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`);
}

export async function getMarket(id: string) {
  return apiRequest<BackendResponse<Market>>(`/markets/${id}`);
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
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("latitude", params.latitude.toString());
  searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.products) searchParams.append("products", params.products);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  searchParams.append("sortBy", "distance");

  return apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`);
}

export async function getMarketsByProducts(
  products: string,
  params?: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }
) {
  const searchParams = new URLSearchParams();
  searchParams.append("products", products);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.latitude && params?.longitude) {
    searchParams.append("sortBy", "distance");
  }

  return apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`);
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
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  if (params.products?.length) {
    params.products.forEach((product) => searchParams.append("products", product));
  }
  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Market>>(`/markets?${searchParams.toString()}`);
}
