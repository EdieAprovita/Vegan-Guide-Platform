// Search types for Phase 3 implementation
export type ResourceType = 'restaurants' | 'recipes' | 'markets' | 'doctors' | 'businesses' | 'sanctuaries' | 'posts';

export type SortOption = 'relevance' | 'rating' | 'distance' | 'newest' | 'oldest';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] - GeoJSON format
}

export interface SearchFilters {
  query: string;
  resourceTypes: ResourceType[];
  location: string;
  radius: number; // in kilometers
  minRating: number;
  sortBy: SortOption;
  coordinates?: Coordinates;
  budget?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface SearchResult {
  _id: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  rating?: number;
  numReviews?: number;
  image?: string;
  location?: Location;
  distance?: number; // in kilometers from search center
  createdAt: string;
  updatedAt: string;
  // Type-specific fields
  address?: string; // for businesses, restaurants, etc.
  budget?: number; // for businesses, restaurants
  typeBusiness?: string; // for businesses
  cuisine?: string; // for restaurants
  specialty?: string; // for doctors
  ingredients?: string[]; // for recipes
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  aggregations?: {
    resourceTypes: Record<ResourceType, number>;
    averageRating: number;
    locationClusters: LocationCluster[];
  };
}

export interface LocationCluster {
  center: Coordinates;
  count: number;
  bounds: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

export interface SearchParams {
  page?: number;
  limit?: number;
  filters?: Partial<SearchFilters>;
}

// UI-specific types
export interface SearchState {
  isSearching: boolean;
  filters: SearchFilters;
  results: SearchResult[];
  total: number;
  currentPage: number;
  totalPages: number;
  error: string | null;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
  icon?: string;
}

export interface ResourceTypeOption extends FilterOption {
  id: ResourceType;
  emoji: string;
}