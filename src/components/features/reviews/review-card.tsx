'use client';

import { useState } from 'react';
import { Star, MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { Review } from '@/lib/api/reviews';
import { useAuthStore } from '@/lib/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpfulVotes } from './helpful-votes';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewCardProps {
  review: Review;
  resourceType: string;
  resourceId: string;
  onReviewUpdate?: () => void;
  onReviewDelete?: (reviewId: string) => void;
  showActions?: boolean;
  compact?: boolean;
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
  const { user, isAuthenticated } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const canEditReview = user && (user._id === review.user._id || user.role === 'admin');
  const canDeleteReview = user && (user._id === review.user._id || user.role === 'admin');
  const canModerateReview = user && user.role === 'admin';

  const handleEditReview = () => {
    // This would typically open an edit modal or navigate to edit page
    console.log('Edit review:', review._id);
    onReviewUpdate?.();
  };

  const handleDeleteReview = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta review? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Call delete API
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la review');
      }

      onReviewDelete?.(review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la review. Intenta nuevamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReportReview = () => {
    // This would typically open a report modal
    console.log('Report review:', review._id);
  };

  const handleHelpfulVoteChange = (reviewId: string, isHelpful: boolean, newCount: number) => {
    // Update the review's helpful count in the parent component
    review.helpfulCount = newCount;
    review.helpful = isHelpful ? [...(review.helpful || []), user?._id || ''] : 
                    (review.helpful || []).filter(id => id !== user?._id);
    onReviewUpdate?.();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4) return 'Muy bueno';
    if (rating >= 3) return 'Bueno';
    if (rating >= 2) return 'Regular';
    return 'Malo';
  };

  if (compact) {
    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.user.photo} alt={review.user.username} />
              <AvatarFallback>
                {review.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {review.user.username}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {review.comment}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                {review.helpfulCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span>👍 {review.helpfulCount}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.photo} alt={review.user.username} />
                <AvatarFallback>
                  {review.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {review.user.username}
                  </h4>
                  {user?.role === 'admin' && (
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className={`ml-1 font-medium ${getRatingColor(review.rating)}`}>
                      {review.rating}
                    </span>
                  </div>
                  
                  <span className="text-gray-400">•</span>
                  
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditReview && (
                    <DropdownMenuItem onClick={handleEditReview}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  
                  {canDeleteReview && (
                    <DropdownMenuItem 
                      onClick={handleDeleteReview}
                      disabled={isDeleting}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </DropdownMenuItem>
                  )}
                  
                  {(canEditReview || canDeleteReview) && canModerateReview && (
                    <DropdownMenuSeparator />
                  )}
                  
                  {canModerateReview && (
                    <DropdownMenuItem onClick={handleReportReview}>
                      <Flag className="h-4 w-4 mr-2" />
                      Moderar
                    </DropdownMenuItem>
                  )}
                  
                  {!canEditReview && !canDeleteReview && isAuthenticated && (
                    <DropdownMenuItem onClick={handleReportReview}>
                      <Flag className="h-4 w-4 mr-2" />
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
            <span className="text-sm text-gray-600">
              Calificación: {review.rating}/5
            </span>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
            
            {/* Resource Context */}
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <span>Review para: </span>
              <span className="font-medium text-gray-700">
                {resourceType === 'restaurant' && 'Restaurante'}
                {resourceType === 'recipe' && 'Receta'}
                {resourceType === 'market' && 'Mercado'}
                {resourceType === 'doctor' && 'Doctor'}
                {resourceType === 'business' && 'Negocio'}
                {resourceType === 'sanctuary' && 'Santuario'}
                {resourceType === 'post' && 'Post'}
              </span>
            </div>
          </div>

          {/* Helpful Votes */}
          <div className="pt-3 border-t">
            <HelpfulVotes
              reviewId={review._id}
              helpfulCount={review.helpfulCount || 0}
              helpfulUsers={review.helpful || []}
              onVoteChange={handleHelpfulVoteChange}
              disabled={isDeleting}
            />
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>ID: {review._id.slice(-8)}</span>
            {review.updatedAt !== review.createdAt && (
              <span>Editado {formatDistanceToNow(new Date(review.updatedAt), { addSuffix: true, locale: es })}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
