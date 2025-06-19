"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users } from "lucide-react";
import { toast } from "sonner";
import { restaurantReviewSchema, RestaurantReviewFormData } from "@/lib/validations/restaurants";

interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewSystemProps {
  reviews: Review[];
  numReviews: number;
  averageRating: number;
  onAddReview: (review: RestaurantReviewFormData) => Promise<void>;
  title?: string;
  showAddButton?: boolean;
}

export function ReviewSystem({ 
  reviews, 
  numReviews, 
  averageRating, 
  onAddReview, 
  title = "Reviews",
  showAddButton = true 
}: ReviewSystemProps) {
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RestaurantReviewFormData>({
    resolver: zodResolver(restaurantReviewSchema),
  });

  const handleAddReview = async (data: RestaurantReviewFormData) => {
    try {
      await onAddReview(data);
      toast.success("Review added successfully!");
      setShowReviewDialog(false);
      reset();
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

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={rating} className="flex items-center gap-2">
        <span className="text-sm w-8">{rating}</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-12">{count}</span>
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title} ({numReviews})</CardTitle>
          {showAddButton && (
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button size="sm">Add Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Review</DialogTitle>
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        {numReviews > 0 ? (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatRating(averageRating)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {renderStars(averageRating)}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {numReviews} reviews
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) =>
                  renderRatingBar(rating, ratingDistribution[rating as keyof typeof ratingDistribution], numReviews)
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review, index) => (
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
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No reviews yet. Be the first to review!
          </p>
        )}
      </CardContent>
    </Card>
  );
} 