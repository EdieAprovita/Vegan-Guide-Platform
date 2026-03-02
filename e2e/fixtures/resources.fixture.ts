import { Page } from "@playwright/test";
import { test as base } from "./auth.fixture";
import {
  mockNextImages,
  mockGoogleMaps,
  mockRestaurantList,
  mockRestaurantDetail,
  mockRestaurantCreate,
  mockRecipeList,
  mockRecipeDetail,
  mockRecipeCreate,
  mockDoctorList,
  mockDoctorDetail,
  mockDoctorCreate,
  mockMarketList,
  mockMarketDetail,
  mockMarketCreate,
} from "../helpers/api-mocks";

/* ------------------------------------------------------------------ */
/*  Resource fixtures — authenticated pages with resource API mocks   */
/*                                                                     */
/*  Usage:                                                             */
/*    import { test } from "../fixtures/resources.fixture";            */
/*    test("my test", async ({ restaurantPage }) => { ... });          */
/*                                                                     */
/*  IMPORTANT: Each fixture reuses the same underlying authedPage.    */
/*  Do NOT destructure multiple resource fixtures in the same test    */
/*  (e.g. { restaurantPage, doctorPage }) — their route mocks will   */
/*  overlap on the shared page and cause cross-contamination.         */
/* ------------------------------------------------------------------ */

type ResourceFixtures = {
  /** Authenticated page with restaurant mocks set up */
  restaurantPage: Page;
  /** Authenticated page with recipe mocks set up */
  recipePage: Page;
  /** Authenticated page with doctor mocks set up */
  doctorPage: Page;
  /** Authenticated page with market mocks set up */
  marketPage: Page;
};

export const test = base.extend<ResourceFixtures>({
  restaurantPage: async ({ authedPage }, use) => {
    await mockNextImages(authedPage);
    await mockGoogleMaps(authedPage);
    await mockRestaurantList(authedPage);
    await mockRestaurantDetail(authedPage);
    await mockRestaurantCreate(authedPage);
    await use(authedPage);
  },

  recipePage: async ({ authedPage }, use) => {
    await mockNextImages(authedPage);
    await mockGoogleMaps(authedPage);
    await mockRecipeList(authedPage);
    await mockRecipeDetail(authedPage);
    await mockRecipeCreate(authedPage);
    await use(authedPage);
  },

  doctorPage: async ({ authedPage }, use) => {
    await mockNextImages(authedPage);
    await mockGoogleMaps(authedPage);
    await mockDoctorList(authedPage);
    await mockDoctorDetail(authedPage);
    await mockDoctorCreate(authedPage);
    await use(authedPage);
  },

  marketPage: async ({ authedPage }, use) => {
    await mockNextImages(authedPage);
    await mockGoogleMaps(authedPage);
    await mockMarketList(authedPage);
    await mockMarketDetail(authedPage);
    await mockMarketCreate(authedPage);
    await use(authedPage);
  },
});

export { expect } from "@playwright/test";
