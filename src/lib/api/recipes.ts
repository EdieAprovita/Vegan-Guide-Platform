const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  categories: string[];
  image?: string;
  author: {
    _id: string;
    username: string;
    photo?: string;
  };
  ratings: {
    rating: number;
    user: string;
  }[];
  averageRating: number;
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

  const response = await fetch(
    `${API_URL}/recipes?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch recipes");
  }

  return response.json();
}

export async function getRecipe(id: string) {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch recipe");
  }

  return response.json();
}

export async function createRecipe(data: CreateRecipeData) {
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

  const response = await fetch(`${API_URL}/recipes`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create recipe");
  }

  return response.json();
}

export async function updateRecipe(id: string, data: Partial<CreateRecipeData>) {
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

  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update recipe");
  }

  return response.json();
}

export async function deleteRecipe(id: string) {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete recipe");
  }

  return response.json();
}

export async function rateRecipe(id: string, rating: number) {
  const response = await fetch(`${API_URL}/recipes/${id}/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to rate recipe");
  }

  return response.json();
}

export interface RecipeReview {
  rating: number;
  comment: string;
}

export async function addRecipeReview(id: string, review: RecipeReview) {
  const response = await fetch(`${API_URL}/recipes/add-review/${id}`, {
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