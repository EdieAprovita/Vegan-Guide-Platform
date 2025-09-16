import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from "./config";

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

export interface SanctuarySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  typeofSanctuary?: string;
  rating?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "sanctuaryName" | "createdAt";
}

export async function getSanctuaries(params?: SanctuarySearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.typeofSanctuary) searchParams.append("typeofSanctuary", params.typeofSanctuary);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

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

export async function updateSanctuary(
  id: string,
  data: Partial<CreateSanctuaryData>,
  token?: string
) {
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

export async function getNearbySanctuaries(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  typeofSanctuary?: string;
  minRating?: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("latitude", params.latitude.toString());
  searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.typeofSanctuary) searchParams.append("typeofSanctuary", params.typeofSanctuary);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  searchParams.append("sortBy", "distance");

  return apiRequest<BackendListResponse<Sanctuary>>(`/sanctuaries?${searchParams.toString()}`);
}

export async function getSanctuariesByType(
  typeofSanctuary: string,
  params?: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }
) {
  const searchParams = new URLSearchParams();
  searchParams.append("typeofSanctuary", typeofSanctuary);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.latitude && params?.longitude) {
    searchParams.append("sortBy", "distance");
  }

  return apiRequest<BackendListResponse<Sanctuary>>(`/sanctuaries?${searchParams.toString()}`);
}

export async function getAdvancedSanctuaries(params: {
  page?: number;
  limit?: number;
  search?: string;
  typeofSanctuary?: string[];
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "distance" | "rating" | "sanctuaryName" | "createdAt";
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  if (params.typeofSanctuary?.length) {
    params.typeofSanctuary.forEach((type) => searchParams.append("typeofSanctuary", type));
  }
  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Sanctuary>>(`/sanctuaries?${searchParams.toString()}`);
}
