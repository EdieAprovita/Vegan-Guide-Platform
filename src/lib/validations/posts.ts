import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
});

export const updatePostSchema = createPostSchema.partial();

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .min(2, "Comment must be at least 2 characters")
    .max(1000, "Comment must be less than 1000 characters"),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
export type CreateCommentFormData = z.infer<typeof createCommentSchema>;
