import { NextRequest, NextResponse } from "next/server";
import { notificationSettingsSchema } from "@/lib/schemas/push";
import { handlePushProxy } from "../_lib/handlePushProxy";

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
      todoNote: "TODO: Remove 202 fallback once PUT /users/push-settings (PR #123) is confirmed reachable from this proxy",
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
