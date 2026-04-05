import { NextRequest, NextResponse } from "next/server";
import { requireRole, getServerAuthToken } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  // Enforce admin-only access using the shared server-auth helpers
  const authError = await requireRole("admin");
  if (authError) {
    return authError;
  }

  // Retrieve the backend JWT from the server-side session cookie —
  // never exposed to the browser.
  const token = await getServerAuthToken();
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized", message: "No valid authentication token" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1";

  const response = await fetch(`${backendUrl}/reviews?${searchParams.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data: unknown = await response.json();
  return NextResponse.json(data, { status: response.status });
}
