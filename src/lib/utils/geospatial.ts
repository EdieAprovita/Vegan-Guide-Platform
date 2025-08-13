import { Coordinates, Location } from '@/types/search';

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert Location type to Coordinates
 */
export function locationToCoordinates(location: Location): Coordinates {
  return {
    longitude: location.coordinates[0],
    latitude: location.coordinates[1],
  };
}

/**
 * Convert Coordinates to Location (GeoJSON format)
 */
export function coordinatesToLocation(coordinates: Coordinates): Location {
  return {
    type: 'Point',
    coordinates: [coordinates.longitude, coordinates.latitude],
  };
}

/**
 * Check if coordinates are within a certain radius
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
}

/**
 * Get user's current location using browser's Geolocation API
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Error getting location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Acceso a la ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'La solicitud de ubicación expiró';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );
  });
}

/**
 * Watch user's location for changes
 */
export function watchLocation(
  onLocationChange: (coordinates: Coordinates) => void,
  onError: (error: Error) => void
): number {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by this browser'));
    return 0;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      let errorMessage = 'Error watching location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Acceso a la ubicación denegado';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Información de ubicación no disponible';
          break;
        case error.TIMEOUT:
          errorMessage = 'La solicitud de ubicación expiró';
          break;
      }
      
      onError(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * Get bounding box around a center point with given radius
 */
export function getBoundingBox(center: Coordinates, radiusKm: number): {
  northeast: Coordinates;
  southwest: Coordinates;
} {
  // Approximate degrees per kilometer
  const kmPerDegreeLat = 111;
  const kmPerDegreeLon = 111 * Math.cos(toRadians(center.latitude));

  const latOffset = radiusKm / kmPerDegreeLat;
  const lonOffset = radiusKm / kmPerDegreeLon;

  return {
    northeast: {
      latitude: center.latitude + latOffset,
      longitude: center.longitude + lonOffset,
    },
    southwest: {
      latitude: center.latitude - latOffset,
      longitude: center.longitude - lonOffset,
    },
  };
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get permission state for geolocation
 */
export async function getGeolocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'granted'; // Assume granted if permissions API not available
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.warn('Error checking geolocation permission:', error);
    return 'granted'; // Fallback
  }
}