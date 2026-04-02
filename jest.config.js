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
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
    "!src/**/test-*/**",
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 20,
      statements: 20,
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
    "<rootDir>/e2e/",
    "<rootDir>/src/__tests__/lib/fetch-mocks\\.ts$",
    "<rootDir>/src/__tests__/hooks/store-test-utils\\.ts$",
    // Phase-1 refactoring: centralised mock setup and data factories
    "<rootDir>/src/__tests__/setup/mock-components\\.tsx$",
    "<rootDir>/src/__tests__/helpers/test-data-factories\\.ts$",
    "<rootDir>/src/__tests__/helpers/testing-library-with-query\\.tsx$",
  ],
};

module.exports = createJestConfig(customJestConfig);
