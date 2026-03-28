"use client";

import { memo } from "react";
import { Doctor } from "@/lib/api/doctors";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Globe } from "lucide-react";
import Link from "next/link";
import { isSafeUrl } from "@/lib/utils";

interface DoctorCardProps {
  doctor: Doctor;
  showActions?: boolean;
}

function DoctorCardComponent({ doctor, showActions = true }: DoctorCardProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <article
      aria-label={`Doctor: ${doctor.name}`}
      className="bg-card text-card-foreground flex flex-col gap-6 overflow-hidden rounded-xl border py-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-foreground line-clamp-1 text-lg leading-none font-semibold">
              Dr. {doctor.name}
            </h3>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <MapPin aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{doctor.address}</span>
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <Star aria-hidden="true" className="fill-primary text-primary h-4 w-4" />
            <span
              className="text-sm font-medium"
              aria-label={`Calificación: ${formatRating(doctor.rating)} de 5`}
            >
              {formatRating(doctor.rating)}
            </span>
            <span className="text-muted-foreground text-xs">({doctor.numReviews})</span>
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
            {doctor.languages?.slice(0, 2).map((language, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {language}
              </Badge>
            ))}
            {doctor.languages && doctor.languages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{doctor.languages.length - 2} more
              </Badge>
            )}
          </div>

          {/* Experience */}
          <div className="text-muted-foreground text-sm">
            <p className="line-clamp-2">{doctor.experience}</p>
          </div>

          {/* Contact Information */}
          {doctor.contact && doctor.contact.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {doctor.contact[0].phone && (
                <div className="flex items-center gap-1">
                  <Phone aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                  <span>{doctor.contact[0].phone}</span>
                </div>
              )}
              {doctor.contact[0].email && (
                <div className="flex items-center gap-1">
                  <Mail aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{doctor.contact[0].email}</span>
                </div>
              )}
            </div>
          )}

          {/* Website Link */}
          {doctor.contact &&
            doctor.contact.length > 0 &&
            doctor.contact[0].website &&
            isSafeUrl(doctor.contact[0].website) && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="h-8 px-2">
                  <a
                    href={doctor.contact[0].website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Globe aria-hidden="true" className="h-3 w-3" />
                    Website
                  </a>
                </Button>
              </div>
            )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/doctors/${doctor._id}`}>View Details</Link>
              </Button>
              <Button variant="outline" size="sm" aria-label="Guardar doctor">
                <Star aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </article>
  );
}

export const DoctorCard = memo(DoctorCardComponent);
DoctorCard.displayName = "DoctorCard";
