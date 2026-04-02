import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object for /login route
 * Encapsulates all interactions with the login form
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Selectors based on actual HTML structure
    // Using IDs for stability
    this.emailInput = page.locator("#login-email");
    this.passwordInput = page.locator("#login-password");
    this.loginButton = page.getByRole("button", { name: /sign in/i });
    this.errorMessage = page.getByRole("alert");
    this.registerLink = page.getByRole("button", { name: /sign up here/i });
    this.forgotPasswordLink = page.getByRole("button", { name: /forgot your password/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Fill email and password, then click login
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Get error message text if present
   */
  async getErrorMessage(): Promise<string> {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return (await this.errorMessage.textContent()) ?? "";
    } catch {
      return "";
    }
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const invalidElements = this.page.locator("[aria-invalid='true']");
    return (await invalidElements.count()) > 0;
  }

  /**
   * Click register link to navigate to /register
   */
  async clickRegisterLink() {
    await this.registerLink.click();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink() {
    await this.forgotPasswordLink.click();
  }
}
