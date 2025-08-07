"use client";

import Link from 'next/link';
import { MapPin, Clock, Phone, Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Business } from '@/lib/api/businesses';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return 'Horarios no disponibles';
    // Simplified display - you might want to implement proper hour formatting
    return 'Ver horarios';
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 bg-white border-gray-200">
      <CardHeader className="relative p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={business.image || '/placeholder-business.jpg'}
            alt={business.namePlace}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {business.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
              {business.typeBusiness}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {business.namePlace}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm line-clamp-1">{business.address}</span>
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

        {business.budget && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Presupuesto:</span>
            <Badge variant="outline" className="text-xs">
              ${business.budget.toLocaleString()}
            </Badge>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild variant="default" className="flex-1">
            <Link href={`/businesses/${business._id}`}>
              Ver Detalles
            </Link>
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
}
