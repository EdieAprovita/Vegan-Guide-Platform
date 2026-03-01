/**
 * Shared setup helper for Zustand store tests.
 *
 * Usage:
 *   import { setupStoreTest } from "./store-test-utils";
 *
 *   setupStoreTest(useRestaurants, {
 *     restaurants: [],
 *     currentRestaurant: null,
 *     isLoading: false,
 *     error: null,
 *     totalPages: 0,
 *     currentPage: 1,
 *   });
 *
 * The function:
 *   - Resets the store to initialState before every test
 *   - Calls jest.clearAllMocks() before every test
 *   - Suppresses console.error noise during the suite and restores it after
 *   - Returns { resetStore, consoleErrorSpy } for tests that need direct access
 */

export interface StoreTestUtils {
  resetStore: () => void;
  consoleErrorSpy: jest.SpyInstance;
}

export function setupStoreTest<T extends Record<string, unknown>>(
  store: { setState: (state: Partial<T>) => void },
  initialState: T
): StoreTestUtils {
  const resetStore = () => {
    store.setState(initialState);
  };

  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  return { resetStore, consoleErrorSpy };
}
