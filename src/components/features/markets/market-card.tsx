"use client";

import { Market } from "@/lib/api/markets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Globe, Clock } from "lucide-react";
import Link from "next/link";

interface MarketCardProps {
  market: Market;
  showActions?: boolean;
}

export function MarketCard({ market, showActions = true }: MarketCardProps) {
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

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1 text-lg font-semibold text-foreground">
              {market.marketName}
            </CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{market.address}</span>
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium">{formatRating(market.rating)}</span>
            <span className="text-xs text-muted-foreground">({market.numReviews})</span>
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
          {getTodayHours() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Today: {getTodayHours()?.open} - {getTodayHours()?.close}
              </span>
            </div>
          )}

          {/* Contact Information */}
          {market.contact && market.contact.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {market.contact[0].phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{market.contact[0].phone}</span>
                </div>
              )}
              {market.contact[0].email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{market.contact[0].email}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {market.contact && market.contact.length > 0 && market.contact[0].website && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="h-8 px-2">
                <a
                  href={market.contact[0].website}
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
                <Link href={`/markets/${market._id}`}>View Details</Link>
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
