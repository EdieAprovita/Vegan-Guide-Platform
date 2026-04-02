/**
 * Test data factories — centralised fixtures for all card component tests.
 *
 * Each factory returns a fully-valid object with sensible defaults.
 * Pass an optional `overrides` object to override individual fields:
 *
 *   const doc = createMockDoctor({ languages: ["Spanish", "French", "German"] });
 *   const review = createMockReview({ rating: 5 });
 */

import { Doctor } from "@/lib/api/doctors";
import { Restaurant } from "@/lib/api/restaurants";
import { Review } from "@/lib/api/reviews";

// ---------------------------------------------------------------------------
// RecipeCard uses its own prop-shape (not the Recipe API type), so we define
// a local interface that mirrors RecipeCardProps exactly.
// ---------------------------------------------------------------------------
export interface RecipeCardProps {
  title: string;
  description: string;
  image: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  averageRating: number;
  author: {
    username: string;
    photo?: string;
  };
  onView: () => void;
}

// ---------------------------------------------------------------------------
// Doctor
// ---------------------------------------------------------------------------
export function createMockDoctor(overrides?: Partial<Doctor>): Doctor {
  return {
    _id: "doc-001",
    name: "Maria Lopez",
    specialty: "Nutritionist",
    address: "456 Health Ave, Ciudad",
    rating: 4.8,
    numReviews: 30,
    experience: "10 years of experience in plant-based nutrition.",
    languages: ["Spanish", "English"],
    education: ["MD - UNAM", "Nutrition Specialist"],
    contact: [],
    author: { _id: "author-1", username: "admin" },
    reviews: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Restaurant
// ---------------------------------------------------------------------------
export function createMockRestaurant(overrides?: Partial<Restaurant>): Restaurant {
  return {
    _id: "rest-001",
    restaurantName: "The Green Plate",
    name: "The Green Plate",
    address: "123 Vegan Street, Ciudad",
    rating: 4.5,
    numReviews: 42,
    cuisine: ["Italian", "Mexican", "Asian"],
    contact: [],
    author: { _id: "author-1", username: "admin" },
    reviews: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Recipe (as RecipeCard props — not the API shape)
// ---------------------------------------------------------------------------
export function createMockRecipeCardProps(overrides?: Partial<RecipeCardProps>): RecipeCardProps {
  return {
    title: "Vegan Tacos",
    description: "Delicious plant-based tacos with all the fixings.",
    image: "/images/tacos.jpg",
    preparationTime: 15,
    cookingTime: 20,
    servings: 4,
    difficulty: "easy",
    averageRating: 4.7,
    author: { username: "chef_jane" },
    onView: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------
const FIXED_DATE = "2024-06-01T10:00:00Z";

export function createMockReview(overrides?: Partial<Review>): Review {
  return {
    _id: "review-abc123",
    user: {
      _id: "user-001",
      username: "johndoe",
      photo: undefined,
    },
    rating: 4,
    comment: "Great vegan food, highly recommend!",
    resourceType: "restaurant",
    resourceId: "rest-001",
    helpful: [],
    helpfulCount: 0,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  };
}
