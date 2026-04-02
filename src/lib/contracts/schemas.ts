/**
 * Zod Runtime Validation Schemas — Contract drift detection.
 *
 * These schemas validate backend responses at runtime.
 * In development/test they throw on mismatch; in production they warn.
 *
 * Usage:
 *   import { validateLoginResponse } from "@/lib/contracts/schemas";
 *   const data = validateLoginResponse(rawResponse);
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const mongoId = z.string().min(1);

// ---------------------------------------------------------------------------
// Standard wrapper
// ---------------------------------------------------------------------------

export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema,
  });
}

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginResultSchema = z.object({
  _id: mongoId,
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "professional", "admin"]),
  photo: z.string().optional(),
  token: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const loginResponseSchema = apiResponseSchema(loginResultSchema);

export const refreshResultSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
});

export const refreshResponseSchema = apiResponseSchema(refreshResultSchema);

// ---------------------------------------------------------------------------
// Post schemas
// ---------------------------------------------------------------------------

const postAuthorSchema = z.object({
  _id: mongoId,
  username: z.string().min(1),
  photo: z.string().optional(),
});

const postCommentSchema = z.object({
  _id: mongoId,
  user: postAuthorSchema,
  text: z.string(),
  createdAt: z.string(),
});

const postLocationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string().optional(),
});

export const postSchema = z.object({
  _id: mongoId,
  title: z.string(),
  content: z.string(),
  author: postAuthorSchema,
  tags: z.array(z.string()),
  likes: z.array(z.string()),
  comments: z.array(postCommentSchema),
  location: postLocationSchema.optional(),
  visibility: z.enum(["public", "local", "followers"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const postResponseSchema = apiResponseSchema(postSchema);
export const postsResponseSchema = apiResponseSchema(z.array(postSchema));

// ---------------------------------------------------------------------------
// Validation helpers — warn in production, throw in development/test
// ---------------------------------------------------------------------------

function validateOrWarn<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const message = `[Contract] Response from "${context}" does not match expected schema:\n${result.error.toString()}`;

  if (process.env.NODE_ENV !== "production") {
    throw new Error(message);
  }

  // In production: warn and return the raw data (best-effort)
  console.warn(message);
  return data as T;
}

export function validateLoginResponse(raw: unknown) {
  return validateOrWarn(loginResponseSchema, raw, "POST /users/login");
}

export function validateRefreshResponse(raw: unknown) {
  return validateOrWarn(refreshResponseSchema, raw, "POST /auth/refresh-token");
}

export function validatePostResponse(raw: unknown) {
  return validateOrWarn(postResponseSchema, raw, "posts endpoint");
}
