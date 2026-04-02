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
      return (await this.errorMessage.textContent()) ?? "";
    } catch {
      return "";
    }
  }

  /**
   * Check for field-level validation errors.
   *
   * Shadcn FormMessage renders as <p> elements (not role="alert"), so we
   * query by the explicit IDs set on each FormMessage and fall back to
   * generic aria/class selectors for toast and other error surfaces.
   *
   * Waits up to 2s for any error element to appear (React async re-render)
   * before collecting all errors.
   */
  async getFieldErrors(): Promise<string[]> {
    // Wait for React to re-render with validation errors after submit
    const waitSelectors = [
      "#register-confirm-password-error",
      "#register-password-error",
      "#register-username-error",
      "[role='alert']",
      "[data-type='error']",
    ];

    // Try to wait for at least one error element to appear
    for (const sel of waitSelectors) {
      try {
        await this.page.locator(sel).first().waitFor({ state: "visible", timeout: 3000 });
        break; // Found one — proceed to collect all
      } catch {
        // Not found yet — try next selector
      }
    }

    const errorSelectors = [
      // Shadcn FormMessage elements — matched by the id= props in register-form.tsx
      "#register-username-error",
      "#register-email-error",
      "#register-password-error",
      "#register-confirm-password-error",
      "#register-role-error",
      // ARIA live regions and alert roles (toast, server errors)
      "[role='alert']",
      "[aria-live='polite']",
      // Sonner error toast
      "[data-type='error']",
      // Tailwind destructive / rose utility classes used by Shadcn
      ".text-rose-500:not(span)",
      ".text-destructive",
    ];

    const errors: string[] = [];
    const seen = new Set<string>();

    for (const selector of errorSelectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        for (let i = 0; i < count; i++) {
          const text = await elements
            .nth(i)
            .textContent()
            .catch(() => "");
          const trimmed = text?.trim() ?? "";
          if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            errors.push(trimmed);
          }
        }
      } catch {
        // Selector unsupported in this context — continue to next
      }
    }

    return errors;
  }

  /**
   * Check if register button is disabled.
   *
   * The button is only disabled while the form is submitting (isLoading).
   * After client-side validation errors it remains enabled, so we catch
   * any locator errors and default to false.
   */
  async isRegisterButtonDisabled(): Promise<boolean> {
    return await this.registerButton.isDisabled().catch(() => false);
  }

  /**
   * Click login link to go back to /login
   */
  async clickLoginLink() {
    await this.loginLink.click();
  }
}
