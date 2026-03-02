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

    this.productsFilter = page.locator(
      '[id*="product"], select:has(option[value*="product"]), select:has(option[value*="organic"])',
    );
    this.ratingFilter = page.locator(
      '[id*="rating"], select:has(option[value*="rating"]), select:has(option[value*="4"])',
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
