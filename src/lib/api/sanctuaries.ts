import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from './config';

export interface Animal {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  description?: string;
  rescued?: boolean;
  rescueDate?: Date;
  healthStatus?: string;
  specialNeeds?: string[];
}

export interface Sanctuary {
  _id: string;
  sanctuaryName: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  typeofSanctuary: string;
  animals: Animal[];
  capacity: number;
  caretakers: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
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

export interface CreateSanctuaryData {
  sanctuaryName: string;
  address?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  image: string;
  typeofSanctuary: string;
  animals: Animal[];
  capacity: number;
  caretakers: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  }[];
}

export interface SanctuaryReview {
  rating: number;
  comment: string;
}

export async function getSanctuaries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  typeofSanctuary?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.typeofSanctuary) searchParams.append("typeofSanctuary", params.typeofSanctuary);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  return apiRequest<BackendListResponse<Sanctuary>>(`/sanctuaries?${searchParams.toString()}`);
}

export async function getSanctuary(id: string) {
  return apiRequest<BackendResponse<Sanctuary>>(`/sanctuaries/${id}`);
}

export async function createSanctuary(data: CreateSanctuaryData, token?: string) {
  return apiRequest<BackendResponse<Sanctuary>>(`/sanctuaries`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateSanctuary(id: string, data: Partial<CreateSanctuaryData>, token?: string) {
  return apiRequest<BackendResponse<Sanctuary>>(`/sanctuaries/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteSanctuary(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/sanctuaries/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addSanctuaryReview(id: string, review: SanctuaryReview, token?: string) {
  return apiRequest<BackendResponse<Sanctuary>>(`/sanctuaries/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}