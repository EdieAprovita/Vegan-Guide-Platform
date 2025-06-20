"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader,
  Map as MapIcon,
} from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    restaurants: true,
    markets: true,
    doctors: true,
  });

  const initMap = useCallback(() => {
    if (mapRef.current) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
      });
      setMap(mapInstance);
    }
  }, []);

  const loadGoogleMaps = useCallback(() => {
    if (window.google) {
      initMap();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, [initMap]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // MOCK DATA
      const mockData = [
        { id: "1", type: "restaurants", name: "Vegan Delight", position: { lat: 40.72, lng: -74.01 } },
        { id: "2", type: "markets", name: "Green Market", position: { lat: 40.73, lng: -73.99 } },
        { id: "3", type: "doctors", name: "Dr. Plant", position: { lat: 40.71, lng: -74.00 } },
      ] as MarkerData[];
      setMarkers(mockData);
      toast.success("Locations loaded successfully");
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  useEffect(() => {
    if (map) {
      fetchData();
    }
  }, [map]);

  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach((markerData) => {
        if (filters[markerData.type]) {
          new window.google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.name,
          });
        }
      });
    }
  }, [map, markers, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4 overflow-y-auto bg-white shadow-lg z-10">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full p-2 border rounded"
          />
        </form>
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Filters</h2>
          <div className="flex flex-col gap-2">
            {Object.keys(filters).map((filter) => (
              <label key={filter} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters[filter as keyof typeof filters]}
                  onChange={() =>
                    handleFilterChange(filter as keyof typeof filters)
                  }
                />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          {isLoading && <Loader className="animate-spin mx-auto" />}
          <ul>
            {markers
              .filter((m) => filters[m.type])
              .map((marker) => (
                <li key={marker.id} className="p-2 border-b hover:bg-gray-50">
                  <h3 className="font-semibold">{marker.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{marker.type}</p>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div ref={mapRef} className="w-2/3 h-full">
        {isLoading && (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <MapIcon className="w-16 h-16 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
} 