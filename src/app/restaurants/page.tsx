import { Metadata } from "next";
import { SimpleRestaurantList } from "@/components/features/restaurants/simple-restaurant-list";
import { Button } from "@/components/ui/button";
import { Plus, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Restaurants | Vegan Guide",
  description: "Discover the best vegan and vegetarian restaurants in your area",
};

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Discover Amazing Vegan Restaurants
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Find the best plant-based dining experiences, from cozy cafes to fine dining restaurants.
          All carefully curated for the vegan community.
        </p>
      </div>

      {/* Top Rated Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Star className="h-6 w-6 text-yellow-500" />
            Top Rated Restaurants
          </h2>
          <Button asChild variant="outline">
            <Link href="/restaurants/top-rated">View All</Link>
          </Button>
        </div>
        <SimpleRestaurantList title="" showFilters={false} initialRestaurants={[]} />
      </div>

      {/* All Restaurants Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">All Restaurants</h2>
          <Button asChild>
            <Link href="/restaurants/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Link>
          </Button>
        </div>
        <SimpleRestaurantList />
      </div>
    </div>
  );
}
