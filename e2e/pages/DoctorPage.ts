import { Page, Locator } from "@playwright/test";
import { BaseResourcePage } from "./BaseResourcePage";

/**
 * Page Object for Doctor pages (/doctors, /doctors/[id])
 * Handles both list view and detail view interactions
 */
export class DoctorPage extends BaseResourcePage {
  readonly specialtyFilter: Locator;
  readonly ratingFilter: Locator;
  readonly addDoctorButton: Locator;

  constructor(page: Page) {
    super(page, {
      slug: "doctors",
      cardSelector: 'article[aria-label*="Doctor"]',
      extraSearchSelector: 'input[placeholder*="octor"]',
    });

    // Use data-testid for reliable selection; fallback to id-based selection
    this.specialtyFilter = page.locator(
      '[data-testid="specialty-filter"], [id*="specialty"], select[aria-label*="specialty" i]'
    );
    this.ratingFilter = page.locator(
      '[data-testid="rating-filter"], [id*="rating"], select[aria-label*="rating" i]'
    );
    this.addDoctorButton = page.getByRole("button", {
      name: /add doctor|agregar doctor/i,
    });
  }

  /** Check if any cards have a specialty badge displayed */
  async hasSpecialtyBadges(): Promise<boolean> {
    const badges = this.page.locator(
      '[aria-label*="specialty"], [class*="badge"][class*="specialty"], [data-testid*="specialty"]'
    );
    return (await badges.count()) > 0;
  }
}
