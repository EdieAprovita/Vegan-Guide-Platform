import { apiRequest, getApiHeaders, BackendResponse } from './config';

export interface Business {
  _id: string;
  namePlace: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  contact: Array<{
    phone?: string;
    email?: string;
    website?: string;
  }>;
  budget: number;
  typeBusiness: string;
  hours: Date[];
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
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  contact: Array<{
    phone?: string;
    email?: string;
    website?: string;
  }>;
  budget: number;
  typeBusiness: string;
  hours: Date[];
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
}

export async function getBusinesses(filters?: BusinessFilters) {
  const searchParams = new URLSearchParams();
  
  if (filters?.page) searchParams.append("page", filters.page.toString());
  if (filters?.limit) searchParams.append("limit", filters.limit.toString());
  if (filters?.search) searchParams.append("search", filters.search);
  if (filters?.typeBusiness) searchParams.append("typeBusiness", filters.typeBusiness);
  if (filters?.rating) searchParams.append("rating", filters.rating.toString());
  if (filters?.location) searchParams.append("location", filters.location);

  const queryString = searchParams.toString();
  const url = queryString ? `/businesses?${queryString}` : '/businesses';
  
  return apiRequest<BackendResponse<Business[]>>(url);
}

export async function getBusiness(id: string) {
  return apiRequest<BackendResponse<Business>>(`/businesses/${id}`);
}

export async function createBusiness(data: CreateBusinessData, token?: string) {
  return apiRequest<BackendResponse<Business>>('/businesses', {
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
  return apiRequest<BackendResponse<Business>>(`/businesses/${id}/reviews`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

export async function getBusinessReviews(id: string, params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  return apiRequest<BackendResponse<BusinessReview[]>>(`/businesses/${id}/reviews?${searchParams.toString()}`);
}