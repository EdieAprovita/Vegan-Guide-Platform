import { z } from "zod";

export const createMarketSchema = z.object({
  marketName: z
    .string()
    .min(1, "Market name is required")
    .min(2, "Market name must be at least 2 characters")
    .max(100, "Market name must be less than 100 characters"),
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
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  })).min(1, "At least one contact method is required"),
  products: z.array(z.string()).min(1, "At least one product type is required"),
  hours: z.array(z.object({
    day: z.string().min(1, "Day is required"),
    open: z.string().min(1, "Opening time is required"),
    close: z.string().min(1, "Closing time is required"),
  })).min(1, "At least one business hour is required"),
});

export const updateMarketSchema = createMarketSchema.partial();

export const marketReviewSchema = z.object({
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

export type CreateMarketFormData = z.infer<typeof createMarketSchema>;
export type UpdateMarketFormData = z.infer<typeof updateMarketSchema>;
export type MarketReviewFormData = z.infer<typeof marketReviewSchema>; 