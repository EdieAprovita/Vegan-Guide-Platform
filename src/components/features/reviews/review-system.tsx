"use client";

import { useState } from "react";
import { Star, ThumbsUp, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Review } from "@/lib/api/reviews";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReviewForm } from "./review-form";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewSystemProps {
  reviews: Review[];
  resourceType?: string;
  resourceId?: string;
  onReviewUpdate?: () => void;
  showStats?: boolean;
  showForm?: boolean;
  onFormCancel?: () => void;
  onReviewSubmit?: (data: { rating: number; comment: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReviewSystem = ({
  reviews,
  resourceType: _resourceType,
  resourceId: _resourceId,
  onReviewUpdate,
  showStats = true,
  showForm = false,
  onFormCancel,
  onReviewSubmit,
  isSubmitting = false,
}: ReviewSystemProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const calculateStats = () => {
    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      distribution,
    };
  };

  const stats = calculateStats();

  const handleHelpfulClick = async (reviewId: string, isCurrentlyHelpful: boolean) => {
    // Implement helpful voting logic
    console.log("Toggle helpful vote for review:", reviewId, !isCurrentlyHelpful);
    // Call API endpoint and refresh reviews
    onReviewUpdate?.();
  };

  const canEditReview = (review: Review) => {
    return user && (user._id === review.user._id || user.role === "admin");
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta review?")) {
      // Implement delete logic
      console.log("Delete review:", reviewId);
      onReviewUpdate?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {showStats && stats && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="mb-2 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(stats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Basado en {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex min-w-16 items-center gap-1">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-400 transition-all"
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.distribution[rating as keyof typeof stats.distribution] /
                                  stats.totalReviews) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="min-w-8 text-sm text-gray-600">
                      {stats.distribution[rating as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {editingReview ? "Editar Review" : "Escribir Review"}
            </h3>
          </CardHeader>
          <CardContent>
            <ReviewForm
              initialData={
                editingReview
                  ? {
                      rating: editingReview.rating,
                      comment: editingReview.comment,
                    }
                  : undefined
              }
              onSubmit={async (data) => {
                if (onReviewSubmit) {
                  await onReviewSubmit(data);
                  setEditingReview(null);
                }
              }}
              onCancel={() => {
                setEditingReview(null);
                onFormCancel?.();
              }}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                No hay reviews aún. ¡Sé el primero en compartir tu experiencia!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.photo} alt={review.user.username} />
                      <AvatarFallback>
                        {review.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{review.user.username}</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review Actions */}
                  {canEditReview(review) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditReview(review)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Review Content */}
                <p className="mb-4 leading-relaxed text-gray-700">{review.comment}</p>

                {/* Helpful Votes */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">¿Te fue útil esta review?</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleHelpfulClick(review._id, review.helpful?.includes(user?._id || ""))
                      }
                      className={`flex items-center gap-1 ${
                        review.helpful?.includes(user?._id || "")
                          ? "bg-green-50 text-green-600"
                          : ""
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpfulCount || 0}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
