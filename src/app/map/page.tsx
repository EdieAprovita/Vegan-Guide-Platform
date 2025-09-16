"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";

interface MarkerData {
  id: string;
  type: "restaurants" | "markets" | "doctors";
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [markerInstances, setMarkerInstances] = useState<google.maps.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    restaurants: true,
    markets: true,
    doctors: true,
  });

  const { isLoaded, loadError, isLoading } = useGoogleMaps({
    libraries: ["places" as const],
  });

  const initMap = useCallback(() => {
    console.log("initMap called - isLoaded:", isLoaded, "google:", typeof google !== "undefined");
    if (isLoaded && mapRef.current && typeof google !== "undefined" && google.maps) {
      console.log("Creating map instance...");
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
      setMap(mapInstance);
      console.log("Map instance created successfully");
    } else {
      console.log("Cannot create map - conditions not met:", {
        isLoaded,
        hasMapRef: !!mapRef.current,
        hasGoogle: typeof google !== "undefined",
        hasMaps: typeof google !== "undefined" && !!google.maps,
      });
    }
  }, [isLoaded]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  const fetchData = async () => {
    try {
      // MOCK DATA
      const mockData = [
        {
          id: "1",
          type: "restaurants",
          name: "Vegan Delight",
          position: { lat: 40.72, lng: -74.01 },
        },
        { id: "2", type: "markets", name: "Green Market", position: { lat: 40.73, lng: -73.99 } },
        { id: "3", type: "doctors", name: "Dr. Plant", position: { lat: 40.71, lng: -74.0 } },
      ] as MarkerData[];
      setMarkers(mockData);
      toast.success("Locations loaded successfully");
    } catch {
      toast.error("Failed to load locations");
    }
  };

  useEffect(() => {
    if (map) {
      fetchData();
    }
  }, [map]);

  // Clean up markers when component unmounts or map changes
  useEffect(() => {
    return () => {
      markerInstances.forEach((marker) => {
        marker.setMap(null);
      });
    };
  }, [markerInstances]);

  // Manage markers based on filters and data
  useEffect(() => {
    if (map && markers.length > 0 && google && google.maps) {
      // Clear existing markers
      markerInstances.forEach((marker) => {
        marker.setMap(null);
      });

      // Create new markers based on filters
      const newMarkers: google.maps.Marker[] = [];
      markers.forEach((markerData) => {
        if (filters[markerData.type]) {
          const marker = new google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.name,
          });
          newMarkers.push(marker);
        }
      });

      setMarkerInstances(newMarkers);
    }
  }, [map, markers, filters, markerInstances]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  return (
    <div className="flex h-screen">
      <div className="z-10 w-1/3 overflow-y-auto bg-white p-4 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Explore</h1>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full rounded border p-2"
          />
        </form>
        <div className="mb-4">
          <h2 className="mb-2 font-semibold">Filters</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(filters).map((filter) => (
              <label key={filter} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters[filter as keyof typeof filters]}
                  onChange={() => handleFilterChange(filter as keyof typeof filters)}
                />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader className="mr-2 animate-spin" />
              <span>Loading Google Maps...</span>
            </div>
          )}
          {loadError && (
            <div className="rounded bg-red-50 p-4 text-red-600">
              <p>Error loading map: {loadError}</p>
            </div>
          )}
          {!isLoading && !loadError && (
            <ul>
              {markers
                .filter((m) => filters[m.type])
                .map((marker) => (
                  <li key={marker.id} className="border-b p-2 hover:bg-gray-50">
                    <h3 className="font-semibold">{marker.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{marker.type}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      <div ref={mapRef} className="h-full w-2/3">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <div className="text-center">
              <Loader className="mx-auto mb-2 h-8 w-8 animate-spin" />
              <p>Loading map...</p>
            </div>
          </div>
        )}
        {loadError && (
          <div className="flex h-full w-full items-center justify-center bg-red-50">
            <div className="text-center text-red-600">
              <MapIcon className="mx-auto mb-2 h-16 w-16" />
              <p>Failed to load map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
