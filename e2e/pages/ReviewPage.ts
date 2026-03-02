import { Page, Locator } from "@playwright/test";

/**
 * Page Object for Review pages (/reviews admin page and embedded review system)
 * Handles the review form, review cards, review stats, and review management page
 */
export class ReviewPage {
  readonly page: Page;

  // -- Review form --
  readonly commentInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly ratingStars: Locator;
  readonly formErrors: Locator;
  readonly charCounter: Locator;

  // -- Review list/display --
  readonly reviewCards: Locator;
  readonly reviewSection: Locator;
  readonly emptyState: Locator;
  readonly avgRating: Locator;

  // -- Review management page --
  readonly heading: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // Review form
    this.commentInput = page.locator("#comment");
    this.submitButton = page.getByRole("button", {
      name: /Publicar Review|Actualizar Review/i,
    });
    this.cancelButton = page.getByRole("button", { name: /Cancelar/i });
    // Star buttons inside the rating section of the form — type="button" within the flex row
    this.ratingStars = page.locator('form button[type="button"]').filter({
      has: page.locator("svg"),
    });
    // Inline error paragraphs rendered below each form field
    this.formErrors = page.locator("form p.text-red-600, form span.text-red-600");
    // Character counter shown beneath the comment textarea
    this.charCounter = page.locator("text=/\\d+\\/500 caracteres/");

    // Review list/display
    // Both compact and full cards use article[aria-label*="Reseña de"]
    this.reviewCards = page.locator('article[aria-label*="Reseña de"]');
    // The section or container wrapping the whole review system
    this.reviewSection = page.locator(
      '[class*="review"], section:has(article[aria-label*="Reseña de"])'
    );
    // Empty state message shown when a resource has no reviews yet
    this.emptyState = page.locator(
      'text=/No hay reviews aún/i, [class*="empty"]:has-text("review")'
    );
    // Average rating number displayed in the stats card (text-3xl font-bold)
    this.avgRating = page.locator(".text-3xl.font-bold").first();

    // Review management page (/reviews)
    this.heading = page.locator("h1");
    this.searchInput = page.locator('input[placeholder*="Buscar"]');
  }

  /** Navigate to the admin review management page */
  async gotoReviews() {
    await this.page.goto("/reviews");
  }

  /**
   * Click the nth star button (1–5) inside the review form.
   * Uses nth(index - 1) so callers pass a natural 1-based value.
   */
  async fillRating(stars: 1 | 2 | 3 | 4 | 5) {
    await this.ratingStars.nth(stars - 1).click();
  }

  /** Fill the comment textarea */
  async fillComment(text: string) {
    await this.commentInput.fill(text);
  }

  /** Click the submit button ("Publicar Review" or "Actualizar Review") */
  async submitReview() {
    await this.submitButton.click();
  }

  /** Click the cancel button */
  async cancelReview() {
    await this.cancelButton.click();
  }

  /** Return the number of review cards currently visible on the page */
  async getReviewCount(): Promise<number> {
    return await this.reviewCards.count();
  }

  /** Return the comment text of the first review card */
  async getFirstReviewText(): Promise<string> {
    const firstCard = this.reviewCards.first();
    const comment = firstCard.locator("p.whitespace-pre-wrap");
    return (await comment.textContent()) ?? "";
  }

  /** Return true when the review form is visible on the page */
  async hasReviewForm(): Promise<boolean> {
    const form = this.page.locator("form:has(#comment)");
    return await form.isVisible();
  }

  /** Return true when at least one review card is present */
  async hasReviewList(): Promise<boolean> {
    return (await this.reviewCards.count()) > 0;
  }

  /** Return true when the "No hay reviews aún" empty state is visible */
  async hasEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  /** Return true when the page body contains meaningful content (> 50 chars) */
  async hasContent(): Promise<boolean> {
    return ((await this.page.locator("body").textContent())?.length ?? 0) > 50;
  }

  /** Return the text of the page's h1 heading */
  async getHeadingText(): Promise<string> {
    return (await this.heading.first().textContent()) ?? "";
  }

  /**
   * Open the options dropdown on a review card by index and click "Editar".
   * index is 0-based.
   */
  async clickEditOnReview(index: number) {
    const card = this.reviewCards.nth(index);
    const trigger = card.locator('button[aria-label*="Opciones para la reseña"]');
    await trigger.click();
    await this.page.getByRole("menuitem", { name: /Editar/i }).click();
  }

  /**
   * Open the options dropdown on a review card by index and click "Eliminar".
   * index is 0-based.
   */
  async clickDeleteOnReview(index: number) {
    const card = this.reviewCards.nth(index);
    const trigger = card.locator('button[aria-label*="Opciones para la reseña"]');
    await trigger.click();
    await this.page.getByRole("menuitem", { name: /Eliminar/i }).click();
  }
}
