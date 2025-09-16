// Performance: Lazy load configuration
const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
    throw new Error("Google Maps API key is required");
  }
  return apiKey;
};

export const GOOGLE_MAPS_CONFIG = {
  get apiKey() {
    return getApiKey();
  },
  libraries: ["places", "geometry"] as const,
  defaultCenter: {
    lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || "4.6097"),
    lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || "-74.0817"),
  },
  defaultZoom: 12,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
} as const;

export const MAP_THEMES = {
  light: [],
  dark: [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  ],
} as const;

// Performance: Constants for optimization
export const MAP_OPTIONS = {
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 8,
  CLUSTER_MAX_ZOOM: 14,
} as const;

// Marker icons configuration
export const MARKER_ICONS = {
  restaurant: "/icons/markers/restaurant.png",
  business: "/icons/markers/business.png",
  market: "/icons/markers/market.png",
  doctor: "/icons/markers/doctor.png",
  sanctuary: "/icons/markers/sanctuary.png",
  currentLocation: "/icons/markers/current-location.png",
} as const;
