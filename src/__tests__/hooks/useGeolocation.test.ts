import { renderHook, act } from "@testing-library/react";
import { useGeolocation, useUserLocation } from "@/hooks/useGeolocation";

jest.mock("use-debounce", () => ({
  useDebouncedCallback: (fn: (...args: unknown[]) => unknown) => fn,
}));

const originalNavigator = global.navigator;

describe("useGeolocation error and mapping paths", () => {
  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  it("throws a supported-browser error when geolocation is unavailable", async () => {
    Object.defineProperty(global, "navigator", {
      value: {},
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {
      await expect(result.current.getCurrentPosition()).rejects.toThrow(
        "Geolocation is not supported by this browser"
      );
    });

    expect(result.current.supported).toBe(false);
    expect(result.current.error).toContain("not supported");
  });

  it("maps permission denied to user-friendly message", async () => {
    const getCurrentPosition = jest.fn(
      (_success: PositionCallback, error: PositionErrorCallback | null) => {
        error?.({
          code: 1,
          message: "denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      }
    );

    Object.defineProperty(global, "navigator", {
      value: {
        geolocation: {
          getCurrentPosition,
          watchPosition: jest.fn(),
          clearWatch: jest.fn(),
        },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation({ retryAttempts: 1, retryDelay: 1 }));

    await act(async () => {
      await expect(result.current.getCurrentPosition()).rejects.toThrow(
        "Acceso a la ubicación denegado"
      );
    });

    expect(getCurrentPosition).toHaveBeenCalled();
  });

  it("maps coordinates through useUserLocation", async () => {
    const mockPosition = {
      coords: {
        latitude: 19.4326,
        longitude: -99.1332,
        accuracy: 15,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    const getCurrentPosition = jest.fn((success: PositionCallback) => success(mockPosition));

    Object.defineProperty(global, "navigator", {
      value: {
        geolocation: {
          getCurrentPosition,
          watchPosition: jest.fn(),
          clearWatch: jest.fn(),
        },
      },
      configurable: true,
    });

    const { result } = renderHook(() => useUserLocation());

    await act(async () => {
      await result.current.getCurrentPosition();
    });

    expect(result.current.userCoords).toEqual({
      lat: 19.4326,
      lng: -99.1332,
      accuracy: 15,
    });
    expect(result.current.hasLocation).toBe(true);
  });
});
