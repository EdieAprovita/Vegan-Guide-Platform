const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Market {
  _id: string;
  marketName: string;
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
  products: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
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

export interface CreateMarketData {
  marketName: string;
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
  products: string[];
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface MarketReview {
  rating: number;
  comment: string;
}

export async function getMarkets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  products?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.products) searchParams.append("products", params.products);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  const response = await fetch(
    `${API_URL}/markets?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch markets");
  }

  return response.json();
}

export async function getMarket(id: string) {
  const response = await fetch(`${API_URL}/markets/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch market");
  }

  return response.json();
}

export async function createMarket(data: CreateMarketData) {
  const response = await fetch(`${API_URL}/markets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create market");
  }

  return response.json();
}

export async function updateMarket(id: string, data: Partial<CreateMarketData>) {
  const response = await fetch(`${API_URL}/markets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update market");
  }

  return response.json();
}

export async function deleteMarket(id: string) {
  const response = await fetch(`${API_URL}/markets/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete market");
  }

  return response.json();
}

export async function addMarketReview(
  id: string,
  review: { rating: number; comment: string }
): Promise<Market> {
  const response = await fetch(`${API_URL}/${id}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Include auth token if needed
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    throw new Error("Failed to add review");
  }

  // The backend should return the updated market object with the new review
  // including the populated user
  return response.json();
} 