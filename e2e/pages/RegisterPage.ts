import { Page, Locator } from "@playwright/test";

/**
 * Page Object for /register route
 * Encapsulates all interactions with the registration form
 */
export class RegisterPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly roleSelect: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form inputs using IDs found on actual page
    this.usernameInput = page.locator("#register-username");
    this.emailInput = page.locator("#register-email");
    this.passwordInput = page.locator("#register-password");
    this.confirmPasswordInput = page.locator("#register-confirm-password");
    this.roleSelect = page.locator("#register-role");

    // Buttons
    this.registerButton = page.getByRole("button", {
      name: /create account/i,
    });
    this.loginLink = page.getByRole("button", { name: /sign in here/i });

    // Messages
    this.errorMessage = page.getByRole("alert");
    this.successMessage = page.getByText(/éxito|success|registrado|creada/i);
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await this.page.goto("/register");
  }

  /**
   * Fill all register form fields
   */
  async fillRegisterForm(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
  }) {
    await this.usernameInput.fill(data.username);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);

    if (data.role) {
      await this.roleSelect.selectOption(data.role);
    }
  }

  /**
   * Submit the registration form
   */
  async submit() {
    await this.registerButton.click();
  }

  /**
   * Perform full registration
   */
  async register(data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
  }) {
    await this.fillRegisterForm(data);
    await this.submit();
  }

  /**
   * Get error message if present
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
   * Check for field-level validation errors
   */
  async getFieldErrors(): Promise<string[]> {
    const errorElements = this.page.locator("[role='alert'], .error, [class*='error']");
    const count = await errorElements.count();
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await errorElements.nth(i).textContent();
      if (text) errors.push(text.trim());
    }

    return errors;
  }

  /**
   * Check if register button is disabled
   */
  async isRegisterButtonDisabled(): Promise<boolean> {
    return await this.registerButton.isDisabled();
  }

  /**
   * Click login link to go back to /login
   */
  async clickLoginLink() {
    await this.loginLink.click();
  }
}
