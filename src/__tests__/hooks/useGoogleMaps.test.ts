import { renderHook, waitFor } from '@testing-library/react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

// Mock Google Maps API
const mockLoader = {
  load: jest.fn(),
};

jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => mockLoader),
}));

// Create a proper mock for GOOGLE_MAPS_CONFIG with getter
jest.mock('@/lib/config/maps', () => ({
  GOOGLE_MAPS_CONFIG: {
    get apiKey() { return 'test-api-key'; },
    libraries: ['places', 'geometry'] as const,
  },
}));

// Mock window.google
const mockGoogleMaps = {
  maps: {
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
  },
};

describe('useGoogleMaps Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoader.load.mockReset();
    // @ts-ignore
    delete window.google;
    // Reset DOM
    document.head.innerHTML = '';
  });

  test('should initialize with correct default state', async () => {
    // Mock successful loading
    mockLoader.load.mockResolvedValueOnce(mockGoogleMaps);

    const { result } = renderHook(() => useGoogleMaps());

    // Initial state should be loading
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(true);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.loadError).toBeNull();
  });

  test('should handle successful Google Maps loading', async () => {
    mockLoader.load.mockResolvedValueOnce(mockGoogleMaps);

    const { result } = renderHook(() => useGoogleMaps());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    expect(result.current.loadError).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockLoader.load).toHaveBeenCalledTimes(1);
  });

  test('should handle Google Maps loading error', async () => {
    const errorMessage = 'Failed to load Google Maps';
    mockLoader.load.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useGoogleMaps());

    await waitFor(() => {
      expect(result.current.loadError).toBe('Failed to load Google Maps');
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('should return immediately if Google Maps already loaded', () => {
    // @ts-ignore
    window.google = mockGoogleMaps;

    const { result } = renderHook(() => useGoogleMaps());

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadError).toBeNull();
    expect(mockLoader.load).not.toHaveBeenCalled();
  });

  test('should use custom libraries option', async () => {
    const customLibraries: ['places'] = ['places'];
    mockLoader.load.mockResolvedValueOnce(mockGoogleMaps);

    const { result } = renderHook(() => useGoogleMaps({ libraries: customLibraries }));

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(require('@googlemaps/js-api-loader').Loader).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      version: 'weekly',
      libraries: customLibraries,
    });
  });

  test('should handle API key configuration error', async () => {
    // Mock the config to throw an error when accessing apiKey
    const errorConfig = {
      get apiKey() {
        throw new Error('Google Maps API key is required');
      },
      libraries: ['places', 'geometry'] as const,
    };

    // Temporarily replace the mock
    const originalMock = require('@/lib/config/maps');
    jest.doMock('@/lib/config/maps', () => ({
      GOOGLE_MAPS_CONFIG: errorConfig,
    }));

    const { result } = renderHook(() => useGoogleMaps());

    await waitFor(() => {
      expect(result.current.loadError).toBe('Failed to initialize Google Maps');
    });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(false);

    // Restore original mock
    jest.doMock('@/lib/config/maps', () => originalMock);
  });
});