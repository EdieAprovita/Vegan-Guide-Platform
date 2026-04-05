import { NextRequest, NextResponse } from "next/server";
import { requireRole, getServerAuthToken } from "@/lib/server-auth";
import { fetchAdminReviewsFromBackend, GetAllReviewsParams } from "@/lib/api/reviews";

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

  // Extract only typed params from the request — never forward the raw query
  // string. All outbound HTTP calls are delegated to fetchAdminReviewsFromBackend
  // (uses apiRequest) so no raw fetch calls live in this route handler.
  const { searchParams } = new URL(request.url);
  const params: GetAllReviewsParams = {
    page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
    limit: searchParams.has("limit") ? Number(searchParams.get("limit")) : undefined,
    resourceType: searchParams.get("resourceType") ?? undefined,
    minRating: searchParams.has("minRating") ? Number(searchParams.get("minRating")) : undefined,
    sortBy: (searchParams.get("sortBy") as GetAllReviewsParams["sortBy"]) ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const data = await fetchAdminReviewsFromBackend(params, token);
  return NextResponse.json(data);
}
