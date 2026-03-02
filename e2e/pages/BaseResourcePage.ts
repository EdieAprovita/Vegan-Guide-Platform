import { Page, Locator } from "@playwright/test";

/**
 * Base Page Object for resource pages (restaurants, doctors, markets, recipes).
 *
 * Encapsulates the shared structure: list view (heading, search, cards, load-more)
 * and detail view (back button, detail container). Concrete subclasses only need to
 * supply resource-specific selectors via the `config` parameter.
 */
export interface ResourcePageConfig {
  /** Slug used in URLs, e.g. "restaurants", "doctors" */
  slug: string;
  /** CSS selector for article/card elements on the list page */
  cardSelector: string;
  /** Extra selectors appended to the search input locator (optional) */
  extraSearchSelector?: string;
}

export class BaseResourcePage {
  readonly page: Page;
  readonly slug: string;

  // -- List page elements --
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly cards: Locator;
  readonly loadMoreButton: Locator;
  readonly searchButton: Locator;

  // -- Detail page elements --
  readonly backButton: Locator;
  readonly detailContainer: Locator;

  constructor(page: Page, config: ResourcePageConfig) {
    this.page = page;
    this.slug = config.slug;

    // List page
    this.heading = page.locator("h1");
    const extraSearch = config.extraSearchSelector
      ? `, ${config.extraSearchSelector}`
      : "";
    this.searchInput = page.locator(
      `input[type="search"], input[placeholder*="earch"]${extraSearch}`,
    );
    this.cards = page.locator(config.cardSelector);
    this.loadMoreButton = page.getByRole("button", {
      name: /load more|cargar más|ver más/i,
    });
    // Scope search button to form context to avoid matching unrelated buttons
    this.searchButton = page.locator(
      'form, [role="search"], .search-form',
    ).locator('button:has-text(/search|buscar/i)').first();

    // Detail page
    this.backButton = page.locator(
      'button[aria-label*="Volver"], a[aria-label*="Volver"]',
    );
    this.detailContainer = page.locator("main .container, main");
  }

  /** Navigate to the resource list */
  async gotoList() {
    await this.page.goto(`/${this.slug}`);
  }

  /** Navigate to a specific resource detail page */
  async gotoDetail(id: string) {
    await this.page.goto(`/${this.slug}/${id}`);
  }

  /** Get the count of resource cards on the page */
  async getCardCount(): Promise<number> {
    return await this.cards.count();
  }

  /** Get resource name from a card by index */
  async getCardName(index: number): Promise<string> {
    const card = this.cards.nth(index);
    const h3 = card.locator("h3");
    return (await h3.textContent()) ?? "";
  }

  /** Click "View Details" on a card by index */
  async clickViewDetails(index: number) {
    const card = this.cards.nth(index);
    const link = card.locator(`a[href*="/${this.slug}/"]`);
    if ((await link.count()) > 0) {
      await link.first().click();
    } else {
      const button = card.getByRole("button", {
        name: /view details|ver detalle/i,
      });
      await button.click();
    }
  }

  /** Perform a search on the list page */
  async search(term: string) {
    await this.searchInput.fill(term);
    if ((await this.searchButton.count()) > 0) {
      await this.searchButton.click();
    } else {
      await this.searchInput.press("Enter");
    }
  }

  /** Check if the list page has loaded with content */
  async hasContent(): Promise<boolean> {
    return (
      ((await this.page.locator("body").textContent())?.length ?? 0) > 50
    );
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
