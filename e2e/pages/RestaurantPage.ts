import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object for Restaurant pages (/restaurants, /restaurants/[id])
 * Handles both list view and detail view interactions
 */
export class RestaurantPage {
  readonly page: Page;

  // -- List page elements --
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly cards: Locator;
  readonly loadMoreButton: Locator;
  readonly searchButton: Locator;

  // -- Detail page elements --
  readonly backButton: Locator;
  readonly detailContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // List page
    this.heading = page.locator("h1");
    this.searchInput = page.locator('input[type="search"], input[placeholder*="earch"]');
    this.cards = page.locator('article[aria-label*="Restaurante"], article[aria-label*="Restaurant"]');
    this.loadMoreButton = page.getByRole("button", { name: /load more|cargar más|ver más/i });
    this.searchButton = page.getByRole("button", { name: /search|buscar/i });

    // Detail page
    this.backButton = page.locator('button[aria-label*="Volver"], a[aria-label*="Volver"]');
    this.detailContainer = page.locator("main .container, main");
  }

  /** Navigate to the restaurant list */
  async gotoList() {
    await this.page.goto("/restaurants");
  }

  /** Navigate to a specific restaurant detail page */
  async gotoDetail(id: string) {
    await this.page.goto(`/restaurants/${id}`);
  }

  /** Get the count of restaurant cards on the page */
  async getCardCount(): Promise<number> {
    return await this.cards.count();
  }

  /** Get restaurant name from a card by index */
  async getCardName(index: number): Promise<string> {
    const card = this.cards.nth(index);
    const h3 = card.locator("h3");
    return (await h3.textContent()) ?? "";
  }

  /** Click "View Details" on a card by index */
  async clickViewDetails(index: number) {
    const card = this.cards.nth(index);
    const link = card.locator('a[href*="/restaurants/"]');
    if ((await link.count()) > 0) {
      await link.first().click();
    } else {
      const button = card.getByRole("button", { name: /view details|ver detalle/i });
      await button.click();
    }
  }

  /** Perform a search on the list page */
  async search(term: string) {
    await this.searchInput.fill(term);
    // Try clicking search button if it exists
    if ((await this.searchButton.count()) > 0) {
      await this.searchButton.click();
    } else {
      await this.searchInput.press("Enter");
    }
  }

  /** Check if the list page has loaded with content */
  async hasContent(): Promise<boolean> {
    const body = await this.page.locator("body").textContent();
    return (body?.length ?? 0) > 50;
  }

  /** Check if any cards have a rating displayed */
  async hasRatings(): Promise<boolean> {
    const ratingElements = this.page.locator('[aria-label*="rating"], [aria-label*="Rating"]');
    const starIcons = this.page.locator('svg.fill-primary, [class*="star"]');
    return (await ratingElements.count()) > 0 || (await starIcons.count()) > 0;
  }

  /** Get the page title/heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.first().textContent()) ?? "";
  }

  /** Check if detail page has loaded */
  async isDetailPageLoaded(): Promise<boolean> {
    const content = await this.detailContainer.textContent();
    return (content?.length ?? 0) > 20;
  }
}
