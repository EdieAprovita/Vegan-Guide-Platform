import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from "./config";

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
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
  location?: {
    type: string;
    coordinates: [number, number];
  };
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

export async function getDoctors(params?: DoctorSearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.specialty) searchParams.append("specialty", params.specialty);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`);
}

export async function getDoctor(id: string) {
  return apiRequest<BackendResponse<Doctor>>(`/doctors/${id}`);
}

export async function searchDoctors(query: string) {
  return apiRequest<BackendListResponse<Doctor>>(`/doctors?search=${query}`);
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

export async function getNearbyDoctors(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  specialty?: string;
  minRating?: number;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append("latitude", params.latitude.toString());
  searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.specialty) searchParams.append("specialty", params.specialty);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  searchParams.append("sortBy", "distance");

  return apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`);
}

export async function getDoctorsBySpecialty(
  specialty: string,
  params?: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }
) {
  const searchParams = new URLSearchParams();
  searchParams.append("specialty", specialty);
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.latitude && params?.longitude) {
    searchParams.append("sortBy", "distance");
  }

  return apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`);
}

export async function getAdvancedDoctors(params: {
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
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.specialty) searchParams.append("specialty", params.specialty);
  if (params.minRating) searchParams.append("rating", params.minRating.toString());
  if (params.languages?.length) {
    params.languages.forEach((lang) => searchParams.append("languages", lang));
  }
  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Doctor>>(`/doctors?${searchParams.toString()}`);
}
