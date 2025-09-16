import {
  apiRequest,
  getApiHeaders,
  BackendListResponse,
  BackendResponse,
  PaginatedResponse,
} from "./config";

export interface Profession {
  _id: string;
  professionName: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  description: string;
  category: string;
  requirements: string[];
  skills: string[];
  education: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
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

export interface CreateProfessionData {
  professionName: string;
  description: string;
  category: string;
  requirements: string[];
  skills: string[];
  education: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface ProfessionReview {
  rating: number;
  comment: string;
}

export interface ProfessionSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  rating?: number;
  location?: string;
  // Geospatial parameters
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  sortBy?: "professionName" | "distance" | "rating";
}

export async function getProfessions(params?: ProfessionSearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<BackendListResponse<Profession>>(`/professions?${searchParams.toString()}`);
}

export async function getProfession(id: string) {
  return apiRequest<BackendResponse<Profession>>(`/professions/${id}`);
}

export async function createProfession(data: CreateProfessionData, token?: string) {
  return apiRequest<BackendResponse<Profession>>(`/professions`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateProfession(
  id: string,
  data: Partial<CreateProfessionData>,
  token?: string
) {
  return apiRequest<BackendResponse<Profession>>(`/professions/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteProfession(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/professions/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addProfessionReview(id: string, review: ProfessionReview, token?: string) {
  return apiRequest<BackendResponse<Profession>>(`/professions/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}

// Professional Profiles API
export interface ProfessionalProfile {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    photo?: string;
  };
  profession: {
    _id: string;
    professionName: string;
  };
  bio: string;
  experience: string;
  education: string[];
  certifications: string[];
  skills: string[];
  portfolio: {
    title: string;
    description: string;
    url?: string;
    image?: string;
  }[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    linkedin?: string;
  };
  availability: boolean;
  rates?: {
    hourly?: number;
    project?: number;
    currency: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalProfileData {
  profession: string;
  bio: string;
  experience: string;
  education: string[];
  certifications: string[];
  skills: string[];
  portfolio: {
    title: string;
    description: string;
    url?: string;
    image?: string;
  }[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    linkedin?: string;
  };
  availability: boolean;
  rates?: {
    hourly?: number;
    project?: number;
    currency: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface ProfessionalProfileSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  profession?: string;
  skills?: string;
  availability?: boolean;
  location?: string;
  // Geospatial parameters
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  sortBy?: "user.username" | "distance" | "rates.hourly";
}

export async function getProfessionalProfiles(params?: ProfessionalProfileSearchParams) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.profession) searchParams.append("profession", params.profession);
  if (params?.skills) searchParams.append("skills", params.skills);
  if (params?.availability !== undefined)
    searchParams.append("availability", params.availability.toString());
  if (params?.location) searchParams.append("location", params.location);
  if (params?.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params?.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params?.radius) searchParams.append("radius", params.radius.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

  return apiRequest<PaginatedResponse<ProfessionalProfile>>(
    `/professionalProfile?${searchParams.toString()}`
  );
}

export async function getProfessionalProfile(id: string) {
  return apiRequest<BackendResponse<ProfessionalProfile>>(`/professionalProfile/${id}`);
}

export async function createProfessionalProfile(
  data: CreateProfessionalProfileData,
  token?: string
) {
  return apiRequest<ProfessionalProfile>(`/professionalProfile`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateProfessionalProfile(
  id: string,
  data: Partial<CreateProfessionalProfileData>,
  token?: string
) {
  return apiRequest<ProfessionalProfile>(`/professionalProfile/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteProfessionalProfile(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/professionalProfile/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

// Geospatial functions for Professions
export async function getNearbyProfessions(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  category?: string;
  rating?: number;
}) {
  const searchParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    radius: (params.radius || 5).toString(),
    sortBy: "distance",
  });

  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.category) searchParams.append("category", params.category);
  if (params.rating) searchParams.append("rating", params.rating.toString());

  return apiRequest<BackendListResponse<Profession>>(`/professions?${searchParams.toString()}`);
}

export async function getProfessionsByCategory(params: {
  category: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  sortBy?: "professionName" | "distance" | "rating";
}) {
  const searchParams = new URLSearchParams({
    category: params.category,
    sortBy: params.sortBy || "professionName",
  });

  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", (params.radius || 10).toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  return apiRequest<BackendListResponse<Profession>>(`/professions?${searchParams.toString()}`);
}

// Geospatial functions for Professional Profiles
export async function getNearbyProfessionalProfiles(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  profession?: string;
  skills?: string;
  availability?: boolean;
}) {
  const searchParams = new URLSearchParams({
    latitude: params.latitude.toString(),
    longitude: params.longitude.toString(),
    radius: (params.radius || 5).toString(),
    sortBy: "distance",
  });

  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.profession) searchParams.append("profession", params.profession);
  if (params.skills) searchParams.append("skills", params.skills);
  if (params.availability !== undefined)
    searchParams.append("availability", params.availability.toString());

  return apiRequest<PaginatedResponse<ProfessionalProfile>>(
    `/professionalProfile?${searchParams.toString()}`
  );
}

export async function getAdvancedProfessionalProfiles(params: {
  search?: string;
  profession?: string;
  skills?: string[];
  availability?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sortBy?: "user.username" | "distance" | "rates.hourly";
  limit?: number;
  page?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.profession) searchParams.append("profession", params.profession);
  if (params.skills && params.skills.length > 0)
    searchParams.append("skills", params.skills.join(","));
  if (params.availability !== undefined)
    searchParams.append("availability", params.availability.toString());
  if (params.latitude) searchParams.append("latitude", params.latitude.toString());
  if (params.longitude) searchParams.append("longitude", params.longitude.toString());
  if (params.radius) searchParams.append("radius", params.radius.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.page) searchParams.append("page", params.page.toString());

  return apiRequest<PaginatedResponse<ProfessionalProfile>>(
    `/professionalProfile?${searchParams.toString()}`
  );
}
