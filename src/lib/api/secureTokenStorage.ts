/**
 * DEPRECATED: This file is no longer used.
 *
 * Token refresh is now handled entirely by NextAuth in src/lib/auth.ts:
 * - Refresh token is stored in HttpOnly, Secure cookie (server-side, not accessible to JavaScript)
 * - Access token is in NextAuth JWT token (also secure)
 * - No in-memory storage needed
 *
 * See src/lib/auth.ts for the actual implementation.
 * This file is kept for historical reference but should be deleted.
 */
