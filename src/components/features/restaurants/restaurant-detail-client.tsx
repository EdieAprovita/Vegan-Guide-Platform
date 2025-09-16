"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getRestaurant, addRestaurantReview, Restaurant } from "@/lib/api/restaurants";
import { Review } from "@/lib/api/reviews";
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

  const handleAddReview = async (data: { rating: number; comment: string }) => {
    try {
      await addRestaurantReview(restaurantId, { rating: data.rating, comment: data.comment });
      toast.success("Review added successfully");
      const response = await getRestaurant(restaurantId);
      setRestaurant(extractBackendData(response));
    } catch {
      toast.error("Failed to add review");
    }
  };

  if (loading) {
    return <div className="container mx-auto animate-pulse px-4 py-8">Loading...</div>;
  }

  if (!restaurant) {
    return notFound();
  }

  // Convert restaurant reviews to Review format
  const adaptedReviews: Review[] =
    restaurant.reviews?.map((review, index: number) => ({
      _id: `${restaurant._id}-${index}`,
      user: {
        _id: "anonymous",
        username: "Usuario Anónimo",
        photo: undefined,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt || new Date().toISOString(),
      updatedAt: review.createdAt || new Date().toISOString(),
      resourceType: "restaurant" as const,
      resourceId: restaurant._id,
      helpful: [],
      helpfulCount: 0,
    })) || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Restaurants
        </button>
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
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
              <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
                {restaurant.cuisine}
              </div>
              <h1 className="mt-1 block text-2xl leading-tight font-bold text-black">
                {restaurant.name}
              </h1>
              <div className="mt-4">
                <p className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {restaurant.address}, {restaurant.city}, {restaurant.country}
                </p>
                {restaurant.phone && (
                  <p className="mt-2 flex items-center text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {restaurant.phone}
                  </p>
                )}
                {restaurant.website && (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-8">
            <ReviewSystem reviews={adaptedReviews} onReviewSubmit={handleAddReview} />
          </div>
        </div>
      </div>
    </main>
  );
}
