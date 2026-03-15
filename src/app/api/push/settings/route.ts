import { NextRequest, NextResponse } from "next/server";
import { notificationSettingsSchema } from "@/lib/schemas/push";
import { handlePushProxy } from "../_lib/handlePushProxy";

// TODO(backend): Implement PUT /api/users/push-settings on the Express API.
// Expected request body: NotificationSettings (fields above)
// Expected response: 200 { success: true, message: 'Settings updated' }
// Until that endpoint exists this route returns 202 Accepted so the client
// can proceed without error.

export async function PUT(request: NextRequest) {
  try {
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

    return handlePushProxy(request, {
      backendPath: "/users/push-settings",
      method: "PUT",
      body: validationResult.data,
      label: "push/settings",
      todoNote: "Implement PUT /api/users/push-settings on backend",
      successMessage: "Notification settings updated",
    });
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
