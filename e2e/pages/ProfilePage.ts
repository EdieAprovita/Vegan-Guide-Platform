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

    // Messages
    this.successMessage = page.getByRole("alert");
    this.errorMessage = page.getByRole("alert");
  }

  /**
   * Navigate to profile settings page
   */
  async goto() {
    await this.page.goto("/profile");
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
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    try {
      await this.successMessage.waitFor({ state: "visible", timeout: 3000 });
      return await this.successMessage.textContent() ?? "";
    } catch {
      return "";
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return await this.errorMessage.textContent() ?? "";
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
