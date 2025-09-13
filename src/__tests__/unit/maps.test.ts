import { describe, test, expect } from '@jest/globals';
import { GOOGLE_MAPS_CONFIG, MAP_THEMES } from '@/lib/config/maps';

describe('Google Maps Configuration', () => {
  test('should have valid default configuration', () => {
    expect(GOOGLE_MAPS_CONFIG.defaultCenter.lat).toBe(4.6097);
    expect(GOOGLE_MAPS_CONFIG.defaultCenter.lng).toBe(-74.0817);
    expect(GOOGLE_MAPS_CONFIG.defaultZoom).toBe(12);
  });

  test('should have map themes defined', () => {
    expect(MAP_THEMES.light).toBeDefined();
    expect(MAP_THEMES.dark).toBeDefined();
    expect(Array.isArray(MAP_THEMES.dark)).toBe(true);
  });

  test('should have proper libraries configuration', () => {
    expect(GOOGLE_MAPS_CONFIG.libraries).toContain('places');
    expect(GOOGLE_MAPS_CONFIG.libraries).toContain('geometry');
  });
});