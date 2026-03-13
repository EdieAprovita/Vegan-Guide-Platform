import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServerAuthToken } from "@/lib/server-auth";
import { API_CONFIG } from "@/lib/api/config";

/**
 * Server-side proxy for analytics requests.
 * Attaches the backend JWT from the NextAuth JWT (never exposed to the browser).
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timeRange = req.nextUrl.searchParams.get("timeRange") ?? "30d";
  const token = await getServerAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/analytics?timeRange=${timeRange}`,
      { headers, credentials: "include" },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Analytics API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 502 },
    );
  }
}
