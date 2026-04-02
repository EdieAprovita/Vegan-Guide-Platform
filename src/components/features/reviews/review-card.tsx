"use client";

import { useState } from "react";
import { Star, MoreVertical, Edit, Trash2, Flag } from "lucide-react";
import { Review } from "@/lib/api/reviews";
import { useSession } from "next-auth/react";
import { CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpfulVotes } from "./helpful-votes";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewCardProps {
  review: Review;
  resourceType: string;
  resourceId: string;
  onReviewUpdate?: () => void;
  onReviewDelete?: (reviewId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

/** Renders 5 star icons with aria-hidden and a visually-hidden text alternative. */
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <span className="flex items-center gap-0.5">
      <span className="sr-only">Calificación: {rating} de 5</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`${sizeClass} ${
            star <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"
          }`}
        />
      ))}
    </span>
  );
}

export const ReviewCard = ({
  review,
  resourceType,
  // resourceId, // TODO: Use when implementing resource-specific features
  onReviewUpdate,
  onReviewDelete,
  showActions = true,
  compact = false,
}: ReviewCardProps) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const [isDeleting, setIsDeleting] = useState(false);

  const canEditReview = user && (user.id === review.user._id || user.role === "admin");
  const canDeleteReview = user && (user.id === review.user._id || user.role === "admin");
  const canModerateReview = user && user.role === "admin";

  const handleEditReview = () => {
    // This would typically open an edit modal or navigate to edit page
    onReviewUpdate?.();
  };

  const handleDeleteReview = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta review? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Call delete API
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la review");
      }

      onReviewDelete?.(review._id);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Error al eliminar la review. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportReview = () => {
    // This would typically open a report modal
  };

  const handleHelpfulVoteChange = (reviewId: string, isHelpful: boolean, newCount: number) => {
    // Update the review's helpful count in the parent component
    review.helpfulCount = newCount;
    review.helpful = isHelpful
      ? [...(review.helpful || []), user?.id || ""]
      : (review.helpful || []).filter((id) => id !== user?.id);
    onReviewUpdate?.();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-emerald-600";
    if (rating >= 3) return "text-yellow-600";
    if (rating >= 2) return "text-orange-600";
    return "text-destructive";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excelente";
    if (rating >= 4) return "Muy bueno";
    if (rating >= 3) return "Bueno";
    if (rating >= 2) return "Regular";
    return "Malo";
  };

  if (compact) {
    return (
      <article
        aria-label={`Reseña de ${review.user.username}`}
        className="bg-card text-card-foreground rounded-xl border shadow-sm transition-shadow hover:shadow-sm"
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.user.photo} alt={review.user.username} />
              <AvatarFallback>{review.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-foreground truncate text-sm font-medium">
                  {review.user.username}
                </span>
                <StarRating rating={review.rating} size="sm" />
              </div>

              <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">{review.comment}</p>

              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                {review.helpfulCount > 0 && (
                  <span
                    className="flex items-center gap-1"
                    aria-label={`${review.helpfulCount} personas encontraron esto útil`}
                  >
                    <span aria-hidden="true">👍</span> {review.helpfulCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </article>
    );
  }

  return (
    <article
      aria-label={`Reseña de ${review.user.username}`}
      className="bg-card text-card-foreground rounded-xl border shadow-sm transition-shadow hover:shadow-md"
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.photo} alt={review.user.username} />
                <AvatarFallback>{review.user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-foreground truncate font-semibold">{review.user.username}</h3>
                  {user?.role === "admin" && (
                    <Badge variant="outline" className="text-xs">
                      {user?.role}
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <StarRating rating={review.rating} size="md" />
                    <span className={`ml-1 font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating}
                    </span>
                  </div>

                  <span aria-hidden="true" className="text-muted-foreground/40">
                    •
                  </span>

                  <span>
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label={`Opciones para la reseña de ${review.user.username}`}
                  >
                    <MoreVertical aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditReview && (
                    <DropdownMenuItem onClick={handleEditReview}>
                      <Edit aria-hidden="true" className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}

                  {canDeleteReview && (
                    <DropdownMenuItem
                      onClick={handleDeleteReview}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </DropdownMenuItem>
                  )}

                  {(canEditReview || canDeleteReview) && canModerateReview && (
                    <DropdownMenuSeparator />
                  )}

                  {canModerateReview && (
                    <DropdownMenuItem onClick={handleReportReview}>
                      <Flag aria-hidden="true" className="mr-2 h-4 w-4" />
                      Moderar
                    </DropdownMenuItem>
                  )}

                  {!canEditReview && !canDeleteReview && isAuthenticated && (
                    <DropdownMenuItem onClick={handleReportReview}>
                      <Flag aria-hidden="true" className="mr-2 h-4 w-4" />
                      Reportar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${getRatingColor(review.rating)} bg-opacity-10`}>
              {getRatingLabel(review.rating)}
            </Badge>
            <span className="text-muted-foreground text-sm">Calificación: {review.rating}/5</span>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{review.comment}</p>

            {/* Resource Context */}
            <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm">
              <span>Review para: </span>
              <span className="text-foreground font-medium">
                {resourceType === "restaurant" && "Restaurante"}
                {resourceType === "recipe" && "Receta"}
                {resourceType === "market" && "Mercado"}
                {resourceType === "doctor" && "Doctor"}
                {resourceType === "business" && "Negocio"}
                {resourceType === "sanctuary" && "Santuario"}
                {resourceType === "post" && "Post"}
              </span>
            </div>
          </div>

          {/* Helpful Votes */}
          <div className="border-t pt-3">
            <HelpfulVotes
              reviewId={review._id}
              helpfulCount={review.helpfulCount || 0}
              helpfulUsers={review.helpful || []}
              onVoteChange={handleHelpfulVoteChange}
              disabled={isDeleting}
            />
          </div>

          {/* Footer Info */}
          <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
            <span>ID: {review._id.slice(-8)}</span>
            {review.updatedAt !== review.createdAt && (
              <span>
                Editado{" "}
                {formatDistanceToNow(new Date(review.updatedAt), { addSuffix: true, locale: es })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </article>
  );
};
