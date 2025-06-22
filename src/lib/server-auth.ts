// Server-side authentication utilities
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Get the authenticated user's token for server-side API calls
 * This should only be used on the server side to prevent token exposure
 */
export async function getServerAuthToken(): Promise<string | null> {
  const session = await auth();
  return session?.user?.token || null;
}

/**
 * Get the authenticated user's session for server-side operations
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Verify if user is authenticated on server-side
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Verify if user has required role on server-side
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === requiredRole;
}

/**
 * Get authenticated headers for server-side API calls
 */
export async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
  const token = await getServerAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Middleware helper to check authentication for API routes
 */
export async function requireAuth(_request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return null; // Continue processing
}

/**
 * Middleware helper to check role-based access for API routes
 */
export async function requireRole(_request: NextRequest, requiredRole: string) {
  const session = await auth();
  
  if (!session?.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (session.user.role !== requiredRole) {
    return new Response(
      JSON.stringify({ error: 'Forbidden', message: 'Insufficient permissions' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return null; // Continue processing
}