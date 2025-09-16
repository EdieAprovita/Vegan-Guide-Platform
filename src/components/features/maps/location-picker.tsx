"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { InteractiveMap, Location } from "./interactive-map";
import { useUserLocation } from "@/hooks/useGeolocation";
import { GOOGLE_MAPS_CONFIG } from "@/lib/config/maps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Target, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

export interface SelectedLocation {
  lat: number;
  lng: number;
  address?: string;
  formattedAddress?: string;
  placeId?: string;
}

export interface LocationPickerProps {
  onLocationSelect: (location: SelectedLocation) => void;
  onLocationChange?: (location: SelectedLocation | null) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
  className?: string;
  showSearch?: boolean;
  showCurrentLocationButton?: boolean;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function LocationPicker({
  onLocationSelect,
  onLocationChange,
  initialLocation = GOOGLE_MAPS_CONFIG.defaultCenter,
  height = "300px",
  className = "",
  showSearch = true,
  showCurrentLocationButton = true,
  placeholder = "Buscar ubicación...",
  label = "Seleccionar ubicación",
  disabled = false,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
    lat: initialLocation.lat,
    lng: initialLocation.lng,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { userCoords, getCurrentPosition, loading: locationLoading } = useUserLocation();

  // Ensure Google Maps (including Places) is ready before using Places APIs
  const { isLoaded, isLoading } = useGoogleMaps({
    libraries: [...GOOGLE_MAPS_CONFIG.libraries],
  });

  // Memoized marker for selected location
  const markerLocations = useMemo((): Location[] => {
    if (!selectedLocation) return [];

    return [
      {
        id: "selected-location",
        name: selectedLocation.formattedAddress || "Ubicación seleccionada",
        address:
          selectedLocation.address ||
          `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        type: "business" as const,
        coordinates: [selectedLocation.lat, selectedLocation.lng],
        url: "#",
      },
    ];
  }, [selectedLocation]);

  // Handle map click
  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (disabled) return;

      const clickedLocation = event.latLng;
      if (!clickedLocation) return;

      const lat = clickedLocation.lat();
      const lng = clickedLocation.lng();

      const newLocation: SelectedLocation = { lat, lng };

      // Try to get address using Geocoding API
      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });

        if (response.results[0]) {
          newLocation.address = response.results[0].formatted_address;
          newLocation.formattedAddress = response.results[0].formatted_address;
          newLocation.placeId = response.results[0].place_id;
        }
      } catch (error) {
        console.error("Error getting address:", error);
        newLocation.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
      onLocationChange?.(newLocation);
      setShowResults(false);
    },
    [disabled, onLocationSelect, onLocationChange]
  );

  // Handle using current location
  const handleUseCurrentLocation = useCallback(async () => {
    if (disabled) return;

    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const newLocation: SelectedLocation = { lat, lng };

      // Get address for current location
      try {
        if ((window as any).google?.maps?.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          const response = await geocoder.geocode({ location: { lat, lng } });

          if (response.results[0]) {
            newLocation.address = response.results[0].formatted_address;
            newLocation.formattedAddress = response.results[0].formatted_address;
            newLocation.placeId = response.results[0].place_id;
          }
        } else {
          newLocation.address = "Mi ubicación actual";
        }
      } catch (error) {
        console.error("Error getting current location address:", error);
        newLocation.address = "Mi ubicación actual";
      }

      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
      onLocationChange?.(newLocation);
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  }, [disabled, getCurrentPosition, onLocationSelect, onLocationChange]);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    try {
      // Guard: Only proceed if Google Maps Places is available
      if (typeof window === "undefined" || !(window as any).google?.maps?.places || !isLoaded) {
        setIsSearching(false);
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      // Use Google Places API for search
      const service = new google.maps.places.PlacesService(document.createElement("div"));

      const request: google.maps.places.TextSearchRequest = {
        query: query,
        bounds: new google.maps.LatLngBounds(
          new google.maps.LatLng(selectedLocation.lat - 0.1, selectedLocation.lng - 0.1),
          new google.maps.LatLng(selectedLocation.lat + 0.1, selectedLocation.lng + 0.1)
        ),
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5)); // Limit to 5 results
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error("Error searching places:", error);
      setIsSearching(false);
      setSearchResults([]);
      setShowResults(false);
    }
  }, 500);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Handle selecting a search result
  const handleSelectSearchResult = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (disabled || !place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const newLocation: SelectedLocation = {
        lat,
        lng,
        address: place.formatted_address || place.name,
        formattedAddress: place.formatted_address,
        placeId: place.place_id,
      };

      setSelectedLocation(newLocation);
      setSearchQuery(place.name || place.formatted_address || "");
      setShowResults(false);

      onLocationSelect(newLocation);
      onLocationChange?.(newLocation);
    },
    [disabled, onLocationSelect, onLocationChange]
  );

  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showResults]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label and Instructions */}
      {label && (
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Haz clic en el mapa para seleccionar una ubicación o usa la búsqueda
          </p>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="search-container relative">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={disabled || isLoading || !isLoaded}
              className="pr-4 pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin text-gray-400" />
            )}
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.place_id}-${index}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  disabled={disabled || isLoading || !isLoaded}
                  className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {result.name}
                      </p>
                      {result.formatted_address && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {result.formatted_address}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Location Button */}
      {showCurrentLocationButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={disabled || locationLoading || isLoading || !isLoaded}
          className="w-full sm:w-auto"
        >
          {locationLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Target className="mr-2 h-4 w-4" />
          )}
          Usar mi ubicación actual
        </Button>
      )}

      {/* Map */}
      <InteractiveMap
        locations={markerLocations}
        center={selectedLocation}
        zoom={15}
        height={height}
        onMapClick={handleMapClick}
        showCurrentLocation={showCurrentLocationButton}
        className="border-2 border-dashed border-gray-300 transition-colors hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
        controls={{
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        }}
      />

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Ubicación seleccionada
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {selectedLocation.formattedAddress ||
                  selectedLocation.address ||
                  `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
