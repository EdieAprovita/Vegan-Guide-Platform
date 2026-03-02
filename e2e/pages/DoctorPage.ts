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

    this.specialtyFilter = page.locator(
      '[id*="specialty"], select:has(option[value*="specialty"]), select:has(option[value*="cardio"])',
    );
    this.ratingFilter = page.locator(
      '[id*="rating"], select:has(option[value*="rating"]), select:has(option[value*="4"])',
    );
    this.addDoctorButton = page.getByRole("button", {
      name: /add doctor|agregar doctor/i,
    });
  }

  /** Check if any cards have a specialty badge displayed */
  async hasSpecialtyBadges(): Promise<boolean> {
    const badges = this.page.locator(
      '[aria-label*="specialty"], [class*="badge"][class*="specialty"], [data-testid*="specialty"]',
    );
    return (await badges.count()) > 0;
  }
}
