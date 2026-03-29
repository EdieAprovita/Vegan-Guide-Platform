"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getNearbyRestaurants, Restaurant } from "@/lib/api/restaurants";

// CDMX fallback coordinates
const DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };
const DEFAULT_RADIUS = 5000; // 5 km

/** Clamps rating to [0, 5] to prevent RangeError in String.repeat(). */
function safeStarCount(rating: number): number {
  if (!isFinite(rating) || isNaN(rating)) return 0;
  return Math.min(5, Math.max(0, Math.round(rating)));
}

interface MarkerData {
  id: string;
  type: "restaurants" | "markets" | "doctors";
  name: string;
  address: string;
  rating: number;
  position: {
    lat: number;
    lng: number;
  };
}

function restaurantToMarkerData(restaurant: Restaurant): MarkerData | null {
  const coords = restaurant.location?.coordinates;
  if (!coords) return null;
  // GeoJSON format: coordinates = [longitude, latitude]
  const lng = coords[0];
  const lat = coords[1];
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    id: restaurant._id,
    type: "restaurants",
    name: restaurant.restaurantName || restaurant.name,
    address: restaurant.address,
    rating: restaurant.rating,
    position: { lat, lng },
  };
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerInstancesRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState({
    restaurants: true,
    markets: true,
    doctors: true,
  });

  const { isLoaded, loadError, isLoading } = useGoogleMaps({
    libraries: ["places" as const],
  });

  // Request geolocation on mount to center the map and fetch nearby restaurants.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or unavailable — use CDMX fallback
        setUserCoords(null);
      }
    );
  }, []);

  const initMap = useCallback(() => {
    if (isLoaded && mapRef.current && typeof google !== "undefined" && google.maps) {
      const center = userCoords ?? DEFAULT_CENTER;
      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
      infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 300 });
      setMap(mapInstance);
    }
  }, [isLoaded, userCoords]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  const fetchRestaurants = useCallback(async (center: { lat: number; lng: number }) => {
    setIsDataLoading(true);
    try {
      const response = await getNearbyRestaurants({
        latitude: center.lat,
        longitude: center.lng,
        radius: DEFAULT_RADIUS,
        limit: 50,
      });

      const fetched: MarkerData[] = (response.data ?? [])
        .map(restaurantToMarkerData)
        .filter((m): m is MarkerData => m !== null);

      setMarkers(fetched);

      if (fetched.length === 0) {
        toast.info("No se encontraron restaurantes en esta área");
      } else {
        toast.success(
          `${fetched.length} restaurante${fetched.length > 1 ? "s" : ""} encontrado${fetched.length > 1 ? "s" : ""}`
        );
      }
    } catch {
      toast.error("Error al cargar los restaurantes");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Fetch data once map is ready
  useEffect(() => {
    if (!map) return;
    const center = userCoords ?? DEFAULT_CENTER;
    fetchRestaurants(center);
  }, [map, userCoords, fetchRestaurants]);

  // Clean up markers and InfoWindow when component unmounts
  useEffect(() => {
    return () => {
      markerInstancesRef.current.forEach((marker) => marker.setMap(null));
      infoWindowRef.current?.close();
    };
  }, []);

  // Build InfoWindow content using DOM APIs (XSS-safe, no innerHTML/template strings)
  function buildInfoWindowContent(marker: MarkerData): HTMLElement {
    const count = safeStarCount(marker.rating);
    const safeRating = typeof marker.rating === "number" ? marker.rating : 0;

    const container = document.createElement("div");
    container.style.cssText = "font-family: sans-serif; padding: 8px; max-width: 260px;";

    const title = document.createElement("h3");
    title.style.cssText = "margin: 0 0 4px; font-size: 15px; font-weight: 700;";
    title.textContent = marker.name;

    const address = document.createElement("p");
    address.style.cssText = "margin: 0 0 6px; color: #555; font-size: 13px;";
    address.textContent = marker.address;

    const ratingRow = document.createElement("div");
    ratingRow.style.cssText = "display: flex; align-items: center; gap: 6px; margin-bottom: 8px;";

    const stars = document.createElement("span");
    stars.style.cssText = "color: #f59e0b; font-size: 14px;";
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `Calificación: ${count} de 5 estrellas`);
    stars.textContent = "\u2605".repeat(count) + "\u2606".repeat(5 - count);

    const ratingNum = document.createElement("span");
    ratingNum.style.cssText = "font-size: 13px; color: #374151;";
    ratingNum.textContent = safeRating.toFixed(1);

    ratingRow.appendChild(stars);
    ratingRow.appendChild(ratingNum);

    const link = document.createElement("a");
    link.href = `/restaurants/${encodeURIComponent(marker.id)}`;
    link.style.cssText =
      "display: inline-block; background: #16a34a; color: #fff; font-size: 13px; padding: 4px 10px; border-radius: 4px; text-decoration: none;";
    link.textContent = "Ver detalle";

    container.appendChild(title);
    container.appendChild(address);
    container.appendChild(ratingRow);
    container.appendChild(link);

    return container;
  }

  // Manage markers based on filters and data
  useEffect(() => {
    if (!map || !google?.maps) return;

    // Clear existing markers
    markerInstancesRef.current.forEach((marker) => marker.setMap(null));
    infoWindowRef.current?.close();

    const newMarkers: google.maps.Marker[] = [];
    markers
      .filter((markerData) => filters[markerData.type])
      .forEach((markerData) => {
        const marker = new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.name,
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(buildInfoWindowContent(markerData));
            infoWindowRef.current.open(map, marker);
          }
        });

        newMarkers.push(marker);
      });

    markerInstancesRef.current = newMarkers;
  }, [map, markers, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!map) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Search by name client-side (already loaded) or re-fetch with search term
    const filtered = markers.filter((m) => m.name.toLowerCase().includes(trimmed.toLowerCase()));

    if (filtered.length > 0) {
      // Pan to first match
      map.setCenter(filtered[0].position);
      map.setZoom(15);
      toast.success(
        `${filtered.length} resultado${filtered.length > 1 ? "s" : ""} encontrado${filtered.length > 1 ? "s" : ""}`
      );
    } else {
      toast.info("No se encontraron resultados");
    }
  };

  const handleFilterChange = (filter: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  return (
    <div className="flex h-screen">
      <div className="z-10 w-1/3 overflow-y-auto bg-white p-4 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Explorar</h1>
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar restaurantes..."
            className="w-full rounded border p-2 text-sm"
          />
          <button
            type="submit"
            className="shrink-0 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          >
            Buscar
          </button>
        </form>
        <div className="mb-4">
          <h2 className="mb-2 font-semibold">Filtros</h2>
          <div className="flex flex-col gap-2">
            {(Object.keys(filters) as Array<keyof typeof filters>).map((filter) => (
              <label key={filter} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters[filter]}
                  onChange={() => handleFilterChange(filter)}
                />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          {(isLoading || isDataLoading) && (
            <div className="flex items-center justify-center p-4">
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">
                {isLoading ? "Cargando Google Maps..." : "Cargando restaurantes..."}
              </span>
            </div>
          )}
          {loadError && (
            <div className="rounded bg-red-50 p-4 text-sm text-red-600">
              <p>Error al cargar el mapa: {loadError}</p>
            </div>
          )}
          {!isLoading && !loadError && !isDataLoading && markers.length === 0 && map && (
            <div className="rounded bg-gray-50 p-4 text-center text-sm text-gray-500">
              <MapIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p>No hay restaurantes en esta área.</p>
            </div>
          )}
          {!isLoading && !loadError && (
            <ul className="divide-y">
              {markers
                .filter((m) => filters[m.type])
                .map((marker) => (
                  <li
                    key={marker.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer p-2 hover:bg-gray-50"
                    onClick={() => {
                      if (map) {
                        map.setCenter(marker.position);
                        map.setZoom(16);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (map) {
                          map.setCenter(marker.position);
                          map.setZoom(16);
                        }
                      }
                    }}
                  >
                    <h3 className="text-sm font-semibold">{marker.name}</h3>
                    <p className="text-xs text-gray-500">{marker.address}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-yellow-500">
                        <span
                          role="img"
                          aria-label={`Calificación: ${safeStarCount(marker.rating)} de 5 estrellas`}
                        >
                          <span aria-hidden="true">{"★".repeat(safeStarCount(marker.rating))}</span>
                        </span>
                        <span className="ml-1 text-gray-500">
                          {(typeof marker.rating === "number" ? marker.rating : 0).toFixed(1)}
                        </span>
                      </span>
                      <Link
                        href={`/restaurants/${marker.id}`}
                        className="text-xs text-green-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver detalle
                      </Link>
                    </div>
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
              <p>Cargando mapa...</p>
            </div>
          </div>
        )}
        {loadError && (
          <div className="flex h-full w-full items-center justify-center bg-red-50">
            <div className="text-center text-red-600">
              <MapIcon className="mx-auto mb-2 h-16 w-16" />
              <p>No se pudo cargar el mapa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
