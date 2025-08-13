'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReviewFormData {
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  initialData?: ReviewFormData;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ReviewForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Por favor selecciona una calificación';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Por favor escribe un comentario';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Selection */}
      <div className="space-y-2">
        <Label>Calificación *</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 rounded transition-colors hover:bg-gray-100"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600">
            {rating === 1 && 'Muy malo'}
            {rating === 2 && 'Malo'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bueno'}
            {rating === 5 && 'Excelente'}
          </p>
        )}
        {errors.rating && (
          <p className="text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Comentario *</Label>
        <Textarea
          id="comment"
          rows={4}
          placeholder="Comparte tu experiencia... ¿Qué te gustó? ¿Qué mejorarías? ¿Lo recomendarías?"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) {
              setErrors(prev => ({ ...prev, comment: '' }));
            }
          }}
          className={`resize-none ${errors.comment ? 'border-red-500' : ''}`}
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>{comment.length}/500 caracteres</span>
          {errors.comment && (
            <span className="text-red-600">{errors.comment}</span>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-24"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </div>
          ) : (
            initialData ? 'Actualizar Review' : 'Publicar Review'
          )}
        </Button>
      </div>
    </form>
  );
};
