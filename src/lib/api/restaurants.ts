const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Restaurant {
  _id: string;
  restaurantName: string;
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
    facebook?: string;
    instagram?: string;
  }[];
  cuisine: string[];
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

export interface CreateRestaurantData {
  restaurantName: string;
  address: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  contact: {
    phone?: string;
    facebook?: string;
    instagram?: string;
  }[];
  cuisine: string[];
}

export interface RestaurantReview {
  rating: number;
  comment: string;
}

export async function getRestaurants(params?: {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  rating?: number;
  location?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.cuisine) searchParams.append("cuisine", params.cuisine);
  if (params?.rating) searchParams.append("rating", params.rating.toString());
  if (params?.location) searchParams.append("location", params.location);

  const response = await fetch(
    `${API_URL}/restaurants?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch restaurants");
  }

  return response.json();
}

export async function getRestaurant(id: string) {
  const response = await fetch(`${API_URL}/restaurants/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch restaurant");
  }

  return response.json();
}

export async function getTopRatedRestaurants(limit: number = 10) {
  const response = await fetch(`${API_URL}/restaurants/top-rated?limit=${limit}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch top rated restaurants");
  }

  return response.json();
}

export async function createRestaurant(data: CreateRestaurantData) {
  const response = await fetch(`${API_URL}/restaurants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create restaurant");
  }

  return response.json();
}

export async function updateRestaurant(id: string, data: Partial<CreateRestaurantData>) {
  const response = await fetch(`${API_URL}/restaurants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update restaurant");
  }

  return response.json();
}

export async function deleteRestaurant(id: string) {
  const response = await fetch(`${API_URL}/restaurants/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete restaurant");
  }

  return response.json();
}

export async function addRestaurantReview(id: string, review: RestaurantReview) {
  const response = await fetch(`${API_URL}/restaurants/add-review/${id}`, {
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