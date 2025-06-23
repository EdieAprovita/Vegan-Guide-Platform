const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  const response = await fetch(
    `${API_URL}/professions?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch professions");
  }

  return response.json();
}

export async function getProfession(id: string): Promise<Profession> {
  const response = await fetch(`${API_URL}/professions/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch profession");
  }

  return response.json();
}

export async function createProfession(data: CreateProfessionData) {
  const response = await fetch(`${API_URL}/professions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create profession");
  }

  return response.json();
}

export async function updateProfession(id: string, data: Partial<CreateProfessionData>) {
  const response = await fetch(`${API_URL}/professions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profession");
  }

  return response.json();
}

export async function deleteProfession(id: string) {
  const response = await fetch(`${API_URL}/professions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete profession");
  }

  return response.json();
}

export async function addProfessionReview(id: string, review: ProfessionReview) {
  const response = await fetch(`${API_URL}/professions/add-review/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add review");
  }

  return response.json();
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

  const response = await fetch(
    `${API_URL}/professionalProfile?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch professional profiles");
  }

  return response.json();
}

export async function getProfessionalProfile(id: string): Promise<ProfessionalProfile> {
  const response = await fetch(`${API_URL}/professionalProfile/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch professional profile");
  }

  return response.json();
}

export async function createProfessionalProfile(data: CreateProfessionalProfileData) {
  const response = await fetch(`${API_URL}/professionalProfile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create professional profile");
  }

  return response.json();
}

export async function updateProfessionalProfile(id: string, data: Partial<CreateProfessionalProfileData>) {
  const response = await fetch(`${API_URL}/professionalProfile/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update professional profile");
  }

  return response.json();
}

export async function deleteProfessionalProfile(id: string) {
  const response = await fetch(`${API_URL}/professionalProfile/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete professional profile");
  }

  return response.json();
}