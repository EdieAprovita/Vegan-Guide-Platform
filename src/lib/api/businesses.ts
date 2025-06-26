const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  const response = await fetch(
    `${API_URL}/businesses?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch businesses");
  }

  return response.json();
}

export async function getBusiness(id: string): Promise<Business> {
  const response = await fetch(`${API_URL}/businesses/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch business");
  }

  return response.json();
}

export async function createBusiness(data: CreateBusinessData) {
  const response = await fetch(`${API_URL}/businesses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create business");
  }

  return response.json();
}

export async function updateBusiness(id: string, data: Partial<CreateBusinessData>) {
  const response = await fetch(`${API_URL}/businesses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update business");
  }

  return response.json();
}

export async function deleteBusiness(id: string) {
  const response = await fetch(`${API_URL}/businesses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete business");
  }

  return response.json();
}

export async function addBusinessReview(id: string, review: BusinessReview) {
  const response = await fetch(`${API_URL}/businesses/add-review/${id}`, {
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