import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServerAuthToken } from "@/lib/server-auth";
import { generalApiRateLimit, applyRateLimit } from "@/lib/rate-limit";
import { apiRequest, getApiHeaders, ApiError } from "@/lib/api/config";

export interface PushProxyOptions {
  /** Backend path relative to API base, e.g. "/users/push-subscription" */
  backendPath: string;
  /** HTTP method to forward to the backend */
  method: "PUT" | "POST" | "PATCH";
  /** Already-validated request body to forward */
  body: unknown;
  /** Human-readable label used in log messages and error responses */
  label: string;
  /** X-TODO header value shown in non-production 202 responses */
  todoNote: string;
  /** Success message returned on 200 */
  successMessage: string;
}

/**
 * Shared proxy handler for push-notification API routes.
 *
 * Centralises:
 *  - Rate limiting
 *  - Auth check + token retrieval
 *  - Backend proxy via apiRequest
 *  - 202 fallback when the backend endpoint is not yet implemented (404 / 501)
 *  - Error handling
 *
 * Each route is responsible only for parsing and validating its own body
 * before calling this function.
 */
export async function handlePushProxy(
  request: NextRequest,
  opts: PushProxyOptions
): Promise<NextResponse | Response> {
  const { backendPath, method, body, label, todoNote, successMessage } = opts;

  // Rate limiting
  const rateLimitResult = await applyRateLimit(request, generalApiRateLimit);
  if (rateLimitResult) return rateLimitResult;

  // Authentication
  const authError = await requireAuth();
  if (authError) return authError;

  const token = await getServerAuthToken();
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized", message: "No valid authentication token" },
      { status: 401 }
    );
  }

  // Proxy to backend
  try {
    await apiRequest(backendPath, {
      method,
      headers: getApiHeaders(token),
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, message: successMessage }, { status: 200 });
  } catch (backendError: unknown) {
    // ApiError carries the real HTTP status; a plain Error has no status field.
    const status = backendError instanceof ApiError ? backendError.status : undefined;

    if (status === 404 || status === 501 || status === undefined) {
      // TODO(backend): Remove this fallback once the backend endpoint is live.
      console.warn(
        `${label} — backend endpoint not available, returning 202 stub:`,
        backendError instanceof Error ? backendError.message : backendError
      );

      const headers: Record<string, string> =
        process.env.NODE_ENV !== "production" ? { "X-TODO": todoNote } : {};

      return NextResponse.json(
        { message: `${label} received — backend storage pending` },
        { status: 202, headers }
      );
    }

    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 502 });
  }
}
