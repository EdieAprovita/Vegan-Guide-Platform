import { apiRequest, getApiHeaders, BackendResponse } from "./config";

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    photo?: string;
  };
  rating: number;
  comment: string;
  resourceType: "restaurant" | "recipe" | "market" | "doctor" | "business" | "sanctuary";
  resourceId: string;
  helpful: string[]; // Array of user IDs who found it helpful
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export async function getReview(id: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}`);
}

export async function updateReview(id: string, data: Partial<CreateReviewData>, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/reviews/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function markReviewHelpful(id: string, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}/helpful`, {
    method: "POST",
    headers: getApiHeaders(token),
  });
}

export async function removeReviewHelpful(id: string, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}/helpful`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

// Enhanced restaurant reviews with statistics
export async function getRestaurantReviews(
  restaurantId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  return apiRequest<BackendResponse<Review[]>>(
    `/restaurants/${restaurantId}/reviews?${searchParams.toString()}`
  );
}

export async function getRestaurantReviewStats(restaurantId: string) {
  return apiRequest<BackendResponse<ReviewStats>>(`/restaurants/${restaurantId}/reviews/stats`);
}

export async function createRestaurantReview(
  restaurantId: string,
  data: CreateReviewData,
  token?: string
) {
  return apiRequest<BackendResponse<Review>>(`/restaurants/${restaurantId}/reviews`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}
