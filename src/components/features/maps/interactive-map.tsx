"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Globe, Star } from "lucide-react";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  address: string;
  type: "restaurant" | "doctor" | "market" | "business" | "sanctuary";
  rating?: number;
  coordinates: [number, number];
  phone?: string;
  website?: string;
  url: string;
}

interface InteractiveMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showInfoWindow?: boolean;
  onLocationClick?: (location: Location) => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function InteractiveMap({
  locations,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 12,
  height = "500px",
  showInfoWindow = true,
  onLocationClick,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured");
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: center[0], lng: center[1] },
            zoom: zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          setMap(mapInstance);

          if (showInfoWindow) {
            const infoWindowInstance = new google.maps.InfoWindow();
            setInfoWindow(infoWindowInstance);
          }

          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setError("Failed to load Google Maps");
        setLoading(false);
      });
  }, [center, zoom, showInfoWindow]);

  useEffect(() => {
    if (!map || !locations.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.coordinates[0], lng: location.coordinates[1] },
        map: map,
        title: location.name,
        icon: getMarkerIcon(location.type),
      });

      bounds.extend(marker.getPosition()!);
      newMarkers.push(marker);

      if (infoWindow && showInfoWindow) {
        marker.addListener("click", () => {
          const content = createInfoWindowContent(location);
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
          onLocationClick?.(location);
        });
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (locations.length > 1) {
      map.fitBounds(bounds);
    }
  }, [map, locations, infoWindow, showInfoWindow, onLocationClick, markers]);

  const getMarkerIcon = (type: string) => {
    const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";
    switch (type) {
      case "restaurant":
        return `${baseUrl}restaurant.png`;
      case "doctor":
        return `${baseUrl}medical.png`;
      case "market":
        return `${baseUrl}shopping.png`;
      case "business":
        return `${baseUrl}business.png`;
      case "sanctuary":
        return `${baseUrl}park.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  };

  const createInfoWindowContent = (location: Location) => {
    return `
      <div class="p-4 max-w-xs">
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-sm mb-1">${location.name}</h3>
            <p class="text-gray-600 text-xs mb-2">${location.address}</p>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ${location.type}
              </span>
              ${location.rating ? `
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400">★</span>
                  <span class="text-xs text-gray-600">${location.rating.toFixed(1)}</span>
                </div>
              ` : ''}
            </div>
            <div class="flex gap-2">
              <a href="${location.url}" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                View Details
              </a>
              ${location.website ? `
                <a href="${location.website}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                  Website
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleGetDirections = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      location.address
    )}`;
    window.open(url, "_blank");
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            style={{ height }}
            className="w-full rounded-b-lg"
          />
        </CardContent>
      </Card>

      {/* Location List */}
      {locations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {location.name}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">{location.address}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {location.type}
                      </Badge>
                      {location.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">
                            {location.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={location.url}>View Details</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGetDirections(location)}
                    >
                      <Navigation className="h-3 w-3" />
                    </Button>
                  </div>

                  {(location.phone || location.website) && (
                    <div className="flex gap-2 text-xs">
                      {location.phone && (
                        <a
                          href={`tel:${location.phone}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </a>
                      )}
                      {location.website && (
                        <a
                          href={location.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 