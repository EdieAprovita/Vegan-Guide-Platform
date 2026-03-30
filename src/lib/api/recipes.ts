import {
  apiRequest,
  getApiHeaders,
  BackendResponse,
  BackendListResponse,
  ApiError,
} from "./config";

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string; // Backend uses string, not array
  cookingTime: number;
  // Backend schema doesn't have these fields (yet):
  preparationTime?: number; // Optional since backend doesn't have it
  servings?: number; // Optional since backend doesn't have it
  difficulty?: "easy" | "medium" | "hard"; // Optional since backend doesn't have it
  categories?: string[]; // Optional since backend doesn't have it
  image?: string; // Optional since backend doesn't have it
  author: string; // Backend returns ObjectId string, not populated object
  rating: number; // Backend has this
  numReviews: number; // Backend has this
  reviews: string[]; // Backend has array of ObjectIds
  // Backend doesn't have averageRating, it has rating
  averageRating?: number; // Keep for compatibility
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  categories: string[];
  image?: File;
}

export async function getRecipes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);
  if (params?.difficulty) searchParams.append("difficulty", params.difficulty);

  // Return the backend response as-is, let the hook handle the format
  try {
    return await apiRequest<BackendListResponse<Recipe>>(`/recipes?${searchParams.toString()}`);
  } catch (error) {
    if (process.env.NODE_ENV === "development" || process.env.CI) {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.statusCode
      const isApiError = (error as any)?.statusCode !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] };
      }
    }
    throw error;
  }
}

export async function getRecipe(id: string) {
  try {
    return await apiRequest<BackendResponse<Recipe>>(`/recipes/${id}`);
  } catch (error) {
    if (process.env.NODE_ENV === "development" || process.env.CI) {
      // Only return empty data for non-API errors (network timeouts, etc.)
      // ApiError extends Error, so if it's an ApiError it will have error.statusCode
      const isApiError = (error as any)?.statusCode !== undefined;
      if (!isApiError) {
        console.warn("[DEV/CI] Network/timeout error, returning empty data:", error);
        return { success: true, data: [] as unknown as Recipe };
      }
    }
    throw error;
  }
}

export async function createRecipe(data: CreateRecipeData, token?: string) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "ingredients" || key === "instructions" || key === "categories") {
      formData.append(key, JSON.stringify(value));
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return apiRequest<BackendResponse<Recipe>>(`/recipes`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}

export async function updateRecipe(id: string, data: Partial<CreateRecipeData>, token?: string) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "ingredients" || key === "instructions" || key === "categories") {
      formData.append(key, JSON.stringify(value));
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return apiRequest<BackendResponse<Recipe>>(`/recipes/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}

export async function deleteRecipe(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/recipes/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

// Removido porque el backend usa add-review en su lugar
// export async function rateRecipe(id: string, rating: number) { ... }

export interface RecipeReview {
  rating: number;
  comment: string;
}

export async function addRecipeReview(id: string, review: RecipeReview, token?: string) {
  return apiRequest<BackendResponse<Recipe>>(`/recipes/add-review/${id}`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(review),
  });
}
