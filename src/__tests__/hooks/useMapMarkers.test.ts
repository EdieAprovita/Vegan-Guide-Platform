import { renderHook, act } from '@testing-library/react';
import { useMapMarkers, MarkerData } from '@/hooks/useMapMarkers';

// Mock useDebouncedCallback
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: Function) => fn, // Return the function directly for testing
}));

// Mock MARKER_ICONS and MAP_OPTIONS
jest.mock('@/lib/config/maps', () => ({
  MARKER_ICONS: {
    restaurant: '/icons/markers/restaurant.png',
    business: '/icons/markers/business.png',
    market: '/icons/markers/market.png',
    doctor: '/icons/markers/doctor.png',
    sanctuary: '/icons/markers/sanctuary.png',
    currentLocation: '/icons/markers/current-location.png',
  },
  MAP_OPTIONS: {
    DEFAULT_ZOOM: 12,
    MAX_ZOOM: 18,
    MIN_ZOOM: 8,
    CLUSTER_MAX_ZOOM: 14,
  },
}));

// Mock Google Maps objects with proper methods
const mockPosition = {
  lat: jest.fn(() => 4.6097),
  lng: jest.fn(() => -74.0817),
};

const mockMarker = {
  setMap: jest.fn(),
  getPosition: jest.fn(() => mockPosition),
  addListener: jest.fn((event, callback) => {
    // Store the callback for manual triggering in tests
    mockMarker._listeners = mockMarker._listeners || {};
    mockMarker._listeners[event] = callback;
    return `listener-${event}`;
  }),
  _listeners: {} as Record<string, Function>,
} as any;

const mockInfoWindow = {
  setContent: jest.fn(),
  open: jest.fn(),
  close: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockBounds = {
  extend: jest.fn(),
  contains: jest.fn(() => true),
} as any;

const mockMap = {
  fitBounds: jest.fn(),
  panToBounds: jest.fn(),
  getBounds: jest.fn(() => mockBounds),
  addListener: jest.fn(),
} as any;

const mockEvent = {
  removeListener: jest.fn(),
};

// Mock Google Maps constructors and static methods
global.google = {
  maps: {
    Marker: jest.fn(() => mockMarker),
    InfoWindow: jest.fn(() => mockInfoWindow),
    LatLngBounds: jest.fn(() => mockBounds),
    Size: jest.fn((width, height) => ({ width, height })),
    Point: jest.fn((x, y) => ({ x, y })),
    event: mockEvent,
  },
} as unknown as typeof google;

describe('useMapMarkers Hook', () => {
  const sampleMarkerData: MarkerData[] = [
    {
      id: 'marker-1',
      position: { lat: 4.6097, lng: -74.0817 },
      title: 'Test Location 1',
      content: 'Test content 1',
      type: 'restaurant',
    },
    {
      id: 'marker-2',
      position: { lat: 4.6098, lng: -74.0818 },
      title: 'Test Location 2',
      content: 'Test content 2',
      type: 'business',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with empty markers when no map provided', () => {
    const { result } = renderHook(() => useMapMarkers(null));

    expect(result.current.markers).toEqual([]);
    expect(result.current.infoWindow).toBeNull();
  });

  test('should create info window when map is provided', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    expect(result.current.infoWindow).toBe(mockInfoWindow);
    expect(global.google.maps.InfoWindow).toHaveBeenCalledTimes(1);
  });

  test('should add marker correctly', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      result.current.addMarker(sampleMarkerData[0]);
    });

    expect(global.google.maps.Marker).toHaveBeenCalledWith({
      position: sampleMarkerData[0].position,
      map: mockMap,
      title: sampleMarkerData[0].title,
      icon: expect.any(Object),
      optimized: true,
    });

    expect(result.current.markerCount).toBe(1);
  });

  test('should remove marker correctly', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      result.current.addMarker(sampleMarkerData[0]);
    });

    expect(result.current.markerCount).toBe(1);

    act(() => {
      result.current.removeMarker('marker-1');
    });

    expect(mockMarker.setMap).toHaveBeenCalledWith(null);
    expect(result.current.markerCount).toBe(0);
  });

  test('should clear all markers', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      sampleMarkerData.forEach(marker => {
        result.current.addMarker(marker);
      });
    });

    expect(result.current.markerCount).toBe(2);

    act(() => {
      result.current.clearMarkers();
    });

    expect(result.current.markerCount).toBe(0);
    expect(mockMarker.setMap).toHaveBeenCalledWith(null);
  });

  test('should update markers correctly', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      result.current.updateMarkers(sampleMarkerData);
    });

    expect(result.current.markerCount).toBe(2);
    expect(mockMap.fitBounds).toHaveBeenCalledTimes(1);
  });

  test('should handle marker click with info window', () => {
    const { result } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      result.current.addMarker(sampleMarkerData[0]);
    });

    // Simulate marker click
    const clickHandler = (mockMarker.addListener as jest.Mock).mock.calls
      .find(call => call[0] === 'click')?.[1];

    expect(clickHandler).toBeDefined();

    act(() => {
      clickHandler();
    });

    expect(mockInfoWindow.setContent).toHaveBeenCalledWith(sampleMarkerData[0].content);
    expect(mockInfoWindow.open).toHaveBeenCalledWith(mockMap, mockMarker);
  });

  test('should handle clustering for performance optimization', () => {
    const manyMarkers: MarkerData[] = Array.from({ length: 100 }, (_, i) => ({
      id: `marker-${i}`,
      position: { lat: 4.6097 + i * 0.001, lng: -74.0817 + i * 0.001 },
      title: `Location ${i}`,
      type: 'restaurant',
    }));

    const { result } = renderHook(() => useMapMarkers(mockMap, { enableClustering: true, maxZoom: 15 }));

    act(() => {
      result.current.updateMarkers(manyMarkers);
    });

    // Should still create markers but manage them efficiently
    expect(result.current.markerCount).toBe(100);
  });

  test('should cleanup markers on unmount', () => {
    const { result, unmount } = renderHook(() => useMapMarkers(mockMap));

    act(() => {
      result.current.addMarker(sampleMarkerData[0]);
    });

    unmount();

    expect(mockMarker.setMap).toHaveBeenCalledWith(null);
  });
});