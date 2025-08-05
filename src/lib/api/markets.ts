import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from './config';

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

export async function getMarkets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  products?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.products) searchParams.append("products", params.products);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

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

export async function addMarketReview(
  id: string,
  review: MarketReview,
  token?: string
) {
  return apiRequest<BackendResponse<Market>>(`/markets/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
} 