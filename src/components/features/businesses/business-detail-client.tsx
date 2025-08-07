"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Star, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useAuthWithRouter } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BusinessReview } from '@/lib/api/businesses';
import { toast } from 'sonner';

interface BusinessDetailClientProps {
  businessId: string;
}

export function BusinessDetailClient({ businessId }: BusinessDetailClientProps) {
  const { currentBusiness, isLoading, error, getBusiness, addBusinessReview } = useBusinesses();
  const { user, isAuthenticated } = useAuthWithRouter();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (businessId) {
      getBusiness(businessId).catch(console.error);
    }
  }, [businessId, getBusiness]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBusiness || reviewData.rating === 0 || !reviewData.comment.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      setSubmittingReview(true);
      const review: BusinessReview = {
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
      };
      
      await addBusinessReview(currentBusiness._id, review);
      setShowReviewForm(false);
      setReviewData({ rating: 0, comment: '' });
      toast.success('Review agregada exitosamente');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Error al agregar la review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return 'Horarios no disponibles';
    return 'Lunes a Viernes: 9:00 AM - 6:00 PM'; // Simplified - implement proper formatting
  };

  const canEditBusiness = user && (user.role === 'admin' || currentBusiness?.author._id === user.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentBusiness) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Negocio no encontrado</h3>
          <p className="text-gray-600 mb-4">
            {error || 'No pudimos encontrar este negocio. Es posible que haya sido eliminado o la URL sea incorrecta.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/businesses">Volver a Negocios</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/businesses" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Negocios
            </Link>
          </Button>
        </div>

        {canEditBusiness && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/businesses/${currentBusiness._id}/edit`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Image */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
            <img
              src={currentBusiness.image || '/placeholder-business.jpg'}
              alt={currentBusiness.namePlace}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {currentBusiness.typeBusiness}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {currentBusiness.rating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-sm text-gray-600">
                ({currentBusiness.numReviews || 0})
              </span>
            </div>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentBusiness.namePlace}</CardTitle>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{currentBusiness.address}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{currentBusiness.numReviews || 0} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatBusinessHours(currentBusiness.hours)}</span>
                </div>
              </div>

              {currentBusiness.budget && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Presupuesto estimado:</span>
                  <Badge variant="outline" className="text-sm">
                    ${currentBusiness.budget.toLocaleString()}
                  </Badge>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Creado por:</p>
                <div className="flex items-center gap-2">
                  <img
                    src={currentBusiness.author.photo || '/default-avatar.jpg'}
                    alt={currentBusiness.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900">{currentBusiness.author.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reviews y Calificaciones</span>
                {isAuthenticated && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    size="sm"
                  >
                    Escribir Review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className="mb-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
                      <textarea
                        rows={4}
                        value={reviewData.comment}
                        onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Comparte tu experiencia..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submittingReview}>
                        {submittingReview ? 'Enviando...' : 'Publicar Review'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewData({ rating: 0, comment: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {currentBusiness.reviews && currentBusiness.reviews.length > 0 ? (
                  currentBusiness.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
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
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">
                    No hay reviews aún. ¡Sé el primero en compartir tu experiencia!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentBusiness.contact && currentBusiness.contact.length > 0 && (
                <>
                  {currentBusiness.contact[0].phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.location.href = `tel:${currentBusiness.contact[0].phone}`}
                        >
                          {currentBusiness.contact[0].phone}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentBusiness.contact[0].email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.location.href = `mailto:${currentBusiness.contact[0].email}`}
                        >
                          {currentBusiness.contact[0].email}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentBusiness.contact[0].website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Sitio Web</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.open(currentBusiness.contact[0].website, '_blank')}
                        >
                          Visitar sitio web
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t space-y-2">
                {currentBusiness.contact?.[0]?.phone && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => window.location.href = `tel:${currentBusiness.contact[0].phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar Ahora
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const query = encodeURIComponent(`${currentBusiness.namePlace} ${currentBusiness.address}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ver en Mapa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{formatBusinessHours(currentBusiness.hours)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview (if location available) */}
          {currentBusiness.location && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Mapa interactivo próximamente</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
