import { NextRequest, NextResponse } from "next/server";
import { requireRole, getServerAuthToken } from "@/lib/server-auth";

// Allowlist of query params forwarded to the backend — prevents SSRF via
// uncontrolled query string forwarding.
const ALLOWED_PARAMS = ["page", "limit", "resourceType", "minRating", "sortBy", "search"] as const;

export async function GET(request: NextRequest) {
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

  // Re-build query string from an explicit allowlist — never forward raw
  // user-controlled searchParams to avoid SSRF via unvalidated inputs.
  const { searchParams } = new URL(request.url);
  const safeParams = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = searchParams.get(key);
    if (value !== null) safeParams.append(key, value);
  }

  // Backend base URL comes from server-only env var. NEXT_PUBLIC_ is used here
  // only for local dev parity; in production this should be a server-side var.
  const backendBase =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5001/api/v1";
  const qs = safeParams.toString();
  const backendTarget = `${backendBase}/reviews${qs ? `?${qs}` : ""}`;

  const response = await fetch(backendTarget, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data: unknown = await response.json();
  return NextResponse.json(data, { status: response.status });
}
