import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getServerAuthToken } from "@/lib/server-auth";
import { generalApiRateLimit, applyRateLimit } from "@/lib/rate-limit";
import { createRestaurant } from "@/lib/api/restaurants";
import { newRestaurantFormSchema } from "@/lib/validations/restaurants";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await applyRateLimit(request, generalApiRateLimit);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Auth guard
    const authError = await requireAuth();
    if (authError) {
      return authError;
    }

    const token = await getServerAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid authentication token" },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = newRestaurantFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid input data",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { restaurantName, address, cuisine, budget, image } = validation.data;

    // Map form data to backend model shape
    const payload = {
      restaurantName,
      address,
      cuisine,
      // budget is not part of CreateRestaurantData yet; included as extra field
      // accepted by the backend if present
      ...(budget && { budget }),
      contact: [] as { phone?: string; facebook?: string; instagram?: string }[],
      ...(image ? { image } : {}),
    };

    const result = await createRestaurant(payload, token);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create restaurant error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to create restaurant",
      },
      { status: 500 }
    );
  }
}
