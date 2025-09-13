'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
  supported: boolean;
}

export interface GeolocationOptions extends PositionOptions {
  watch?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Performance: Cache position for 5 minutes
const POSITION_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
let cachedPosition: { position: GeolocationPosition; timestamp: number } | null = null;

export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    watch = false,
    retryAttempts = 3,
    retryDelay = 1000,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    ...restOptions
  } = options;

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    supported: typeof navigator !== 'undefined' && 'geolocation' in navigator
  });

  const watchIdRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);

  // Debounced error handler to avoid spam
  const debouncedErrorHandler = useDebouncedCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, 500);

  const getCurrentPosition = useCallback(async () => {
    if (!state.supported) {
      const error = 'Geolocation is not supported by this browser';
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    // Performance: Check cache first
    if (cachedPosition && Date.now() - cachedPosition.timestamp < POSITION_CACHE_TIME) {
      setState(prev => ({
        ...prev,
        position: cachedPosition!.position,
        loading: false,
        error: null
      }));
      return cachedPosition.position;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const positionOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
      ...restOptions
    };

    const attemptGeolocation = async (attempt: number): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Performance: Cache successful position
            cachedPosition = { position, timestamp: Date.now() };
            resolve(position);
          },
          (error) => {
            if (attempt < retryAttempts) {
              setTimeout(() => {
                attemptGeolocation(attempt + 1)
                  .then(resolve)
                  .catch(reject);
              }, retryDelay * attempt); // Exponential backoff
            } else {
              reject(error);
            }
          },
          positionOptions
        );
      });
    };

    try {
      const position = await attemptGeolocation(1);
      setState(prev => ({
        ...prev,
        position,
        loading: false,
        error: null
      }));
      retryCountRef.current = 0;
      return position;
    } catch (error) {
      const errorMessage = getGeolocationErrorMessage(error as GeolocationPositionError);
      debouncedErrorHandler(errorMessage);
      throw new Error(errorMessage);
    }
  }, [state.supported, enableHighAccuracy, timeout, maximumAge, retryAttempts, retryDelay, debouncedErrorHandler, restOptions]);

  // Watch position with cleanup
  useEffect(() => {
    if (!watch || !state.supported) return;

    setState(prev => ({ ...prev, loading: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        cachedPosition = { position, timestamp: Date.now() };
        setState(prev => ({
          ...prev,
          position,
          loading: false,
          error: null
        }));
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        debouncedErrorHandler(errorMessage);
      },
      { enableHighAccuracy, timeout, maximumAge, ...restOptions }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [watch, state.supported, enableHighAccuracy, timeout, maximumAge, debouncedErrorHandler, restOptions]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearCache = useCallback(() => {
    cachedPosition = null;
  }, []);

  return {
    ...state,
    getCurrentPosition,
    clearError,
    clearCache,
    retryCount: retryCountRef.current
  };
}

// Enhanced error messages with user-friendly text
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Acceso a la ubicación denegado. Por favor, permite el acceso en la configuración del navegador.';
    case error.POSITION_UNAVAILABLE:
      return 'Información de ubicación no disponible. Verifica tu conexión a internet.';
    case error.TIMEOUT:
      return 'La solicitud de ubicación expiró. Intenta nuevamente.';
    default:
      return 'Error desconocido al obtener la ubicación.';
  }
}

// Simplified hook for basic use cases
export function useUserLocation(options?: Omit<GeolocationOptions, 'watch'>) {
  const { position, getCurrentPosition, loading, error, clearError } = useGeolocation(options);

  const userCoords = position ? {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy
  } : null;

  return {
    userCoords,
    getCurrentPosition,
    loading,
    error,
    clearError,
    hasLocation: !!userCoords
  };
}