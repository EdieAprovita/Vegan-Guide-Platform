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
      todoNote:
        "TODO: Remove 202 fallback once PUT /users/push-subscription (PR #123) is confirmed reachable from this proxy",
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
