import { Page } from "@playwright/test";
// Re-export mockNextImages from test-utils to maintain backward compatibility
export { mockNextImages } from "./test-utils";

/* ------------------------------------------------------------------ */
/*  Shared API mock helpers for Verde Guide E2E tests                 */
/*  All mocks target the Express backend at /api/v1/*                 */
/* ------------------------------------------------------------------ */

const API = "**/api/v1";

/* ---------- Generic helpers ---------- */

/** Fulfill a route with a JSON body wrapped in the backend envelope */
export function jsonResponse<T>(data: T, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data }),
  };
}

export function errorResponse(message: string, status = 400) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify({ success: false, message }),
  };
}

/* ---------- Auth mocks ---------- */

export const mockUser = {
  _id: "e2e-user-001",
  username: "e2euser",
  email: "e2e@verde.test",
  role: "user" as const,
  photo: "",
  token: "mock-jwt-token-e2e",
  refreshToken: "mock-refresh-token-e2e",
};

export const mockAdmin = {
  ...mockUser,
  _id: "e2e-admin-001",
  username: "e2eadmin",
  email: "admin@verde.test",
  role: "admin" as const,
};

export async function mockLoginSuccess(page: Page) {
  await page.route(`${API}/users/login`, (route) => route.fulfill(jsonResponse(mockUser)));
}

export async function mockLoginFailure(page: Page) {
  await page.route(`${API}/users/login`, (route) =>
    route.fulfill(errorResponse("Credenciales inválidas", 401))
  );
}

export async function mockRegisterSuccess(page: Page) {
  await page.route(`${API}/users/register`, (route) => route.fulfill(jsonResponse(mockUser, 201)));
}

/* ---------- Resource list mocks ---------- */

export const mockRestaurant = {
  _id: "rest-001",
  restaurantName: "Green Garden",
  name: "Green Garden",
  address: "Calle Verde 42, CDMX",
  city: "CDMX",
  country: "México",
  cuisine: ["vegana", "mexicana"],
  rating: 4.5,
  numReviews: 12,
  reviews: [] as { rating: number; comment: string; createdAt?: string }[],
  image: "/placeholder.jpg",
  photo: "/placeholder.jpg",
  location: { type: "Point", coordinates: [-99.1332, 19.4326] },
  description: "Restaurante vegano en el centro",
  contact: [
    {
      phone: "+52 55 1234 5678",
      facebook: "https://facebook.com/greengarden",
      instagram: "https://instagram.com/greengarden",
    },
  ],
  author: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockRecipe = {
  _id: "rec-001",
  title: "Tacos de Jackfruit",
  description: "Tacos veganos con jackfruit marinado",
  preparationTime: 15,
  cookingTime: 20,
  totalTime: 35,
  servings: 4,
  difficulty: "media",
  categories: ["mexicana", "vegana"],
  ingredients: ["jackfruit", "tortillas", "cilantro"],
  instructions: ["Marinar jackfruit", "Calentar tortillas", "Servir"],
  rating: 4.8,
  averageRating: 4.8,
  numReviews: 10,
  reviews: [] as string[],
  image: "/placeholder.jpg",
  photo: "/placeholder.jpg",
  author: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockDoctor = {
  _id: "doc-001",
  name: "Ana López",
  fullName: "Dra. Ana López",
  specialty: "Nutrición Vegana",
  address: "Av. Reforma 100, CDMX",
  phone: "+52 55 1234 5678",
  rating: 4.9,
  numReviews: 8,
  reviews: [] as { user: string; rating: number; comment: string; date: string }[],
  photo: "/placeholder.jpg",
  languages: ["Español", "English"],
  experience: "10 years of experience",
  education: ["Licenciatura en Nutrición, UNAM"],
  contact: [
    {
      phone: "+52 55 1234 5678",
      email: "dra.lopez@verde.test",
      website: "https://dralopez.com",
    },
  ],
  author: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  location: { type: "Point", coordinates: [-99.1332, 19.4326] },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockMarket = {
  _id: "mkt-001",
  marketName: "Mercado Verde Orgánico",
  address: "Col. Roma Norte, CDMX",
  products: ["frutas", "verduras", "granos"],
  rating: 4.3,
  numReviews: 6,
  reviews: [] as { user: string; rating: number; comment: string; date: string }[],
  photo: "/placeholder.jpg",
  hours: [
    { day: "Monday", open: "09:00", close: "18:00" },
    { day: "Tuesday", open: "09:00", close: "18:00" },
  ],
  contact: [
    {
      phone: "+52 55 8765 4321",
      email: "info@mercadoverde.test",
      website: "https://mercadoverde.com",
    },
  ],
  author: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  location: { type: "Point", coordinates: [-99.1568, 19.4194] },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function mockRestaurantList(page: Page, count = 3) {
  const restaurants = Array.from({ length: count }, (_, i) => ({
    ...mockRestaurant,
    _id: `rest-${String(i + 1).padStart(3, "0")}`,
    restaurantName: `Restaurant ${i + 1}`,
  }));

  await page.route(`${API}/restaurants*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(restaurants));
    }
    return route.continue();
  });
}

export async function mockRecipeList(page: Page, count = 3) {
  const recipes = Array.from({ length: count }, (_, i) => ({
    ...mockRecipe,
    _id: `rec-${String(i + 1).padStart(3, "0")}`,
    title: `Receta ${i + 1}`,
  }));

  await page.route(`${API}/recipes*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(recipes));
    }
    return route.continue();
  });
}

export async function mockDoctorList(page: Page, count = 3) {
  const doctors = Array.from({ length: count }, (_, i) => ({
    ...mockDoctor,
    _id: `doc-${String(i + 1).padStart(3, "0")}`,
    fullName: `Doctor ${i + 1}`,
  }));

  await page.route(`${API}/doctors*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(doctors));
    }
    return route.continue();
  });
}

export async function mockMarketList(page: Page, count = 3) {
  const markets = Array.from({ length: count }, (_, i) => ({
    ...mockMarket,
    _id: `mkt-${String(i + 1).padStart(3, "0")}`,
    marketName: `Mercado ${i + 1}`,
  }));

  await page.route(`${API}/markets*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(markets));
    }
    return route.continue();
  });
}

/* ---------- Search mocks ---------- */

export async function mockSearchResults(page: Page) {
  await page.route(`${API}/search*`, (route) =>
    route.fulfill(
      jsonResponse({
        results: [mockRestaurant, mockRecipe, mockDoctor],
        total: 3,
        page: 1,
        limit: 10,
      })
    )
  );

  await page.route(`${API}/search/suggestions*`, (route) =>
    route.fulfill(jsonResponse(["restaurante vegano", "recetas sin gluten", "nutrición"]))
  );

  await page.route(`${API}/search/popular*`, (route) =>
    route.fulfill(jsonResponse(["vegano", "recetas", "restaurantes", "mercados"]))
  );
}

/* ---------- Review mocks ---------- */

export const mockReview = {
  _id: "rev-001",
  rating: 5,
  comment: "Excelente lugar, totalmente recomendado para veganos",
  user: { _id: mockUser._id, username: mockUser.username },
  createdAt: new Date().toISOString(),
};

export async function mockReviewCreate(page: Page) {
  await page.route(`${API}/restaurants/*/reviews`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse(mockReview, 201));
    }
    return route.continue();
  });

  // Also handle the add-review pattern
  await page.route(`${API}/restaurants/add-review/*`, (route) =>
    route.fulfill(jsonResponse(mockReview, 201))
  );
}

/* ---------- Google Maps Mock ---------- */

export async function mockGoogleMaps(page: Page) {
  // Mock all Google Maps endpoints with a complete constructor stub
  // so that new google.maps.Map(), Marker(), etc. don't throw at runtime.
  const googleMapsStub = `
    window.google = {
      maps: {
        Map: function() { return { setCenter: function(){}, setZoom: function(){}, addListener: function(){} }; },
        Marker: function() { return { setMap: function(){}, setPosition: function(){}, addListener: function(){} }; },
        InfoWindow: function() { return { open: function(){}, close: function(){} }; },
        LatLng: function(lat, lng) { return { lat: function(){ return lat; }, lng: function(){ return lng; } }; },
        Geocoder: function() { return { geocode: function(){} }; },
        event: { addListener: function(){}, removeListener: function(){} },
        ControlPosition: { TOP_RIGHT: 1 },
        MapTypeId: { ROADMAP: "roadmap" },
      }
    };
  `;

  await page.route("https://maps.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: googleMapsStub,
    })
  );
  await page.route("**/maps.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: googleMapsStub,
    })
  );
}

/* ---------- Resource detail mocks ---------- */

/**
 * Mocks GET /api/v1/restaurants/{id} for any restaurant ID.
 * Optionally accepts a partial restaurant override.
 */
export async function mockRestaurantDetail(
  page: Page,
  restaurant: Partial<typeof mockRestaurant> = {}
) {
  const data = { ...mockRestaurant, ...restaurant };
  await page.route(`${API}/restaurants/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(data));
    }
    return route.continue();
  });
}

/**
 * Mocks GET /api/v1/recipes/{id} for any recipe ID.
 * Optionally accepts a partial recipe override.
 */
export async function mockRecipeDetail(page: Page, recipe: Partial<typeof mockRecipe> = {}) {
  const data = { ...mockRecipe, ...recipe };
  await page.route(`${API}/recipes/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(data));
    }
    return route.continue();
  });
}

/**
 * Mocks GET /api/v1/doctors/{id} for any doctor ID.
 * Optionally accepts a partial doctor override.
 */
export async function mockDoctorDetail(page: Page, doctor: Partial<typeof mockDoctor> = {}) {
  const data = { ...mockDoctor, ...doctor };
  await page.route(`${API}/doctors/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(data));
    }
    return route.continue();
  });
}

/**
 * Mocks GET /api/v1/markets/{id} for any market ID.
 * Optionally accepts a partial market override.
 */
export async function mockMarketDetail(page: Page, market: Partial<typeof mockMarket> = {}) {
  const data = { ...mockMarket, ...market };
  await page.route(`${API}/markets/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(data));
    }
    return route.continue();
  });
}

/* ---------- Resource create mocks ---------- */

/**
 * Mocks POST /api/v1/recipes returning the created recipe (201).
 */
export async function mockRecipeCreate(page: Page) {
  await page.route(`${API}/recipes`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse({ ...mockRecipe, _id: "rec-new-001" }, 201));
    }
    return route.continue();
  });
}

/**
 * Mocks POST /api/v1/restaurants returning the created restaurant (201).
 */
export async function mockRestaurantCreate(page: Page) {
  await page.route(`${API}/restaurants`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse({ ...mockRestaurant, _id: "rest-new-001" }, 201));
    }
    return route.continue();
  });
}

/**
 * Mocks POST /api/v1/doctors returning the created doctor (201).
 */
export async function mockDoctorCreate(page: Page) {
  await page.route(`${API}/doctors`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse({ ...mockDoctor, _id: "doc-new-001" }, 201));
    }
    return route.continue();
  });
}

/**
 * Mocks POST /api/v1/markets returning the created market (201).
 */
export async function mockMarketCreate(page: Page) {
  await page.route(`${API}/markets`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse({ ...mockMarket, _id: "mkt-new-001" }, 201));
    }
    return route.continue();
  });
}

/* ---------- Resource delete mock ---------- */

/**
 * Mocks DELETE /api/v1/{resource}/{id} returning 200 with null data.
 * Accepts "restaurants" | "recipes" | "doctors" | "markets".
 */
export async function mockResourceDelete(
  page: Page,
  resource: "restaurants" | "recipes" | "doctors" | "markets"
) {
  await page.route(`${API}/${resource}/*`, (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill(jsonResponse(null));
    }
    return route.continue();
  });
}

/* ---------- Phase 4: Search & Discovery mocks ---------- */

export const mockPost = {
  _id: "post-001",
  title: "Mi experiencia como vegano en CDMX",
  content: "Compartiendo mis mejores descubrimientos veganos en la Ciudad de México...",
  tags: ["Vegan Lifestyle", "Restaurant Reviews"],
  author: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  likes: ["user-002", "user-003"],
  comments: [
    {
      _id: "comment-001",
      content: "Muy interesante!",
      author: { _id: "user-002", username: "veganfan" },
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockRecommendation = {
  id: "rec-rec-001",
  type: "restaurant" as const,
  title: "Green Garden Bistro",
  description: "Perfect match for your preferences",
  image: "/placeholder.jpg",
  rating: 4.7,
  distance: 2.5,
  matchScore: 92,
  reason: "Based on your love of Mexican cuisine",
  tags: ["vegana", "mexicana", "orgánica"],
};

export const mockAchievement = {
  id: "ach-001",
  title: "First Steps",
  description: "Complete your profile",
  icon: "🌱",
  category: "community" as const,
  points: 10,
  isUnlocked: true,
  progress: 1,
  maxProgress: 1,
  unlockedAt: new Date().toISOString(),
};

/** Mock advanced search with unified results across all resource types */
export async function mockAdvancedSearch(page: Page) {
  await page.route(`${API}/search`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(
        jsonResponse({
          results: [
            {
              ...mockRestaurant,
              resourceType: "restaurants",
              title: mockRestaurant.restaurantName,
            },
            { ...mockRecipe, resourceType: "recipes", title: mockRecipe.title },
            { ...mockDoctor, resourceType: "doctors", title: mockDoctor.name },
          ],
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        })
      );
    }
    return route.continue();
  });
}

/** Mock search filtered by a single resource type */
export async function mockSearchByType(page: Page) {
  await page.route(`${API}/search/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(
        jsonResponse({
          results: [{ ...mockRestaurant, resourceType: "restaurants" }],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        })
      );
    }
    return route.continue();
  });
}

/** Mock search aggregations (facets) endpoint */
export async function mockSearchAggregations(page: Page) {
  await page.route(`${API}/search/aggregations*`, (route) =>
    route.fulfill(
      jsonResponse({
        resourceTypes: { restaurants: 5, recipes: 8, markets: 3, doctors: 2 },
        locations: [{ name: "CDMX", count: 10 }],
        priceRanges: [{ range: "$", count: 5 }],
        ratings: { 5: 3, 4: 5, 3: 2 },
      })
    )
  );
}

/** Mock community posts list */
export async function mockPostList(page: Page, count = 3) {
  const posts = Array.from({ length: count }, (_, i) => ({
    ...mockPost,
    _id: `post-${String(i + 1).padStart(3, "0")}`,
    title: `Post ${i + 1}`,
  }));

  await page.route(`${API}/posts*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(posts));
    }
    return route.continue();
  });
}

/** Mock community post detail */
export async function mockPostDetail(page: Page) {
  await page.route(`${API}/posts/*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse(mockPost));
    }
    return route.continue();
  });
}

/** Mock personalised recommendations feed */
export async function mockRecommendations(page: Page) {
  const recommendations = Array.from({ length: 5 }, (_, i) => ({
    ...mockRecommendation,
    id: `rec-rec-${String(i + 1).padStart(3, "0")}`,
    title: `Recommendation ${i + 1}`,
    matchScore: 95 - i * 5,
    type: (["restaurant", "recipe", "doctor", "market", "restaurant"] as const)[i],
  }));

  await page.route(`${API}/recommendations*`, (route) =>
    route.fulfill(jsonResponse(recommendations))
  );
}

/** Mock user dietary/preference settings used by the recommendation engine */
export async function mockUserPreferences(page: Page) {
  await page.route(`${API}/users/*/preferences*`, (route) =>
    route.fulfill(
      jsonResponse({
        dietaryRestrictions: ["vegan"],
        favoriteCuisines: ["mexicana", "italiana"],
        priceRange: "moderate",
        location: "CDMX",
        healthGoals: ["nutrition"],
      })
    )
  );
}

/** Mock achievements list and per-user achievements with stats */
export async function mockAchievements(page: Page) {
  const achievements = Array.from({ length: 8 }, (_, i) => ({
    ...mockAchievement,
    id: `ach-${String(i + 1).padStart(3, "0")}`,
    title: `Achievement ${i + 1}`,
    isUnlocked: i < 3,
    progress: i < 3 ? 1 : 0,
    category: (
      [
        "community",
        "restaurants",
        "recipes",
        "health",
        "exploration",
        "community",
        "restaurants",
        "recipes",
      ] as const
    )[i],
    points: (i + 1) * 10,
  }));

  await page.route(`${API}/achievements*`, (route) => route.fulfill(jsonResponse(achievements)));

  await page.route(`${API}/users/*/achievements*`, (route) =>
    route.fulfill(
      jsonResponse({
        achievements,
        stats: {
          totalPoints: 60,
          level: 1,
          rank: "Vegan Beginner",
          streak: 3,
          unlocked: 3,
          total: 8,
        },
      })
    )
  );
}

/** Mock top-level gamification stats for the current user */
export async function mockGamificationStats(page: Page) {
  await page.route(`${API}/gamification*`, (route) =>
    route.fulfill(
      jsonResponse({
        totalPoints: 60,
        level: 1,
        rank: "Vegan Beginner",
        streak: 3,
        achievements: { unlocked: 3, total: 8 },
      })
    )
  );
}

/** Mock map location pins (restaurants, markets, doctors) and nearby endpoint */
export async function mockMapLocations(page: Page) {
  const locations = [
    {
      id: "loc-001",
      name: "Green Garden",
      address: "Calle Verde 42",
      type: "restaurant",
      rating: 4.5,
      coordinates: [-99.1332, 19.4326],
      url: "/restaurants/rest-001",
    },
    {
      id: "loc-002",
      name: "Mercado Verde",
      address: "Col. Roma Norte",
      type: "market",
      rating: 4.3,
      coordinates: [-99.1568, 19.4194],
      url: "/markets/mkt-001",
    },
    {
      id: "loc-003",
      name: "Dra. Ana López",
      address: "Av. Reforma 100",
      type: "doctor",
      rating: 4.9,
      coordinates: [-99.1676, 19.4284],
      url: "/doctors/doc-001",
    },
  ];

  await page.route(`${API}/locations*`, (route) => route.fulfill(jsonResponse(locations)));

  await page.route(`${API}/nearby*`, (route) => route.fulfill(jsonResponse(locations)));
}

/* ---------- Phase 5: Reviews & Ratings mocks ---------- */

export const mockReviewFull = {
  _id: "rev-001",
  rating: 5,
  comment: "Excelente lugar, totalmente recomendado para veganos",
  user: { _id: "e2e-user-001", username: "e2euser", photo: "" },
  resourceType: "restaurant" as const,
  resourceId: "rest-001",
  helpful: [] as string[],
  helpfulCount: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/** Mock GET /api/v1/restaurants/{id}/reviews - returns list of reviews */
export async function mockRestaurantReviews(page: Page, count = 3) {
  const reviews = Array.from({ length: count }, (_, i) => ({
    ...mockReviewFull,
    _id: `rev-${String(i + 1).padStart(3, "0")}`,
    rating: 5 - (i % 5),
    comment: `Review ${i + 1}: Experiencia ${i === 0 ? "excelente" : i === 1 ? "muy buena" : "buena"} en el restaurante.`,
    user: { _id: `user-${i + 1}`, username: `usuario${i + 1}`, photo: "" },
  }));

  await page.route(`${API}/restaurants/*/reviews*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(
        jsonResponse({ reviews, total: count, page: 1, limit: 10, hasMore: false })
      );
    }
    return route.continue();
  });
}

/** Mock GET /api/v1/restaurants/{id}/reviews/stats - review statistics */
export async function mockReviewStats(page: Page) {
  await page.route(`${API}/restaurants/*/reviews/stats*`, (route) =>
    route.fulfill(
      jsonResponse({
        averageRating: 4.5,
        totalReviews: 12,
        helpfulVotes: 24,
        distribution: { 5: 6, 4: 3, 3: 2, 2: 1, 1: 0 },
      })
    )
  );

  // Also mock for other resource types
  await page.route(`${API}/recipes/*/reviews/stats*`, (route) =>
    route.fulfill(
      jsonResponse({
        averageRating: 4.8,
        totalReviews: 10,
        helpfulVotes: 18,
        distribution: { 5: 7, 4: 2, 3: 1, 2: 0, 1: 0 },
      })
    )
  );

  await page.route(`${API}/markets/*/reviews/stats*`, (route) =>
    route.fulfill(
      jsonResponse({
        averageRating: 4.3,
        totalReviews: 6,
        helpfulVotes: 8,
        distribution: { 5: 3, 4: 2, 3: 1, 2: 0, 1: 0 },
      })
    )
  );

  await page.route(`${API}/doctors/*/reviews/stats*`, (route) =>
    route.fulfill(
      jsonResponse({
        averageRating: 4.9,
        totalReviews: 8,
        helpfulVotes: 15,
        distribution: { 5: 7, 4: 1, 3: 0, 2: 0, 1: 0 },
      })
    )
  );
}

/** Mock POST /api/v1/restaurants/{id}/reviews - create restaurant review */
export async function mockRestaurantReviewCreate(page: Page) {
  await page.route(`${API}/restaurants/*/reviews`, (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill(jsonResponse({ ...mockReviewFull, _id: "rev-new-001" }, 201));
    }
    return route.continue();
  });
}

/** Mock PUT /api/v1/reviews/{id} - update any review */
export async function mockReviewUpdate(page: Page) {
  await page.route(`${API}/reviews/*`, (route) => {
    if (route.request().method() === "PUT") {
      return route.fulfill(
        jsonResponse({
          ...mockReviewFull,
          comment: "Updated review comment",
          updatedAt: new Date().toISOString(),
        })
      );
    }
    return route.continue();
  });
}

/** Mock DELETE /api/v1/reviews/{id} - delete a review */
export async function mockReviewDelete(page: Page) {
  await page.route(`${API}/reviews/*`, (route) => {
    if (route.request().method() === "DELETE") {
      return route.fulfill(jsonResponse({ message: "Review eliminada correctamente" }));
    }
    return route.continue();
  });
}

/** Mock POST/DELETE /api/v1/reviews/{id}/helpful - toggle helpful vote */
export async function mockReviewHelpful(page: Page) {
  await page.route(`${API}/reviews/*/helpful*`, (route) => {
    const method = route.request().method();
    if (method === "POST") {
      return route.fulfill(jsonResponse({ helpfulCount: 4, userVoted: true }));
    }
    if (method === "DELETE") {
      return route.fulfill(jsonResponse({ helpfulCount: 3, userVoted: false }));
    }
    return route.continue();
  });
}

/** Mock GET /api/v1/reviews/page - admin reviews management page */
export async function mockAllReviews(page: Page, count = 5) {
  const reviews = Array.from({ length: count }, (_, i) => ({
    ...mockReviewFull,
    _id: `rev-${String(i + 1).padStart(3, "0")}`,
    resourceType: (["restaurant", "recipe", "market", "doctor", "restaurant"] as const)[i],
    rating: 5 - (i % 5),
  }));

  await page.route(`${API}/reviews*`, (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill(jsonResponse({ reviews, total: count, page: 1, limit: 10 }));
    }
    return route.continue();
  });
}

/* ---------- Block all unknown API calls (safety net) ---------- */

export async function blockUnmockedApis(page: Page) {
  await page.route(`${API}/**`, (route) => {
    const url = new URL(route.request().url());
    console.warn(`[E2E] Unmocked API call: ${route.request().method()} ${url.pathname}`);
    return route.fulfill(errorResponse("E2E: endpoint not mocked", 503));
  });
}
