"use client";

import { Doctor } from "@/lib/api/doctors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";

interface DoctorCardProps {
  doctor: Doctor;
  showActions?: boolean;
}

export function DoctorCard({ doctor, showActions = true }: DoctorCardProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
              Dr. {doctor.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{doctor.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{formatRating(doctor.rating)}</span>
            <span className="text-xs text-gray-500">({doctor.numReviews})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Specialty Badges */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="default" className="text-xs">
              {doctor.specialty}
            </Badge>
            {doctor.languages.slice(0, 2).map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
            {doctor.languages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{doctor.languages.length - 2} more
              </Badge>
            )}
          </div>

          {/* Experience */}
          <div className="text-sm text-gray-600">
            <p className="line-clamp-2">{doctor.experience}</p>
          </div>

          {/* Contact Information */}
          {doctor.contact.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {doctor.contact[0].phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{doctor.contact[0].phone}</span>
                </div>
              )}
              {doctor.contact[0].email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{doctor.contact[0].email}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {doctor.contact.length > 0 && doctor.contact[0].website && (
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                <a
                  href={doctor.contact[0].website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs"
                >
                  <Globe className="h-3 w-3" />
                  Website
                </a>
              </Button>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/doctors/${doctor._id}`}>
                  View Details
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 