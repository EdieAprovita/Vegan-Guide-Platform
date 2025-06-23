const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  const response = await fetch(
    `${API_URL}/sanctuaries?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch sanctuaries");
  }

  return response.json();
}

export async function getSanctuary(id: string): Promise<Sanctuary> {
  const response = await fetch(`${API_URL}/sanctuaries/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch sanctuary");
  }

  return response.json();
}

export async function createSanctuary(data: CreateSanctuaryData) {
  const response = await fetch(`${API_URL}/sanctuaries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create sanctuary");
  }

  return response.json();
}

export async function updateSanctuary(id: string, data: Partial<CreateSanctuaryData>) {
  const response = await fetch(`${API_URL}/sanctuaries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update sanctuary");
  }

  return response.json();
}

export async function deleteSanctuary(id: string) {
  const response = await fetch(`${API_URL}/sanctuaries/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete sanctuary");
  }

  return response.json();
}

export async function addSanctuaryReview(id: string, review: SanctuaryReview) {
  const response = await fetch(`${API_URL}/sanctuaries/add-review/${id}`, {
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