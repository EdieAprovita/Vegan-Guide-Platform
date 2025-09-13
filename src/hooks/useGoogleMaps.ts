"use client";

import { useEffect, useState } from "react";
import { Loader, Library } from "@googlemaps/js-api-loader";
import { GOOGLE_MAPS_CONFIG } from "@/lib/config/maps";

interface UseGoogleMapsOptions {
  libraries?: Library[];
  version?: string;
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const apiKey = GOOGLE_MAPS_CONFIG.apiKey;

      if (!apiKey) {
        setLoadError("Google Maps API key is not configured");
        setIsLoading(false);
        return;
      }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script is already being loaded, wait for it
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          setIsLoading(false);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    const loader = new Loader({
      apiKey,
      version: options.version || "weekly",
      libraries: options.libraries || ["places" as Library],
    });

    loader
      .load()
      .then(() => {
        console.log("Google Maps loaded successfully");
        console.log("google.maps available:", !!window.google?.maps);
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setLoadError("Failed to load Google Maps");
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setLoadError("Failed to initialize Google Maps");
      setIsLoading(false);
    }
  }, [options.version, options.libraries]);

  return { isLoaded, loadError, isLoading };
}
