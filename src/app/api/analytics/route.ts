import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getServerAuthToken } from "@/lib/server-auth";
import { getAnalytics } from "@/lib/api/analytics";

const ALLOWED_TIME_RANGES = new Set(["7d", "30d", "90d", "1y"]);

/**
 * Server-side proxy for analytics requests.
 * Attaches the backend JWT from the NextAuth JWT (never exposed to the browser).
 */
export async function GET(req: NextRequest) {
  // auth() triggers the jwt callback, refreshing the backend token if near expiry.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fail fast: no point calling the backend without a valid token.
  const token = await getServerAuthToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate timeRange against an explicit allowlist to prevent query-string injection.
  const rawTimeRange = req.nextUrl.searchParams.get("timeRange");
  const timeRange = ALLOWED_TIME_RANGES.has(rawTimeRange ?? "") ? (rawTimeRange as string) : "30d";

  try {
    // Delegate to the shared analytics lib to keep fetch/response handling consistent.
    const data = await getAnalytics(timeRange, token);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 502 });
  }
}
