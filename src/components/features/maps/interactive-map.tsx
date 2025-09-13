"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useMapMarkers, MarkerData } from "@/hooks/useMapMarkers";
import { useUserLocation } from "@/hooks/useGeolocation";
import { GOOGLE_MAPS_CONFIG, MAP_THEMES, MAP_OPTIONS } from "@/lib/config/maps";
import { useTheme } from "next-themes";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Location {
  id: string;
  name: string;
  address: string;
  type: "restaurant" | "doctor" | "market" | "business" | "sanctuary";
  rating?: number;
  coordinates: [number, number];
  phone?: string;
  website?: string;
  url: string;
  data?: Record<string, unknown>;
}

export interface InteractiveMapProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  showInfoWindow?: boolean;
  showCurrentLocation?: boolean;
  enableClustering?: boolean;
  onLocationClick?: (location: Location) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  controls?: {
    zoomControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    mapTypeControl?: boolean;
  };
}

export function InteractiveMap({
  locations,
  center = GOOGLE_MAPS_CONFIG.defaultCenter,
  zoom = GOOGLE_MAPS_CONFIG.defaultZoom,
  height = "400px",
  className = "",
  showInfoWindow = true,
  showCurrentLocation = true,
  enableClustering = false,
  onLocationClick,
  onMapClick,
  controls = {
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
  },
}: InteractiveMapProps) {
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);

  // Hooks
  const { isLoaded, loadError, isLoading } = useGoogleMaps({
    libraries: [...GOOGLE_MAPS_CONFIG.libraries],
  });

  const { userCoords, getCurrentPosition, loading: locationLoading } = useUserLocation();

  const { updateMarkers, clearMarkers, markerCount } = useMapMarkers(map, {
    enableClustering,
    onMarkerClick: onLocationClick ? (markerData) => {
      const location = locations.find(loc => loc.id === markerData.id);
      if (location) onLocationClick(location);
    } : undefined,
  });

  // Helper function to create info window content
  const createInfoWindowContent = useCallback((location: Location): string => {
    return `
      <div class="p-4 max-w-xs">
        <div class="space-y-2">
          <h3 class="font-semibold text-gray-900 text-sm">${location.name}</h3>
          <p class="text-gray-600 text-xs">${location.address}</p>
          <div class="flex items-center gap-2">
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
          <div class="flex gap-2 pt-2">
            <a href="${location.url}" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
              Ver detalles
            </a>
            ${location.website ? `
              <a href="${location.website}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                Sitio web
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }, []);

  // Memoized marker data conversion for performance
  const markerData = useMemo((): MarkerData[] => {
    return locations.map(location => ({
      id: location.id,
      position: {
        lat: location.coordinates[0],
        lng: location.coordinates[1],
      },
      title: location.name,
      type: location.type,
      content: createInfoWindowContent(location),
      data: {
        ...location.data,
        address: location.address,
        rating: location.rating,
        phone: location.phone,
        website: location.website,
        url: location.url,
      },
    }));
  }, [locations, createInfoWindowContent]);

  // Initialize map with proper configuration
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: theme === 'dark' ? JSON.parse(JSON.stringify(MAP_THEMES.dark)) : JSON.parse(JSON.stringify(MAP_THEMES.light)),
      ...controls,
      restriction: {
        latLngBounds: {
          north: 85,
          south: -85,
          west: -180,
          east: 180,
        },
      },
    });

    // Add click listener if provided
    if (onMapClick) {
      mapInstance.addListener('click', onMapClick);
    }

    setMap(mapInstance);
  }, [isLoaded, center, zoom, theme, controls, onMapClick, map]);

  // Update markers when locations change
  useEffect(() => {
    if (!map || markerData.length === 0) {
      clearMarkers();
      return;
    }

    updateMarkers(markerData);
  }, [map, markerData, updateMarkers, clearMarkers]);

  // Handle user location display
  useEffect(() => {
    if (!map || !showCurrentLocation || !userCoords) return;

    // Remove existing user location marker
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
    }

    // Create new user location marker
    const marker = new google.maps.Marker({
      position: { lat: userCoords.lat, lng: userCoords.lng },
      map,
      title: 'Tu ubicación actual',
      icon: {
        url: '/icons/markers/current-location.png',
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 15),
      },
      zIndex: 1000, // Ensure it's on top
    });

    setUserLocationMarker(marker);
  }, [map, showCurrentLocation, userCoords, userLocationMarker]);

  // Handle get directions
  const handleGetDirections = useCallback((location: Location) => {
    const destination = encodeURIComponent(location.address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Handle get user location
  const handleGetUserLocation = useCallback(async () => {
    try {
      await getCurrentPosition();
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  }, [getCurrentPosition]);

  // Error state
  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Mapa no disponible</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div
        ref={mapRef}
        className={`rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
        style={{ height }}
      />

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
        {showCurrentLocation && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleGetUserLocation}
            disabled={locationLoading}
            className="shadow-md bg-white/90 hover:bg-white border border-gray-200"
            title="Mostrar mi ubicación"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Map Stats */}
      {markerCount > 0 && (
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {markerCount} {markerCount === 1 ? 'ubicación' : 'ubicaciones'}
              {enableClustering && markerCount > 10 && (
                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Agrupado
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 