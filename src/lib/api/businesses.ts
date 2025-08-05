import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from './config';

export interface Business {
  _id: string;
  namePlace: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  budget: number;
  typeBusiness: string;
  hours: Date[];
  reviews: {
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  rating: number;
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessData {
  namePlace: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
  budget: number;
  typeBusiness: string;
  hours: Date[];
}

export interface BusinessReview {
  rating: number;
  comment: string;
}

export async function getBusinesses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  typeBusiness?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.typeBusiness) searchParams.append("typeBusiness", params.typeBusiness);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  return apiRequest<BackendListResponse<Business>>(`/businesses?${searchParams.toString()}`);
}

export async function getBusiness(id: string) {
  return apiRequest<BackendResponse<Business>>(`/businesses/${id}`);
}

export async function createBusiness(data: CreateBusinessData, token?: string) {
  return apiRequest<BackendResponse<Business>>(`/businesses`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateBusiness(id: string, data: Partial<CreateBusinessData>, token?: string) {
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
  return apiRequest<BackendResponse<Business>>(`/businesses/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}