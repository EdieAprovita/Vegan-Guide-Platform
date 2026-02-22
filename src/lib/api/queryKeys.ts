import type { Coordinates } from "@/lib/utils/geospatial";

type QueryKeyPart = string | number | boolean | null | undefined | Record<string, unknown> | Coordinates;

function createKey<T extends readonly QueryKeyPart[]>(...parts: T): T {
  return parts;
}

export const queryKeys = {
  restaurants: {
    all: createKey("restaurants"),
    detail: (id: string) => createKey("restaurants", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbyRestaurants", coords ?? null, params ?? null),
    byCuisine: (cuisine: string, coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("restaurantsByCuisine", cuisine, coords ?? null, params ?? null),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedRestaurantSearch", coords ?? null, params ?? null),
  },

  doctors: {
    all: createKey("doctors"),
    detail: (id: string) => createKey("doctors", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("professions", "nearby", coords ?? null, params ?? null),
    byCategory: (params?: Record<string, unknown>, coords?: Coordinates | null) =>
      createKey("professions", "byCategory", params ?? null, coords ?? null),
  },

  markets: {
    all: createKey("markets"),
    detail: (id: string) => createKey("markets", id),
    nearby: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("nearbyMarkets", coords ?? null, params ?? null),
    byProducts: (products: string, coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("marketsByProducts", products, coords ?? null, params ?? null),
    search: (coords?: Coordinates | null, params?: Record<string, unknown>) =>
      createKey("advancedMarketSearch", coords ?? null, params ?? null),
  },

  recipes: {
    all: createKey("recipes"),
    detail: (id: string) => createKey("recipes", id),
  },

  sanctuaries: {
    all: createKey("sanctuaries"),
    detail: (id: string) => createKey("sanctuaries", id),
  },

  posts: {
    all: createKey("posts"),
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
    detail: (id: string) => createKey("businesses", id),
  },

  reviews: {
    byEntity: (entityType: string, entityId: string) =>
      createKey("reviews", entityType, entityId),
    detail: (id: string) => createKey("reviews", id),
  },

  professions: {
    all: createKey("professions"),
    detail: (id: string) => createKey("professions", id),
  },

  search: {
    global: (query: string) => createKey("search", "global", query),
    suggestions: (query: string) => createKey("search", "suggestions", query),
    popular: createKey("search", "popular"),
    byType: (type: string, query: string) => createKey("search", type, query),
  },

  auth: {
    session: createKey("auth", "session"),
    profile: createKey("auth", "profile"),
  },
} as const;
