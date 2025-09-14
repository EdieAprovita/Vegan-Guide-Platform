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

export async function getDoctors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.specialty) searchParams.append("specialty", params.specialty);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

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
