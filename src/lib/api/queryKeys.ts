import type { Coordinates } from "@/lib/utils/geospatial";
import type { SearchFilters } from "@/types/search";

type QueryKeyPart =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | Coordinates;

function createKey<T extends readonly QueryKeyPart[]>(...parts: T): T {
  return parts;
}

export const queryKeys = {
  restaurants: {
    all: createKey("restaurants"),
    list: (params?: Record<string, unknown>) => createKey("restaurants", params ?? null),
    detail: (id: string) => createKey("restaurants", id),
    topRated: (limit: number) => createKey("restaurants", "topRated", limit),
    nearbyAll: createKey("nearbyRestaurants"),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbyRestaurants", coords ?? null, params ?? null),
    byCuisineAll: createKey("restaurantsByCuisine"),
    byCuisine: (cuisine: string, coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("restaurantsByCuisine", cuisine, coords ?? null, params ?? null),
    searchAll: createKey("advancedRestaurantSearch"),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedRestaurantSearch", coords ?? null, params ?? null),
  },

  doctors: {
    all: createKey("doctors"),
    list: (params?: Record<string, unknown>) => createKey("doctors", params ?? null),
    detail: (id: string) => createKey("doctors", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbyDoctors", coords ?? null, params ?? null),
    bySpecialty: (
      specialty: string,
      coords?: Coordinates | null,
      params?: Record<string, unknown>,
    ) => createKey("doctorsBySpecialty", specialty, coords ?? null, params ?? null),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedDoctorSearch", coords ?? null, params ?? null),
  },

  markets: {
    all: createKey("markets"),
    list: (params?: Record<string, unknown>) => createKey("markets", params ?? null),
    detail: (id: string) => createKey("markets", id),
    nearbyAll: createKey("nearbyMarkets"),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbyMarkets", coords ?? null, params ?? null),
    byProductsAll: createKey("marketsByProducts"),
    byProducts: (
      products: string,
      coords?: Coordinates | null,
      params?: Record<string, unknown>,
    ) => createKey("marketsByProducts", products, coords ?? null, params ?? null),
    searchAll: createKey("advancedMarketSearch"),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedMarketSearch", coords ?? null, params ?? null),
  },

  recipes: {
    all: createKey("recipes"),
    list: (params?: Record<string, unknown>) => createKey("recipes", params ?? null),
    detail: (id: string) => createKey("recipes", id),
    infinite: (params?: Record<string, unknown>) =>
      createKey("recipes", "infinite", params ?? null),
  },

  sanctuaries: {
    all: createKey("sanctuaries"),
    list: (params?: Record<string, unknown>) => createKey("sanctuaries", params ?? null),
    detail: (id: string) => createKey("sanctuaries", id),
    nearbyAll: createKey("nearbySanctuaries"),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbySanctuaries", coords ?? null, params ?? null),
    byTypeAll: createKey("sanctuariesByType"),
    byType: (
      typeofSanctuary: string,
      coords?: Coordinates | null,
      params?: Record<string, unknown>,
    ) => createKey("sanctuariesByType", typeofSanctuary, coords ?? null, params ?? null),
    searchAll: createKey("advancedSanctuarySearch"),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedSanctuarySearch", coords ?? null, params ?? null),
  },

  posts: {
    all: createKey("posts"),
    list: (params?: Record<string, unknown>) => createKey("posts", params ?? null),
    detail: (id: string) => createKey("posts", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("posts", "nearby", coords ?? null, params ?? null),
    byTags: (params?: Record<string, unknown>, coords?: Coordinates | null) =>
      createKey("posts", "byTags", params ?? null, coords ?? null),
    search: (params?: Record<string, unknown>, coords?: Coordinates | null) =>
      createKey("posts", "advancedSearch", params ?? null, coords ?? null),
  },

  businesses: {
    all: createKey("businesses"),
    list: (filters?: Record<string, unknown>) => createKey("businesses", "list", filters ?? null),
    detail: (id: string) => createKey("businesses", "detail", id),
  },

  reviews: {
    all: createKey("reviews"),
    list: (resourceType: string, resourceId: string) =>
      createKey("reviews", "list", resourceType, resourceId),
    stats: (resourceType: string, resourceId: string) =>
      createKey("reviews", "stats", resourceType, resourceId),
    detail: (id: string) => createKey("reviews", "detail", id),
    byEntity: (entityType: string, entityId: string) =>
      createKey("reviews", entityType, entityId),
  },

  professions: {
    all: createKey("professions"),
    list: (params?: Record<string, unknown>) => createKey("professions", "list", params ?? null),
    detail: (id: string) => createKey("professions", "detail", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("professions", "nearby", coords ?? null, params ?? null),
    byCategory: (params?: Record<string, unknown>, coords?: Coordinates | null) =>
      createKey("professions", "byCategory", params ?? null, coords ?? null),
  },

  professionalProfiles: {
    all: createKey("professionalProfiles"),
    list: (params?: Record<string, unknown>) =>
      createKey("professionalProfiles", "list", params ?? null),
    detail: (id: string) => createKey("professionalProfiles", "detail", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("professionalProfiles", "nearby", coords ?? null, params ?? null),
    search: (params?: Record<string, unknown>, coords?: Coordinates | null) =>
      createKey("professionalProfiles", "advancedSearch", params ?? null, coords ?? null),
  },

  search: {
    all: createKey("search"),
    global: (query: string) => createKey("search", "global", query),
    results: (filters: SearchFilters) =>
      createKey("search", "results", filters as unknown as Record<string, unknown>),
    suggestions: (query: string) => createKey("search", "suggestions", query),
    aggregations: (filters: Record<string, unknown>) =>
      createKey("search", "aggregations", filters),
    popular: createKey("search", "popular"),
    byType: (type: string, query: string) => createKey("search", type, query),
  },

  auth: {
    session: createKey("auth", "session"),
    profile: createKey("auth", "profile"),
  },
} as const;
