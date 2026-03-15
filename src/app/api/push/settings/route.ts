import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServerAuthToken } from "@/lib/server-auth";
import { generalApiRateLimit, applyRateLimit } from "@/lib/rate-limit";
import { apiRequest, getApiHeaders } from "@/lib/api/config";
import { z } from "zod";

// Mirrors NotificationSettings in push-notifications.tsx — every field is
// optional so callers can send partial updates (PATCH semantics over PUT).
const notificationSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  newRestaurants: z.boolean().optional(),
  newRecipes: z.boolean().optional(),
  communityUpdates: z.boolean().optional(),
  healthTips: z.boolean().optional(),
  promotions: z.boolean().optional(),
});

// TODO(backend): Implement PUT /api/users/push-settings on the Express API.
// Expected request body: NotificationSettings (fields above)
// Expected response: 200 { success: true, message: 'Settings updated' }
// Until that endpoint exists this route returns 202 Accepted so the client
// can proceed without error.

export async function PUT(request: NextRequest) {
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
    const validationResult = notificationSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid notification settings",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Proxy to backend API — if the endpoint is not yet available this will
    // throw and we fall through to the 202 stub below.
    try {
      await apiRequest("/users/push-settings", {
        method: "PUT",
        headers: getApiHeaders(token),
        body: JSON.stringify(validationResult.data),
      });

      return NextResponse.json(
        { success: true, message: "Notification settings updated" },
        { status: 200 }
      );
    } catch (backendError) {
      // TODO(backend): Remove this fallback once PUT /api/users/push-settings is live.
      // The backend endpoint is not yet implemented; acknowledge the request so
      // the client does not surface an error to the user.
      console.warn(
        "push/settings — backend endpoint not available, returning 202 stub:",
        backendError instanceof Error ? backendError.message : backendError
      );

      return NextResponse.json(
        { message: "Settings received — backend storage pending" },
        {
          status: 202,
          headers: {
            "X-TODO": "Implement PUT /api/users/push-settings on backend",
          },
        }
      );
    }
  } catch (error) {
    console.error("push/settings error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update notification settings",
      },
      { status: 500 }
    );
  }
}
