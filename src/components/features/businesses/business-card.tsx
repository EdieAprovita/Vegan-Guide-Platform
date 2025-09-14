"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Business } from "@/lib/api/businesses";

interface BusinessCardProps {
  business: Business;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return "Horarios no disponibles";
    // Simplified display - you might want to implement proper hour formatting
    return "Ver horarios";
  };

  return (
    <Card className="group border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="relative p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={business.image || "/placeholder-business.jpg"}
            alt={business.namePlace}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {business.rating?.toFixed(1) || "N/A"}
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
              {business.typeBusiness}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <div>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">
            {business.namePlace}
          </h3>
          <div className="mb-2 flex items-center gap-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1 text-sm">{business.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
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
            <span className="text-sm text-gray-600">Presupuesto:</span>
            <Badge variant="outline" className="text-xs">
              ${business.budget.toLocaleString()}
            </Badge>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/businesses/${business._id}`}>Ver Detalles</Link>
          </Button>

          {business.contact?.[0]?.phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCall(business.contact[0].phone!)}
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
