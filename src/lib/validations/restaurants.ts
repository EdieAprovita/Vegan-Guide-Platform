import { z } from "zod";
import { reviewCommonSchema, type ReviewCommonFormData } from "./shared";

export const createRestaurantSchema = z.object({
  restaurantName: z
    .string()
    .min(1, "Restaurant name is required")
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be less than 100 characters"),
  address: z.string().min(1, "Address is required").min(5, "Address must be at least 5 characters"),
  location: z
    .object({
      type: z.string(),
      coordinates: z.array(z.number()).length(2),
    })
    .optional(),
  contact: z
    .array(
      z.object({
        phone: z.string().optional(),
        facebook: z.string().url().optional(),
        instagram: z.string().url().optional(),
      })
    )
    .min(1, "At least one contact method is required"),
  cuisine: z.array(z.string()).min(1, "At least one cuisine type is required"),
});

/**
 * Schema for the /restaurants/new page form.
 * Subset of createRestaurantSchema with budget and image fields added.
 * contact is omitted — not required from the create-restaurant UI flow.
 */
export const newRestaurantFormSchema = z.object({
  restaurantName: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be less than 100 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  cuisine: z.array(z.string().min(1)).min(1, "At least one cuisine type is required"),
  budget: z.enum(["low", "medium", "high"], {
    required_error: "Please select a budget range",
  }),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantReviewSchema = reviewCommonSchema;

export type CreateRestaurantFormData = z.infer<typeof createRestaurantSchema>;
export type NewRestaurantFormData = z.infer<typeof newRestaurantFormSchema>;
export type UpdateRestaurantFormData = z.infer<typeof updateRestaurantSchema>;
export type RestaurantReviewFormData = ReviewCommonFormData;
