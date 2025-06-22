import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";
import { getServerAuthToken } from "@/lib/server-auth";
import { generalApiRateLimit, applyRateLimit } from "@/lib/rate-limit";
import { updateUserProfile } from "@/lib/api/auth";
import { z } from "zod";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, generalApiRateLimit);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Check authentication
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    // Get authenticated token and user session
    const token = await getServerAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No valid authentication token" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation Error", 
          message: "Invalid input data",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    // Get user ID from session (we need to get it from the session)
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    // Update profile via backend API
    const updatedUser = await updateUserProfile(
      validationResult.data,
      token,
      session.user.id
    );

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Profile update error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Failed to update profile" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, generalApiRateLimit);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Check authentication
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    // Get current user profile from session
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    // Return user profile data (without sensitive info)
    const userProfile = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error("Get profile error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Failed to get profile" 
      },
      { status: 500 }
    );
  }
}