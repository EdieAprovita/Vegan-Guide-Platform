import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object for profile settings/edit functionality
 * Encapsulates interactions with the profile update form
 */
export class ProfilePage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly bioInput: Locator;
  readonly phoneInput: Locator;
  readonly usernameInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Profile form inputs
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.bioInput = page.locator('textarea[name="bio"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.usernameInput = page.locator('input[name="username"]');

    // Action buttons
    this.saveButton = page.getByRole("button", { name: /save|update|submit/i });
    this.cancelButton = page.getByRole("button", { name: /cancel|close/i });

    // Messages — Sonner toasts + inline field errors
    this.successMessage = page
      .locator('[data-type="success"], [data-sonner-toast][data-type="success"]')
      .or(page.getByText(/updated successfully|profile saved|success/i));
    this.errorMessage = page
      .locator('[data-type="error"], [data-sonner-toast][data-type="error"]')
      .or(page.getByRole("alert"));
  }

  /**
   * Navigate to profile settings page and wait for the form to be ready.
   *
   * NextAuth v5 (beta) with App Router does NOT automatically trigger a
   * /api/auth/session fetch when SessionProvider mounts without an initial
   * `session` prop. To hydrate the client-side session, we must first
   * navigate to "/" (any page) so that useSession() runs in a fully
   * initialized app context. Only then is the session cached in React
   * context, and the /profile page can render the editable form.
   *
   * This mirrors the pattern used in the authedPage fixture
   * (e2e/fixtures/auth.fixture.ts → setupAuthSession), which also
   * navigates to "/" before performing any protected-page tests.
   */
  async goto() {
    // Step 1: Warm up the session by visiting the home page first.
    // useSession() fetches /api/auth/session here and caches the result.
    await this.page.goto("/", { waitUntil: "domcontentloaded" });

    // Step 2: Now navigate to /profile — session is already cached, form renders immediately.
    await this.page.goto("/profile", { waitUntil: "domcontentloaded" });

    // Step 3: Wait for any form input to confirm the form is ready.
    await this.page
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 8000 })
      .catch(() => {
        // Profile might still be loading or auth may have failed — callers will handle
      });
  }

  /**
   * Update profile with partial data
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    phone?: string;
    username?: string;
  }) {
    if (data.firstName) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.email) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }
    if (data.bio !== undefined) {
      await this.bioInput.clear();
      if (data.bio) await this.bioInput.fill(data.bio);
    }
    if (data.phone) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(data.phone);
    }
    if (data.username) {
      await this.usernameInput.clear();
      await this.usernameInput.fill(data.username);
    }
  }

  /**
   * Click save button
   */
  async save() {
    await this.saveButton.click();
  }

  /**
   * Click cancel button
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Get success message text.
   * Tries Sonner toast selectors first, then falls back to role="alert".
   */
  async getSuccessMessage(): Promise<string> {
    const toastSelectors = [
      '[data-type="success"]',
      '[data-sonner-toast][data-type="success"]',
      'li[data-type="success"]',
    ];

    for (const sel of toastSelectors) {
      const el = this.page.locator(sel).first();
      try {
        await el.waitFor({ state: "visible", timeout: 3000 });
        const text = await el.textContent();
        if (text?.trim()) return text.trim();
      } catch {
        // try next selector
      }
    }

    // Fallback: role="alert"
    try {
      await this.page.getByRole("alert").first().waitFor({ state: "visible", timeout: 1000 });
      return (await this.page.getByRole("alert").first().textContent()) ?? "";
    } catch {
      return "";
    }
  }

  /**
   * Get error message text.
   * Tries Sonner error toast selectors first, then falls back to inline role="alert".
   */
  async getErrorMessage(): Promise<string> {
    const errorToastSelectors = [
      '[data-type="error"]',
      '[data-sonner-toast][data-type="error"]',
      'li[data-type="error"]',
    ];

    for (const sel of errorToastSelectors) {
      const el = this.page.locator(sel).first();
      try {
        await el.waitFor({ state: "visible", timeout: 3000 });
        const text = await el.textContent();
        if (text?.trim()) return text.trim();
      } catch {
        // try next selector
      }
    }

    // Fallback: inline field errors with role="alert"
    try {
      await this.page.getByRole("alert").first().waitFor({ state: "visible", timeout: 1000 });
      return (await this.page.getByRole("alert").first().textContent()) ?? "";
    } catch {
      return "";
    }
  }

  /**
   * Check if save button is disabled
   */
  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButton.isDisabled();
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const invalidElements = this.page.locator("[aria-invalid='true']");
    return (await invalidElements.count()) > 0;
  }

  /**
   * Get current value of input field
   */
  async getFieldValue(fieldName: keyof Omit<ProfilePage, "page">): Promise<string> {
    const field = this[fieldName] as Locator;
    return await field.inputValue();
  }
}
