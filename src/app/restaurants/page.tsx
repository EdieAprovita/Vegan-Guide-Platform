import { Metadata } from "next";
import { Suspense } from "react";
import { getRestaurants } from "@/lib/api/restaurants";
import { RestaurantListPaginated } from "@/components/features/restaurants/restaurant-list-paginated";
import { RestaurantFilterValues } from "@/components/features/restaurants/restaurant-filters";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Restaurants | Vegan Guide",
  description: "Discover the best vegan and vegetarian restaurants in your area",
};

const PAGE_SIZE = 12;

interface RestaurantsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    cuisine?: string;
    minRating?: string;
  }>;
}

async function RestaurantResults({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;

  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.search?.trim() ?? "";
  const cuisine = params.cuisine?.trim() ?? "";
  const minRatingRaw = params.minRating?.trim() ?? "";
  const minRating = minRatingRaw ? parseInt(minRatingRaw, 10) : undefined;

  const filters: RestaurantFilterValues = {
    search,
    cuisine,
    minRating: minRatingRaw,
    page: params.page ?? "",
  };

  let restaurants: Awaited<ReturnType<typeof getRestaurants>>["data"] = [];
  let hasNextPage = false;

  try {
    const response = await getRestaurants({
      page: currentPage,
      limit: PAGE_SIZE,
      search: search || undefined,
      cuisine: cuisine || undefined,
      rating: minRating,
    });

    const data = Array.isArray(response.data) ? response.data : [];
    restaurants = data;
    hasNextPage = data.length === PAGE_SIZE;
  } catch {
    // Restaurants will be empty — the error.tsx boundary will handle network failures
    restaurants = [];
    hasNextPage = false;
  }

  return (
    <RestaurantListPaginated
      restaurants={restaurants}
      filters={filters}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
    />
  );
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "/" },
          { name: "Restaurantes", url: "/restaurants" },
        ]}
      />

      {/* Back to Home */}
      <div className="mb-6">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Discover Amazing Vegan Restaurants
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Find the best plant-based dining experiences, from cozy cafes to fine dining.
          All carefully curated for the vegan community.
        </p>
      </div>

      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Restaurants</h2>
        <Button asChild>
          <Link href="/restaurants/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Restaurant
          </Link>
        </Button>
      </div>

      {/* Filters + list — wrapped in Suspense so searchParams streaming works */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted h-[300px] animate-pulse rounded-xl" />
            ))}
          </div>
        }
      >
        <RestaurantResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
