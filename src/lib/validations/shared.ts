import { z } from "zod";

/**
 * Common schema for review payloads shared across restaurants, markets, and doctors.
 * Extend this schema (via .extend() or .merge()) if a domain needs extra fields.
 */
export const reviewCommonSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .min(1, "Comment is required")
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment must be less than 500 characters"),
});

export type ReviewCommonFormData = z.infer<typeof reviewCommonSchema>;
