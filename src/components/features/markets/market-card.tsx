"use client";

import { memo } from "react";
import { Market } from "@/lib/api/markets";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import Link from "next/link";
import { isSafeUrl } from "@/lib/utils";

interface MarketCardProps {
  market: Market;
  showActions?: boolean;
}

function MarketCardComponent({ market, showActions = true }: MarketCardProps) {
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getProductBadges = (products: string[]) => {
    if (!products || !Array.isArray(products)) return [];
    return products.slice(0, 3).map((product, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        {product}
      </Badge>
    ));
  };

  const getTodayHours = () => {
    if (!market.hours || !Array.isArray(market.hours)) return null;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const todayHours = market.hours.find((hour) => hour.day.toLowerCase() === today);
    return todayHours;
  };

  const todayHours = getTodayHours();

  return (
    <article
      aria-label={`Mercado: ${market.marketName}`}
      className="bg-card text-card-foreground flex flex-col gap-6 overflow-hidden rounded-xl border py-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-foreground line-clamp-1 text-lg leading-none font-semibold">
              {market.marketName}
            </h3>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
              <MapPin aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{market.address}</span>
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <Star aria-hidden="true" className="fill-primary text-primary h-4 w-4" />
            <span
              className="text-sm font-medium"
              aria-label={`Calificación: ${formatRating(market.rating)} de 5`}
            >
              {formatRating(market.rating)}
            </span>
            <span className="text-muted-foreground text-xs">({market.numReviews})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Product Badges */}
          <div className="flex flex-wrap gap-1">
            {getProductBadges(market.products)}
            {market.products && market.products.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{market.products.length - 3} more
              </Badge>
            )}
          </div>

          {/* Today's Hours */}
          {todayHours && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
              <span>
                Today: {todayHours.open} - {todayHours.close}
              </span>
            </div>
          )}

          {/* Contact Information */}
          {market.contact && market.contact.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {market.contact[0].phone && (
                <div className="flex items-center gap-1">
                  <Phone aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                  <span>{market.contact[0].phone}</span>
                </div>
              )}
              {market.contact[0].email && (
                <div className="flex items-center gap-1">
                  <Mail aria-hidden="true" className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{market.contact[0].email}</span>
                </div>
              )}
            </div>
          )}

          {/* Website Link */}
          {market.contact &&
            market.contact.length > 0 &&
            market.contact[0].website &&
            isSafeUrl(market.contact[0].website) && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="h-8 px-2">
                  <a
                    href={market.contact[0].website}
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
                <Link href={`/markets/${market._id}`}>View Details</Link>
              </Button>
              <Button variant="outline" size="sm" aria-label="Guardar mercado">
                <Star aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </article>
  );
}

export const MarketCard = memo(MarketCardComponent);
MarketCard.displayName = "MarketCard";
