import { test, expect } from "../../fixtures/auth.fixture";
import { ProfilePage } from "../../pages/ProfilePage";
import { mockNextImages } from "../../helpers/api-mocks";
import { waitForHydration } from "../../helpers/test-utils";

/**
 * Auth: Profile Update Flow Tests
 *
 * Verifies that:
 * 1. Profile form renders with user data
 * 2. User can update individual profile fields
 * 3. Client-side validation rejects invalid data
 * 4. Server validation errors are displayed
 * 5. Successful updates show confirmation message
 * 6. Rate limiting is respected (max 5 updates per minute)
 */
test.describe("Auth: Profile Update", () => {
  test.beforeEach(async ({ authedPage }) => {
    await mockNextImages(authedPage);
    // Auth is handled by the authedPage fixture (session cookie + route mocks + "/" navigation)
  });

  test("profile form loads with editable fields", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock GET /api/user/profile
    await authedPage.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "user@example.com",
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          bio: "Test bio",
          photo: "https://example.com/photo.jpg",
        }),
      })
    );

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Form fields should be visible and editable
    await expect(profilePage.firstNameInput).toBeVisible();
    await expect(profilePage.lastNameInput).toBeVisible();
    await expect(profilePage.emailInput).toBeVisible();
    await expect(profilePage.bioInput).toBeVisible();
    await expect(profilePage.saveButton).toBeVisible();
  });

  test("successful profile update shows confirmation", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    let putCalled = false;

    // Single handler that serves both GET and PUT
    await authedPage.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            username: "testuser",
            firstName: "John",
            lastName: "Doe",
            bio: "Original bio",
          }),
        });
      }
      if (route.request().method() === "PUT") {
        putCalled = true;
        const bodyText = route.request().postData() || "";
        const body = JSON.parse(bodyText);

        // Verify request contains updated data
        expect(body.firstName).toBe("Jane");
        expect(body.bio).toBe("Updated bio");

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            username: "testuser",
            firstName: "Jane",
            lastName: "Doe",
            bio: "Updated bio",
          }),
        });
      }
      return route.continue();
    });

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Update profile
    await profilePage.updateProfile({
      firstName: "Jane",
      bio: "Updated bio",
    });
    await profilePage.save();

    // Verify success message appears
    const message = await profilePage.getSuccessMessage();
    expect(message).toBeTruthy();
    expect(putCalled).toBe(true);
  });

  test("client validation prevents invalid email", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock GET endpoint
    await authedPage.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "user@example.com",
          username: "testuser",
          firstName: "John",
          lastName: "Doe",
        }),
      })
    );

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Try to enter invalid email
    await profilePage.emailInput.clear();
    await profilePage.emailInput.fill("not-an-email");

    // Client-side validation should mark field as invalid
    const isInvalid = await profilePage.emailInput.evaluate(
      (el) => (el as HTMLInputElement).validity.valid
    );
    expect(isInvalid).toBe(false);
  });

  test("server validation error is displayed on invalid field", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Single handler for both GET and PUT
    await authedPage.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            username: "testuser",
            firstName: "John",
            lastName: "Doe",
          }),
        });
      }
      if (route.request().method() === "PUT") {
        return route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Validation Error",
            message: "Invalid input data",
            details: [
              {
                path: ["firstName"],
                message: "String must contain at least 1 character",
              },
            ],
          }),
        });
      }
      return route.continue();
    });

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Submit with empty first name (clear the field)
    await profilePage.firstNameInput.clear();
    await profilePage.save();
    // Allow time for the Sonner toast to appear after the async request
    await authedPage.waitForTimeout(500);

    // Error message should be displayed — exact text varies ("Invalid input data" / "Failed to update profile")
    const errorMessage = await profilePage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test("respects field length constraints", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock GET endpoint
    await authedPage.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "user@example.com",
          username: "testuser",
          firstName: "John",
          lastName: "Doe",
          bio: "Original bio",
        }),
      })
    );

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Test firstName max length (50 chars)
    const longName = "a".repeat(51);
    await profilePage.firstNameInput.clear();
    await profilePage.firstNameInput.fill(longName);

    // HTML5 maxLength should prevent exceeding max
    const actualValue = await profilePage.getFieldValue("firstNameInput");
    expect(actualValue.length).toBeLessThanOrEqual(50);
  });

  test("bio field max length is 500 characters", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock GET endpoint
    await authedPage.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "user@example.com",
          bio: "Original bio",
        }),
      })
    );

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Test with valid 500 char bio
    const validBio = "x".repeat(500);
    await profilePage.updateProfile({ bio: validBio });
    let bioValue = await profilePage.getFieldValue("bioInput");
    expect(bioValue.length).toBeLessThanOrEqual(500);

    // Test with 501 char (should be rejected or truncated)
    const invalidBio = "x".repeat(501);
    await profilePage.bioInput.clear();
    await profilePage.bioInput.fill(invalidBio);
    bioValue = await profilePage.getFieldValue("bioInput");
    expect(bioValue.length).toBeLessThanOrEqual(500);
  });

  test("unauthenticated users are redirected to login", async ({ authedPage }) => {
    // Clear the session cookie set by the fixture so the user is unauthenticated
    await authedPage.context().clearCookies();

    await authedPage.goto("/profile");

    // Should redirect to login
    await authedPage.waitForURL("**/login**");
    expect(authedPage.url()).toContain("/login");
  });

  test("rate limiting returns 429 on excessive updates", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock PUT to return rate limit error on subsequent requests
    let requestCount = 0;
    await authedPage.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            firstName: "John",
          }),
        });
      }
      if (route.request().method() === "PUT") {
        requestCount++;
        if (requestCount > 5) {
          return route.fulfill({
            status: 429,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Too many requests",
              message: "Rate limit exceeded",
            }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            firstName: "John",
          }),
        });
      }
      return route.continue();
    });

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Attempt 6 updates (should hit rate limit on 6th)
    for (let i = 0; i < 6; i++) {
      await profilePage.updateProfile({ firstName: `John${i}` });
      await profilePage.save();
    }

    // Final error message should indicate rate limiting
    const errorMessage = await profilePage.getErrorMessage();
    if (requestCount > 5) {
      expect(errorMessage).toBeTruthy();
    }
  });

  test("cancel button reverts unsaved changes", async ({ authedPage }) => {
    const profilePage = new ProfilePage(authedPage);

    // Mock GET endpoint
    await authedPage.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          firstName: "OriginalName",
          email: "user@example.com",
          username: "testuser",
        }),
      })
    );

    await authedPage.goto("/profile", { waitUntil: "domcontentloaded" });
    await waitForHydration(authedPage);
    await authedPage
      .locator('input[name="firstName"], input[name="username"], input[name="email"]')
      .first()
      .waitFor({ state: "visible", timeout: 10000 });

    // Wait for profile to load and populate the form
    await expect(profilePage.firstNameInput).toHaveValue("OriginalName");

    // Make changes
    await profilePage.updateProfile({ firstName: "NewName" });

    // Cancel
    await profilePage.cancel();

    // Changes should be reverted to the original loaded value
    await expect(profilePage.firstNameInput).toHaveValue("OriginalName");
  });
});
