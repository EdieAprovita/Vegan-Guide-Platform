'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MARKER_ICONS, MAP_OPTIONS } from '@/lib/config/maps';

export interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  content?: string;
  type?: 'restaurant' | 'business' | 'market' | 'doctor' | 'sanctuary' | 'currentLocation';
  data?: Record<string, unknown>;
}

export interface UseMapMarkersOptions {
  enableClustering?: boolean;
  maxZoom?: number;
  clusterRadius?: number;
  onMarkerClick?: (marker: MarkerData) => void;
}

export interface MarkerCluster {
  markers: google.maps.Marker[];
  center: { lat: number; lng: number };
  bounds: google.maps.LatLngBounds;
}

export function useMapMarkers(
  map: google.maps.Map | null,
  options: UseMapMarkersOptions = {}
) {
  const {
    enableClustering = false,
    maxZoom = MAP_OPTIONS.CLUSTER_MAX_ZOOM,
    clusterRadius = 50,
    onMarkerClick,
  } = options;

  const [markers, setMarkers] = useState<Map<string, google.maps.Marker>>(new Map());
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [markerData, setMarkerData] = useState<Map<string, MarkerData>>(new Map());
  const [clusters, setClusters] = useState<MarkerCluster[]>([]);

  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  // Initialize InfoWindow when map becomes available
  useEffect(() => {
    if (map && !infoWindow) {
      const infoWindowInstance = new google.maps.InfoWindow({
        maxWidth: 300,
        pixelOffset: new google.maps.Size(0, -10),
      });
      setInfoWindow(infoWindowInstance);
    }
  }, [map, infoWindow]);

  // Calculate distance between two points (helper function)
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

  // Create marker clusters for performance optimization
  const createClusters = useCallback((
    visibleMarkers: google.maps.Marker[],
    radius: number
  ): MarkerCluster[] => {
    const clustersMap = new Map<string, MarkerCluster>();

    visibleMarkers.forEach((marker) => {
      const position = marker.getPosition();
      if (!position) return;

      const lat = position.lat();
      const lng = position.lng();

      // Find existing cluster within radius
      let foundCluster = false;

      for (const [key, cluster] of clustersMap.entries()) {
        const distance = calculateDistance(
          lat,
          lng,
          cluster.center.lat,
          cluster.center.lng
        );

        if (distance <= radius) {
          cluster.markers.push(marker);
          cluster.bounds.extend(position);
          foundCluster = true;
          break;
        }
      }

      // Create new cluster if none found
      if (!foundCluster) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(position);

        const clusterId = `cluster-${lat}-${lng}`;
        clustersMap.set(clusterId, {
          markers: [marker],
          center: { lat, lng },
          bounds,
        });
      }
    });

    return Array.from(clustersMap.values());
  }, [calculateDistance]);

  // Debounced clustering function for performance
  const debouncedUpdateClusters = useDebouncedCallback(() => {
    if (!enableClustering || !map) return;

    const visibleMarkers = Array.from(markersRef.current.values()).filter(marker => {
      const position = marker.getPosition();
      return position && map.getBounds()?.contains(position);
    });

    const newClusters = createClusters(visibleMarkers, clusterRadius);
    setClusters(newClusters);
  }, 300);

  // Get marker icon based on type
  const getMarkerIcon = useCallback((type?: string): google.maps.Icon | string => {
    if (!type) return MARKER_ICONS.business;

    const iconUrl = MARKER_ICONS[type as keyof typeof MARKER_ICONS] || MARKER_ICONS.business;

    return {
      url: iconUrl,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32),
    };
  }, []);

  // Add individual marker
  const addMarker = useCallback((markerDataItem: MarkerData) => {
    if (!map) return null;

    const marker = new google.maps.Marker({
      position: markerDataItem.position,
      map,
      title: markerDataItem.title,
      icon: getMarkerIcon(markerDataItem.type),
      optimized: true, // Performance optimization
    });

    // Add click listener with info window
    if (markerDataItem.content && infoWindow) {
      const clickListener = marker.addListener('click', () => {
        infoWindow.setContent(markerDataItem.content || '');
        infoWindow.open(map, marker);

        // Call custom click handler if provided
        if (onMarkerClick) {
          onMarkerClick(markerDataItem);
        }
      });

      cleanupFunctionsRef.current.push(() => {
        google.maps.event.removeListener(clickListener);
      });
    }

    // Update state
    setMarkers(prev => new Map(prev).set(markerDataItem.id, marker));
    setMarkerData(prev => new Map(prev).set(markerDataItem.id, markerDataItem));
    markersRef.current.set(markerDataItem.id, marker);

    // Update clusters if clustering enabled
    if (enableClustering) {
      debouncedUpdateClusters();
    }

    return marker;
  }, [map, infoWindow, getMarkerIcon, onMarkerClick, enableClustering, debouncedUpdateClusters]);

  // Remove marker by ID
  const removeMarker = useCallback((id: string) => {
    const marker = markersRef.current.get(id);
    if (marker) {
      marker.setMap(null);

      setMarkers(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      setMarkerData(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      markersRef.current.delete(id);

      // Update clusters if clustering enabled
      if (enableClustering) {
        debouncedUpdateClusters();
      }
    }
  }, [enableClustering, debouncedUpdateClusters]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));

    // Clean up event listeners
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];

    setMarkers(new Map());
    setMarkerData(new Map());
    markersRef.current.clear();
    setClusters([]);
  }, []);

  // Update markers with new data (replaces all existing markers)
  const updateMarkers = useCallback((newMarkerData: MarkerData[]) => {
    clearMarkers();

    newMarkerData.forEach(markerDataItem => {
      addMarker(markerDataItem);
    });

    // Fit map bounds to show all markers
    if (newMarkerData.length > 1 && map) {
      const bounds = new google.maps.LatLngBounds();
      newMarkerData.forEach(markerDataItem => {
        bounds.extend(markerDataItem.position);
      });

      // Add padding and fit bounds
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    } else if (newMarkerData.length === 1 && map) {
      // Center on single marker with appropriate zoom
      map.setCenter(newMarkerData[0].position);
      map.setZoom(MAP_OPTIONS.DEFAULT_ZOOM);
    }
  }, [clearMarkers, addMarker, map]);

  // Get marker by ID
  const getMarker = useCallback((id: string) => {
    return markersRef.current.get(id) || null;
  }, []);

  // Get all marker data
  const getMarkerData = useCallback((id: string) => {
    return markerData.get(id) || null;
  }, [markerData]);

  // Handle map zoom changes for clustering
  useEffect(() => {
    if (!map || !enableClustering) return;

    const zoomListener = map.addListener('zoom_changed', () => {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined && currentZoom > maxZoom) {
        // Show individual markers at high zoom levels
        setClusters([]);
        markersRef.current.forEach(marker => marker.setVisible(true));
      } else {
        // Show clusters at low zoom levels
        debouncedUpdateClusters();
      }
    });

    cleanupFunctionsRef.current.push(() => {
      google.maps.event.removeListener(zoomListener);
    });

    return () => {
      google.maps.event.removeListener(zoomListener);
    };
  }, [map, enableClustering, maxZoom, debouncedUpdateClusters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  return {
    markers: Array.from(markersRef.current.values()),
    markerCount: markersRef.current.size,
    addMarker,
    removeMarker,
    clearMarkers,
    updateMarkers,
    getMarker,
    getMarkerData,
    infoWindow,
    clusters,
    enableClustering,
  };
}