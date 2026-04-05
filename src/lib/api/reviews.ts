import { apiRequest, getApiHeaders, BackendResponse } from "./config";

export interface GetAllReviewsParams {
  page?: number;
  limit?: number;
  resourceType?: string;
  minRating?: number;
  sortBy?: "newest" | "oldest" | "rating" | "helpful";
  search?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

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

function buildAdminReviewsQueryString(params: GetAllReviewsParams): string {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.append("page", params.page.toString());
  if (params.limit !== undefined) sp.append("limit", params.limit.toString());
  if (params.resourceType !== undefined) sp.append("resourceType", params.resourceType);
  if (params.minRating !== undefined) sp.append("minRating", params.minRating.toString());
  if (params.sortBy !== undefined) sp.append("sortBy", params.sortBy);
  if (params.search !== undefined) sp.append("search", params.search);
  return sp.toString();
}

/**
 * Client-side: calls the Next.js proxy route at /api/admin/reviews.
 * The route handler enforces admin-only access and holds the backend token
 * server-side — it is never exposed to the browser.
 */
export async function getAllReviews(params: GetAllReviewsParams = {}) {
  const qs = buildAdminReviewsQueryString(params);
  const url = `/api/admin/reviews${qs ? `?${qs}` : ""}`;

  // Same-origin relative URL — browser sends session cookie automatically.
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<{
    success: boolean;
    data: Review[];
    pagination: PaginationMeta;
  }>;
}

/**
 * Server-side only: calls the backend directly via apiRequest.
 * Used exclusively by the /api/admin/reviews route handler so that
 * raw fetch calls (SSRF surface) are centralised inside apiRequest.
 */
export async function fetchAdminReviewsFromBackend(params: GetAllReviewsParams, token: string) {
  const qs = buildAdminReviewsQueryString(params);
  return apiRequest<{ success: boolean; data: Review[]; pagination: PaginationMeta }>(
    `/reviews${qs ? `?${qs}` : ""}`,
    { headers: getApiHeaders(token) }
  );
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
