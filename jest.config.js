const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  maxWorkers: "50%",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    // Hooks (tested)
    "src/hooks/useApiToken.ts",
    "src/hooks/useAuth.ts",
    "src/hooks/useBusinesses.ts",
    "src/hooks/useCache.ts",
    "src/hooks/useDoctors.ts",
    "src/hooks/useGoogleMaps.ts",
    "src/hooks/useMapMarkers.ts",
    "src/hooks/useMarkets.ts",
    "src/hooks/useRecipes.ts",
    "src/hooks/useRestaurants.ts",
    "src/hooks/useReviews.ts",
    "src/hooks/useSanctuaries.ts",
    // Lib (tested)
    "src/lib/api/businesses.ts",
    "src/lib/api/config.ts",
    "src/lib/api/doctors.ts",
    "src/lib/api/markets.ts",
    "src/lib/api/recipes.ts",
    "src/lib/api/restaurants.ts",
    "src/lib/api/reviews.ts",
    "src/lib/api/search.ts",
    "src/lib/api/tokenRefresh.ts",
    "src/lib/contracts/schemas.ts",
    "src/lib/image-utils.ts",
    "src/lib/store/auth.ts",
    "src/lib/utils.ts",
    "src/lib/utils/geospatial.ts",
    "src/lib/validations/auth.ts",
    "src/lib/validations/doctors.ts",
    "src/lib/validations/markets.ts",
    "src/lib/validations/restaurants.ts",
    "src/lib/seo/json-ld.tsx",
    "src/lib/config/maps.ts",
    // Components (tested)
    "src/components/ui/error-fallback.tsx",
    "src/components/features/restaurants/restaurant-card.tsx",
    "src/components/features/recipes/recipe-card.tsx",
    "src/components/features/doctors/doctor-card.tsx",
    "src/components/features/reviews/review-card.tsx",
    "src/components/shared/resource-list/resource-list.tsx",
    // App (tested)
    "src/middleware.ts",
    "src/app/providers.tsx",
    "src/app/not-found.tsx",
    // Exclusions
    "!src/**/__tests__/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    "<rootDir>/src/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  // Shared test helpers — not test suites themselves
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/__tests__/lib/fetch-mocks\\.ts$",
    "<rootDir>/src/__tests__/hooks/store-test-utils\\.ts$",
  ],
};

module.exports = createJestConfig(customJestConfig);
