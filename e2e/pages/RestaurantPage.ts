import { Page } from "@playwright/test";
import { BaseResourcePage } from "./BaseResourcePage";

/**
 * Page Object for Restaurant pages (/restaurants, /restaurants/[id])
 * Handles both list view and detail view interactions
 */
export class RestaurantPage extends BaseResourcePage {
  constructor(page: Page) {
    super(page, {
      slug: "restaurants",
      cardSelector: 'article[aria-label*="Restaurante"], article[aria-label*="Restaurant"]',
    });
  }

  /** Check if any cards have a rating displayed */
  async hasRatings(): Promise<boolean> {
    const ratingElements = this.page.locator('[aria-label*="rating"], [aria-label*="Rating"]');
    const starIcons = this.page.locator('svg.fill-primary, [class*="star"]');
    return (await ratingElements.count()) > 0 || (await starIcons.count()) > 0;
  }
}
