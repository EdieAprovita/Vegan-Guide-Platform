"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getRestaurant, addRestaurantReview, Restaurant } from "@/lib/api/restaurants";
import { extractBackendData } from "@/lib/api/config";
import { ReviewSystem } from "@/components/features/reviews/review-system";
import { MapPin, Phone, Globe, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { notFound } from "next/navigation";

interface RestaurantDetailClientProps {
  restaurantId: string;
}

export function RestaurantDetailClient({ restaurantId }: RestaurantDetailClientProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const response = await getRestaurant(restaurantId);
        setRestaurant(extractBackendData(response));
      } catch {
        toast.error("Failed to load restaurant details");
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const handleAddReview = async (rating: number, comment: string) => {
    try {
      await addRestaurantReview(restaurantId, { rating, comment });
      toast.success("Review added successfully");
      const response = await getRestaurant(restaurantId);
      setRestaurant(extractBackendData(response));
    } catch {
      toast.error("Failed to add review");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 animate-pulse">Loading...</div>;
  }

  if (!restaurant) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Restaurants
        </button>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={restaurant.image || "/placeholder-restaurant.jpg"}
                alt={`Photo of ${restaurant.name}`}
                width={300}
                height={300}
                className="h-full w-full object-cover md:w-64"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {restaurant.cuisine}
              </div>
              <h1 className="block mt-1 text-2xl leading-tight font-bold text-black">
                {restaurant.name}
              </h1>
              <div className="mt-4">
                <p className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {restaurant.address}, {restaurant.city}, {restaurant.country}
                </p>
                {restaurant.phone && (
                  <p className="flex items-center text-gray-600 mt-2">
                    <Phone className="w-4 h-4 mr-2" />
                    {restaurant.phone}
                  </p>
                )}
                {restaurant.website && (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-gray-200">
            <ReviewSystem
              itemType="Restaurant"
              reviews={restaurant.reviews}
              averageRating={restaurant.rating}
              numReviews={restaurant.numReviews}
              onReviewSubmit={handleAddReview}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 