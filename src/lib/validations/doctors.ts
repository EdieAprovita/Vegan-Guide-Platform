import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z
    .string()
    .min(1, "Doctor name is required")
    .min(2, "Doctor name must be at least 2 characters")
    .max(100, "Doctor name must be less than 100 characters"),
  specialty: z
    .string()
    .min(1, "Specialty is required")
    .min(2, "Specialty must be at least 2 characters"),
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
  education: z.array(z.string()).min(1, "At least one education entry is required"),
  experience: z
    .string()
    .min(1, "Experience is required")
    .min(10, "Experience must be at least 10 characters"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const doctorReviewSchema = z.object({
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

export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorFormData = z.infer<typeof updateDoctorSchema>;
export type DoctorReviewFormData = z.infer<typeof doctorReviewSchema>; 