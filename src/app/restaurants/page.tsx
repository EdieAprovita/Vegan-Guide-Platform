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
    <div className="container mx-auto py-8 px-4">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Vegan Restaurants
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the best plant-based dining experiences, from cozy cafes to fine dining restaurants.
          All carefully curated for the vegan community.
        </p>
      </div>

      {/* Top Rated Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Top Rated Restaurants
          </h2>
          <Button asChild variant="outline">
            <Link href="/restaurants/top-rated">View All</Link>
          </Button>
        </div>
        <SimpleRestaurantList 
          title="" 
          showFilters={false}
          initialRestaurants={[]}
        />
      </div>

      {/* All Restaurants Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">All Restaurants</h2>
          <Button asChild>
            <Link href="/restaurants/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Link>
          </Button>
        </div>
        <SimpleRestaurantList />
      </div>
    </div>
  );
} 