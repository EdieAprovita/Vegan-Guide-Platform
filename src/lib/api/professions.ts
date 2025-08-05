import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from './config';

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

export async function getProfessions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  return apiRequest<BackendListResponse<Profession>>(`/professions?${searchParams.toString()}`);
}

export async function getProfession(id: string): Promise<Profession> {
  return apiRequest<BackendResponse<Profession>>(`/professions/${id}`);
}

export async function createProfession(data: CreateProfessionData, token?: string) {
  return apiRequest<BackendResponse<Profession>>(`/professions`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateProfession(id: string, data: Partial<CreateProfessionData>, token?: string) {
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

export async function getProfessionalProfiles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  profession?: string;
  skills?: string;
  availability?: boolean;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.profession) searchParams.append("profession", params.profession);
  if (params?.skills) searchParams.append("skills", params.skills);
  if (params?.availability !== undefined) searchParams.append("availability", params.availability.toString());
  if (params?.location) searchParams.append("location", params.location);

  return apiRequest<PaginatedResponse<ProfessionalProfile>>(`/professionalProfile?${searchParams.toString()}`);
}

export async function getProfessionalProfile(id: string): Promise<ProfessionalProfile> {
  return apiRequest<ProfessionalProfile>(`/professionalProfile/${id}`);
}

export async function createProfessionalProfile(data: CreateProfessionalProfileData, token?: string) {
  return apiRequest<ProfessionalProfile>(`/professionalProfile`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateProfessionalProfile(id: string, data: Partial<CreateProfessionalProfileData>, token?: string) {
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