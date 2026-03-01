/**
 * Shared geospatial types used across all API modules.
 * Matches the GeoJSON Point format returned by the backend.
 */

/** GeoJSON Point geometry as stored in MongoDB and returned by the backend. */
export interface GeoLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}
