"use client";

import { useState } from "react";
import { Review } from "@/lib/api/reviews";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewForm } from "./review-form";
import { ReviewCard } from "./review-card";
import { ReviewStats } from "./review-stats";
import { useReviews } from "@/hooks/useReviews";

interface EnhancedReviewSystemProps {
  reviews: Review[];
  resourceType: string;
  resourceId: string;
  onReviewUpdate?: () => void;
  showStats?: boolean;
  showForm?: boolean;
  onFormCancel?: () => void;
  onReviewSubmit?: (data: { rating: number; comment: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export const EnhancedReviewSystem = ({
  reviews,
  resourceType,
  resourceId,
  onReviewUpdate,
  showStats = true,
  showForm = false,
  onFormCancel,
  onReviewSubmit,
  isSubmitting = false,
}: EnhancedReviewSystemProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [localShowForm, setLocalShowForm] = useState(showForm);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Use the useReviews hook for additional functionality
  const { stats: hookStats, loading: statsLoading } = useReviews({
    resourceType,
    resourceId,
    autoFetch: false, // Don't auto-fetch since we're passing reviews as props
  });

  const calculateStats = () => {
    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    const totalHelpfulVotes = reviews.reduce((sum, review) => sum + (review.helpfulCount || 0), 0);
    const totalVotes = reviews.length; // Simplified - could be more sophisticated

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
      helpfulVotes: totalHelpfulVotes,
      totalVotes,
    };
  };

  const stats = hookStats || calculateStats();
  const userHasReviewed =
    isAuthenticated && reviews.some((review) => review.user._id === user?._id);

  const handleAddReview = async (reviewData: { rating: number; comment: string }) => {
    if (onReviewSubmit) {
      await onReviewSubmit(reviewData);
    }
    setLocalShowForm(false);
    setEditingReview(null);
    onReviewUpdate?.();
  };

  const handleDeleteReview = () => {
    onReviewUpdate?.();
  };

  const canEditReview = (review: Review) => {
    return user && (user._id === review.user._id || user.role === "admin");
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-8 rounded bg-gray-200"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {showStats && stats && (
        <ReviewStats
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          ratingDistribution={stats.ratingDistribution}
          helpfulVotes={"helpfulVotes" in stats ? stats.helpfulVotes : 0}
          totalVotes={"totalVotes" in stats ? stats.totalVotes : 0}
          showDetails={true}
        />
      )}

      {/* Add Review Button */}
      {isAuthenticated && !userHasReviewed && !localShowForm && (
        <div className="text-center">
          <Button onClick={() => setLocalShowForm(true)}>Escribir Review</Button>
        </div>
      )}

      {/* Review Form */}
      {localShowForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingReview ? "Editar Review" : "Escribir Review"}
            </CardTitle>
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
              onSubmit={handleAddReview}
              onCancel={() => {
                setLocalShowForm(false);
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
            <ReviewCard
              key={review._id}
              review={review}
              resourceType={resourceType}
              resourceId={resourceId}
              onReviewUpdate={onReviewUpdate}
              onReviewDelete={handleDeleteReview}
              showActions={!!canEditReview(review)}
              compact={false}
            />
          ))
        )}
      </div>

      {/* Load More Button (if pagination is implemented) */}
      {reviews.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => onReviewUpdate?.()}>
            Cargar Más Reviews
          </Button>
        </div>
      )}
    </div>
  );
};
