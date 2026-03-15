import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServerAuthToken } from "@/lib/server-auth";
import { generalApiRateLimit, applyRateLimit } from "@/lib/rate-limit";
import { apiRequest, getApiHeaders } from "@/lib/api/config";
import { z } from "zod";
import { notificationSettingsSchema } from "@/lib/schemas/push";

// Matches PushSubscriptionJSON — shape produced by subscription.toJSON() in the browser
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url("endpoint must be a valid URL"),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh key is required"),
    auth: z.string().min(1, "auth key is required"),
  }),
  expirationTime: z.number().nullable().optional(),
});

const subscribeBodySchema = z.object({
  subscription: pushSubscriptionSchema,
  settings: notificationSettingsSchema.optional(),
});

// TODO(backend): Implement PUT /api/users/push-subscription on the Express API.
// Expected request body: { subscription: PushSubscriptionJSON, settings: NotificationSettings }
// Expected response: 200 { success: true, message: 'Subscription saved' }
// Until that endpoint exists this route returns 202 Accepted so the client
// can proceed without error.

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, generalApiRateLimit);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Check authentication
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }

    // Get authenticated token — never exposed to the browser
    const token = await getServerAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid authentication token" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = subscribeBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid subscription data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { subscription, settings } = validationResult.data;

    // Proxy to backend API — if the endpoint is not yet available this will
    // throw and we fall through to the 202 stub below.
    try {
      await apiRequest("/users/push-subscription", {
        method: "PUT",
        headers: getApiHeaders(token),
        body: JSON.stringify({ subscription, settings }),
      });

      return NextResponse.json(
        { success: true, message: "Push subscription saved" },
        { status: 200 }
      );
    } catch (backendError: unknown) {
      const status = (backendError as { status?: number })?.status;

      if (status === 404 || status === 501 || status === undefined) {
        // TODO(backend): Remove this fallback once PUT /api/users/push-subscription is live.
        // The backend endpoint is not yet implemented; acknowledge the request so
        // the client does not surface an error to the user.
        console.warn(
          "push/subscribe — backend endpoint not available, returning 202 stub:",
          backendError instanceof Error ? backendError.message : backendError
        );

        const headers: Record<string, string> =
          process.env.NODE_ENV !== "production"
            ? { "X-TODO": "Implement PUT /api/users/push-subscription on backend" }
            : {};

        return NextResponse.json(
          { message: "Subscription received — backend storage pending" },
          { status: 202, headers }
        );
      }

      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("push/subscribe error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to save push subscription",
      },
      { status: 500 }
    );
  }
}
