"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Star, Users, Edit } from "lucide-react";
import { Review } from "@/lib/api/reviews";
import Link from "next/link";
import { useBusiness, useBusinessMutations } from "@/hooks/useBusinesses";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewSystem } from "@/components/features/reviews/review-system";
import { BusinessReview } from "@/lib/api/businesses";
import Image from "next/image";

interface BusinessDetailClientProps {
  businessId: string;
}

export const BusinessDetailClient = ({ businessId }: BusinessDetailClientProps) => {
  const { business, loading, error } = useBusiness(businessId);
  const { addReview, loading: mutationLoading } = useBusinessMutations();
  const { user, isAuthenticated } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = async (reviewData: { rating: number; comment: string }) => {
    if (!business) return;

    try {
      const review: BusinessReview = {
        rating: reviewData.rating,
        comment: reviewData.comment,
      };

      await addReview(business._id, review);
      setShowReviewForm(false);
      // Optionally refresh the business data
      window.location.reload();
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return "Horarios no disponibles";
    return "Lunes a Viernes: 9:00 AM - 6:00 PM"; // Simplified - implement proper formatting
  };

  const canEditBusiness = user?.role === "admin" || business?.author._id === user?._id;

  // Convert BusinessReview to Review format
  const adaptedReviews: Review[] =
    business?.reviews?.map((review, index) => ({
      _id: `business-review-${index}`, // Generate temporary ID
      user: {
        _id: "anonymous",
        username: "Usuario Anónimo",
        photo: undefined,
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resourceType: "business" as const,
      resourceId: business._id,
      helpful: [],
      helpfulCount: 0,
    })) || [];

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
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

  if (error || !business) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Negocio no encontrado</h3>
          <p className="mb-4 text-gray-600">
            {error ||
              "No pudimos encontrar este negocio. Es posible que haya sido eliminado o la URL sea incorrecta."}
          </p>
          <Button asChild variant="outline">
            <Link href="/businesses">Volver a Negocios</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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
              <Link href={`/businesses/${business._id}/edit`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Image */}
          <div className="relative h-64 overflow-hidden rounded-lg md:h-80">
            <Image
              src={business.image || "/placeholder-business.jpg"}
              alt={business.namePlace}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {business.typeBusiness}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {business.rating?.toFixed(1) || "N/A"}
              </span>
              <span className="text-sm text-gray-600">({business.numReviews || 0})</span>
            </div>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{business.namePlace}</CardTitle>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{business.address}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{business.numReviews || 0} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatBusinessHours(business.hours)}</span>
                </div>
              </div>

              {Boolean(business.budget) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Presupuesto estimado:</span>
                  <Badge variant="outline" className="text-sm">
                    ${business.budget.toLocaleString()}
                  </Badge>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="mb-2 text-sm text-gray-600">Creado por:</p>
                <div className="flex items-center gap-2">
                  <Image
                    src={business.author.photo || "/default-avatar.jpg"}
                    alt={business.author.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900">{business.author.username}</span>
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
                  <Button onClick={() => setShowReviewForm(true)} size="sm">
                    Escribir Review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewSystem
                resourceType="business"
                resourceId={business._id}
                reviews={adaptedReviews}
                showForm={showReviewForm}
                onFormCancel={() => setShowReviewForm(false)}
                onReviewSubmit={handleAddReview}
                isSubmitting={mutationLoading}
              />
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
              {business.contact && business.contact.length > 0 && (
                <>
                  {business.contact[0].phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono</p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() =>
                            (window.location.href = `tel:${business.contact[0].phone}`)
                          }
                        >
                          {business.contact[0].phone}
                        </Button>
                      </div>
                    </div>
                  )}

                  {business.contact[0].email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() =>
                            (window.location.href = `mailto:${business.contact[0].email}`)
                          }
                        >
                          {business.contact[0].email}
                        </Button>
                      </div>
                    </div>
                  )}

                  {business.contact[0].website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Sitio Web</p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => window.open(business.contact[0].website, "_blank")}
                        >
                          Visitar sitio web
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Quick Actions */}
              <div className="space-y-2 border-t pt-4">
                {business.contact?.[0]?.phone && (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => (window.location.href = `tel:${business.contact[0].phone}`)}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Llamar Ahora
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const query = encodeURIComponent(`${business.namePlace} ${business.address}`);
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${query}`,
                      "_blank"
                    );
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
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
                <span className="text-gray-700">{formatBusinessHours(business.hours)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview (if location available) */}
          {business.location && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100">
                  <p className="text-sm text-gray-500">Mapa interactivo próximamente</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
