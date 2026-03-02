import { Page, Locator } from "@playwright/test";
import { BaseResourcePage } from "./BaseResourcePage";

/**
 * Page Object for Market pages (/markets, /markets/[id])
 * Handles both list view and detail view interactions
 */
export class MarketPage extends BaseResourcePage {
  readonly productsFilter: Locator;
  readonly ratingFilter: Locator;
  readonly addMarketButton: Locator;

  constructor(page: Page) {
    super(page, {
      slug: "markets",
      cardSelector: 'article[aria-label*="Mercado"]',
      extraSearchSelector: 'input[placeholder*="ercado"]',
    });

    // Use data-testid for reliable selection; fallback to id-based selection
    this.productsFilter = page.locator(
      '[data-testid="products-filter"], [id*="product"], select[aria-label*="product" i]',
    );
    this.ratingFilter = page.locator(
      '[data-testid="rating-filter"], [id*="rating"], select[aria-label*="rating" i]',
    );
    this.addMarketButton = page.getByRole("button", {
      name: /add market|agregar mercado/i,
    });
  }

  /** Check if any cards have product badges displayed */
  async hasProductBadges(): Promise<boolean> {
    const badges = this.page.locator(
      '[aria-label*="product"], [class*="badge"][class*="product"], [data-testid*="product"]',
    );
    return (await badges.count()) > 0;
  }
}
