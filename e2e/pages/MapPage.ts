import { Page, Locator } from "@playwright/test";

/**
 * Page Object for the Map page (/map)
 * Handles the map container, sidebar panel, filters, and location list
 */
export class MapPage {
  readonly page: Page;

  // -- Map page elements --
  readonly heading: Locator;
  readonly mapContainer: Locator;
  readonly sidebar: Locator;
  readonly searchInput: Locator;
  readonly filterCheckboxes: Locator;
  readonly locationList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.locator("h1");
    this.mapContainer = page.locator('[class*="map"], #map, [data-testid="map"]');
    this.sidebar = page.locator('[class*="sidebar"], [class*="panel"], aside');
    this.searchInput = page.locator(
      'input[type="search"], input[placeholder*="earch"], input[placeholder*="uscar"]'
    );
    this.filterCheckboxes = page.locator(
      'input[type="checkbox"], [role="checkbox"]'
    );
    this.locationList = page.locator(
      '[class*="location-list"], [class*="result"]'
    );
  }

  /** Navigate to the map page */
  async gotoMap() {
    await this.page.goto("/map");
  }

  /** Check if the map container element exists in the DOM */
  async hasMapContainer(): Promise<boolean> {
    return (await this.mapContainer.count()) > 0;
  }

  /** Check if the sidebar panel exists in the DOM */
  async hasSidebar(): Promise<boolean> {
    return (await this.sidebar.count()) > 0;
  }

  /** Check if the page has loaded with content */
  async hasContent(): Promise<boolean> {
    return ((await this.page.locator("body").textContent())?.length ?? 0) > 50;
  }

  /** Get the page title/heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.first().textContent()) ?? "";
  }

  /** Fill the sidebar search input and submit */
  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchInput.press("Enter");
  }
}
