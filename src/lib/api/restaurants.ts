import { apiRequest, getApiHeaders, BackendListResponse, BackendResponse } from "./config";
import { Review } from "@/types";

// Development flag to use mock data when backend has issues

export interface Restaurant {
  _id: string;
  restaurantName: string;
  name: string; // Alias for restaurantName for compatibility
  address: string;
  city?: string; // City for display purposes
  country?: string; // Country for display purposes
  phone?: string; // Direct phone access for compatibility
  website?: string; // Website URL
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
  image?: string; // Restaurant image
  rating: number;
  numReviews: number;
  reviews: Review[];
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
  image?: string;
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

  try {
    return await apiRequest<BackendListResponse<Restaurant>>(
      `/restaurants?${searchParams.toString()}`
    );
  } catch (error) {
    console.error("Network error:", error);

    // Return mock data if there's a network error
    console.warn("Network error detected, returning mock data for development");
    return getMockRestaurants();
  }
}

// Mock data function for development
function getMockRestaurants() {
  const mockRestaurants: Restaurant[] = [
    {
      _id: "1",
      restaurantName: "Green Garden Bistro",
      name: "Green Garden Bistro",
      address: "123 Vegan St",
      city: "Plant City",
      country: "USA",
      phone: "+1-555-0123",
      website: "https://greengardenbistro.com",
      location: {
        type: "Point",
        coordinates: [40.7128, -74.006],
      },
      author: {
        _id: "user1",
        username: "veganchef",
        photo: "/default-avatar.jpg",
      },
      contact: [
        {
          phone: "+1-555-0123",
          facebook: "greengardenbistro",
          instagram: "@greengardenbistro",
        },
      ],
      cuisine: ["Vegan", "Mediterranean", "Organic"],
      image: "/placeholder-recipe.jpg",
      rating: 4.8,
      numReviews: 127,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      restaurantName: "Plant Power Kitchen",
      name: "Plant Power Kitchen",
      address: "456 Healthy Ave",
      city: "Wellness Town",
      country: "USA",
      phone: "+1-555-0456",
      website: "https://plantpowerkitchen.com",
      location: {
        type: "Point",
        coordinates: [40.7614, -73.9776],
      },
      author: {
        _id: "user2",
        username: "plantpowerfan",
        photo: "/default-avatar.jpg",
      },
      contact: [
        {
          phone: "+1-555-0456",
          facebook: "plantpowerkitchen",
          instagram: "@plantpowerkitchen",
        },
      ],
      cuisine: ["Vegan", "Raw", "Gluten-free"],
      image: "/placeholder-recipe.jpg",
      rating: 4.6,
      numReviews: 89,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      restaurantName: "Harvest Moon Cafe",
      name: "Harvest Moon Cafe",
      address: "789 Organic Blvd",
      city: "Fresh Fields",
      country: "USA",
      phone: "+1-555-0789",
      website: "https://harvestmooncafe.com",
      location: {
        type: "Point",
        coordinates: [40.7489, -73.9857],
      },
      author: {
        _id: "user3",
        username: "harvestlover",
        photo: "/default-avatar.jpg",
      },
      contact: [
        {
          phone: "+1-555-0789",
          facebook: "harvestmooncafe",
          instagram: "@harvestmooncafe",
        },
      ],
      cuisine: ["Vegetarian", "Vegan", "Farm-to-table"],
      image: "/placeholder-recipe.jpg",
      rating: 4.7,
      numReviews: 156,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return {
    success: true,
    message: "Restaurants fetched successfully (mock data)",
    data: mockRestaurants,
  };
}

export async function getRestaurant(id: string) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/${id}`);
}

export async function getTopRatedRestaurants(limit: number = 10) {
  return apiRequest<BackendListResponse<Restaurant>>(`/restaurants/top-rated?limit=${limit}`);
}

export async function createRestaurant(data: CreateRestaurantData, token?: string) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function updateRestaurant(
  id: string,
  data: Partial<CreateRestaurantData>,
  token?: string
) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteRestaurant(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/restaurants/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function addRestaurantReview(id: string, review: RestaurantReview, token?: string) {
  return apiRequest<BackendResponse<Restaurant>>(`/restaurants/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}
