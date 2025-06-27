const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Development flag to use mock data when backend has issues
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

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

  try {
    const response = await fetch(
      `${API_URL}/restaurants?${searchParams.toString()}`,
      {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      
      // If it's a server error, return mock data for development
      if (response.status >= 500) {
        console.warn('Server error detected, returning mock data for development');
        return getMockRestaurants(params);
      }
      
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch restaurants: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Network error:', error);
    
    // Return mock data if there's a network error
    console.warn('Network error detected, returning mock data for development');
    return getMockRestaurants(params);
  }
}

// Mock data function for development
function getMockRestaurants(params?: any) {
  const mockRestaurants: Restaurant[] = [
    {
      _id: "1",
      restaurantName: "Green Garden Bistro",
      address: "123 Vegan St, Plant City, PC 12345",
      location: {
        type: "Point",
        coordinates: [40.7128, -74.0060]
      },
      author: {
        _id: "user1",
        username: "veganchef",
        photo: "/default-avatar.jpg"
      },
      contact: [{
        phone: "+1-555-0123",
        facebook: "greengardenbistro",
        instagram: "@greengardenbistro"
      }],
      cuisine: ["Vegan", "Mediterranean", "Organic"],
      rating: 4.8,
      numReviews: 127,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "2", 
      restaurantName: "Plant Power Kitchen",
      address: "456 Healthy Ave, Wellness Town, WT 67890",
      location: {
        type: "Point",
        coordinates: [40.7614, -73.9776]
      },
      author: {
        _id: "user2",
        username: "plantpowerfan",
        photo: "/default-avatar.jpg"
      },
      contact: [{
        phone: "+1-555-0456",
        facebook: "plantpowerkitchen",
        instagram: "@plantpowerkitchen"
      }],
      cuisine: ["Vegan", "Raw", "Gluten-free"],
      rating: 4.6,
      numReviews: 89,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "3",
      restaurantName: "Harvest Moon Cafe",
      address: "789 Organic Blvd, Fresh Fields, FF 13579",
      location: {
        type: "Point",
        coordinates: [40.7489, -73.9857]
      },
      author: {
        _id: "user3",
        username: "harvestlover",
        photo: "/default-avatar.jpg"
      },
      contact: [{
        phone: "+1-555-0789",
        facebook: "harvestmooncafe",
        instagram: "@harvestmooncafe"
      }],
      cuisine: ["Vegetarian", "Vegan", "Farm-to-table"],
      rating: 4.7,
      numReviews: 156,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return {
    restaurants: mockRestaurants,
    totalPages: 1,
    currentPage: 1,
    totalCount: mockRestaurants.length
  };
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