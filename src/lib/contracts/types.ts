/**
 * Contract Types — Canonical DTOs shared between frontend and backend.
 *
 * These types represent the EXACT shapes agreed upon with api-guideTypescript.
 * If the backend changes a response shape, update here first, then fix call sites.
 *
 * Backend repo: api-guideTypescript
 * Matching files:
 *   - src/controllers/userControllers.ts  (login/register response)
 *   - src/middleware/authMiddleware.ts     (refresh-token response)
 *   - src/controllers/postControllers.ts  (posts, likes, comments)
 */

// ---------------------------------------------------------------------------
// Standard wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ApiListResponse<T> = ApiResponse<T[]>;

// ---------------------------------------------------------------------------
// Auth contracts
// ---------------------------------------------------------------------------

/**
 * POST /users/login  →  { success: true, message: "Login successful", data: LoginResult }
 * POST /users/register  →  { success: true, message: "User registered successfully", data: LoginResult }
 *
 * BE source: src/services/UserService.ts loginUser() / registerUser()
 */
export interface LoginResult {
  _id: string;
  username: string;
  email: string;
  role: "user" | "professional" | "admin";
  photo?: string;
  /** Short-lived JWT access token (15 min) */
  token: string;
  /** Long-lived refresh token (7 days) — also sent as HttpOnly cookie */
  refreshToken: string;
}

/**
 * POST /auth/refresh-token  →  { success: true, data: RefreshResult }
 *
 * Note: The new refresh token is sent ONLY via HttpOnly cookie `refreshToken`.
 * The response body only contains the new access token.
 * refreshToken in the body is optional (only present if backend decides to rotate it in body too).
 *
 * BE source: src/middleware/authMiddleware.ts refreshToken handler
 */
export interface RefreshResult {
  accessToken: string;
  refreshToken?: string; // HttpOnly cookie; may not be present in body
}

// ---------------------------------------------------------------------------
// Post contracts
// ---------------------------------------------------------------------------

export interface PostAuthor {
  _id: string;
  username: string;
  photo?: string;
}

export interface PostComment {
  _id: string;
  user: PostAuthor;
  /** BE field name: "text" (NOT "content") — see src/controllers/postControllers.ts */
  text: string;
  createdAt: string;
}

export interface PostLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

/**
 * Full Post document as returned by the backend.
 *
 * BE source: src/models/Post.ts
 * Key alignment: comments use field "text" (backend stores as "text");
 *   the Post model has a virtual alias "content" for backwards compat, but
 *   comments must use "text".
 */
export interface PostContract {
  _id: string;
  title: string;
  content: string;
  author: PostAuthor;
  tags: string[];
  likes: string[];
  comments: PostComment[];
  location?: PostLocation;
  visibility: "public" | "local" | "followers";
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload to create a comment.
 * BE source: src/controllers/postControllers.ts addComment handler — reads req.body.text
 */
export interface CreateCommentPayload {
  text: string;
}

// ---------------------------------------------------------------------------
// Search contracts
// ---------------------------------------------------------------------------

/**
 * POST /search/analytics  →  no response data (void)
 *
 * BE source: src/controllers/SearchController.ts
 * Only these two fields are consumed by the backend.
 */
export interface SearchAnalyticsPayload {
  query: string;
  resourceType?: string;
}
