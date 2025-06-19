"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Restaurant, getRestaurant, addRestaurantReview } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MapPin, Phone, ExternalLink, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { restaurantReviewSchema, RestaurantReviewFormData } from "@/lib/validations/restaurants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RestaurantDetailPage() {
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RestaurantReviewFormData>({
    resolver: zodResolver(restaurantReviewSchema),
  });

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await getRestaurant(params.id as string);
        setRestaurant(data);
      } catch (error) {
        toast.error("Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadRestaurant();
    }
  }, [params.id]);

  const handleAddReview = async (data: RestaurantReviewFormData) => {
    try {
      await addRestaurantReview(params.id as string, data);
      toast.success("Review added successfully!");
      setShowReviewDialog(false);
      reset();
      // Reload restaurant data to get updated reviews
      const updatedRestaurant = await getRestaurant(params.id as string);
      setRestaurant(updatedRestaurant);
    } catch (error) {
      toast.error("Failed to add review");
    }
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Restaurant not found</h2>
            <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {restaurant.restaurantName}
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(restaurant.rating)}
                <span className="ml-1">{formatRating(restaurant.rating)}</span>
                <span className="text-sm">({restaurant.numReviews} reviews)</span>
              </div>
            </div>
          </div>
          <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
            <DialogTrigger asChild>
              <Button>Add Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Review for {restaurant.restaurantName}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleAddReview)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <select
                    {...register("rating", { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select rating</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                  {errors.rating && (
                    <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    {...register("comment")}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                  {errors.comment && (
                    <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Submit Review
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cuisine Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurant.cuisine.map((cuisine, index) => (
            <Badge key={index} variant="secondary">
              {cuisine}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          {restaurant.contact.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {restaurant.contact[0].phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{restaurant.contact[0].phone}</span>
                  </div>
                )}
                {restaurant.contact[0].facebook && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={restaurant.contact[0].facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Facebook
                    </a>
                  </Button>
                )}
                {restaurant.contact[0].instagram && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={restaurant.contact[0].instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({restaurant.numReviews})</CardTitle>
            </CardHeader>
            <CardContent>
              {restaurant.reviews.length > 0 ? (
                <div className="space-y-4">
                  {restaurant.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <Users className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No reviews yet. Be the first to review this restaurant!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Added by</span>
                <p className="font-medium">{restaurant.author.username}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created</span>
                <p className="font-medium">
                  {new Date(restaurant.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Last updated</span>
                <p className="font-medium">
                  {new Date(restaurant.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {restaurant.location && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded-md flex items-center justify-center">
                  <p className="text-gray-500">Map placeholder</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">{restaurant.address}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 