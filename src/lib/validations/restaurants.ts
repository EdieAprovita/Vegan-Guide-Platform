import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurantName: z
    .string()
    .min(1, "Restaurant name is required")
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be less than 100 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters"),
  location: z.object({
    type: z.string(),
    coordinates: z.array(z.number()).length(2),
  }).optional(),
  contact: z.array(z.object({
    phone: z.string().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
  })).min(1, "At least one contact method is required"),
  cuisine: z.array(z.string()).min(1, "At least one cuisine type is required"),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantReviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment must be less than 500 characters"),
});

export type CreateRestaurantFormData = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantFormData = z.infer<typeof updateRestaurantSchema>;
export type RestaurantReviewFormData = z.infer<typeof restaurantReviewSchema>; 