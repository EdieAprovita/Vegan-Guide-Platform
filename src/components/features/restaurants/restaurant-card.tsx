"use client";

import { Restaurant } from "@/lib/api/restaurants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";

interface RestaurantCardProps {
  restaurant: Restaurant;
  showActions?: boolean;
}

export function RestaurantCard({ restaurant, showActions = true }: RestaurantCardProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getCuisineBadges = (cuisines: string[]) => {
    return cuisines.slice(0, 3).map((cuisine, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        {cuisine}
      </Badge>
    ));
  };

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-foreground line-clamp-1 text-lg font-semibold">
              {restaurant.restaurantName}
            </CardTitle>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <Star className="fill-primary text-primary h-4 w-4" />
            <span className="text-sm font-medium">{formatRating(restaurant.rating)}</span>
            <span className="text-muted-foreground text-xs">({restaurant.numReviews})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Cuisine Badges */}
          <div className="flex flex-wrap gap-1">
            {getCuisineBadges(restaurant.cuisine)}
            {restaurant.cuisine.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{restaurant.cuisine.length - 3} more
              </Badge>
            )}
          </div>

          {/* Contact Information */}
          {restaurant.contact.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {restaurant.contact[0].phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{restaurant.contact[0].phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {restaurant.contact.length > 0 && (
            <div className="flex gap-2">
              {restaurant.contact[0].facebook && (
                <Button asChild variant="outline" size="sm" className="h-8 px-2">
                  <a
                    href={restaurant.contact[0].facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Facebook
                  </a>
                </Button>
              )}
              {restaurant.contact[0].instagram && (
                <Button asChild variant="outline" size="sm" className="h-8 px-2">
                  <a
                    href={restaurant.contact[0].instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Instagram
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/restaurants/${restaurant._id}`}>View Details</Link>
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
