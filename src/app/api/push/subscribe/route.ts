import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { notificationSettingsSchema } from "@/lib/schemas/push";
import { handlePushProxy } from "../_lib/handlePushProxy";

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

    return handlePushProxy(request, {
      backendPath: "/users/push-subscription",
      method: "PUT",
      body: validationResult.data,
      label: "push/subscribe",
      todoNote: "Implement PUT /api/users/push-subscription on backend",
      successMessage: "Push subscription saved",
    });
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
