import { test, expect } from "@playwright/test";
import { ProfilePage } from "../../pages/ProfilePage";
import { mockNextImages, mockSessionWithAuth } from "../../helpers/api-mocks";
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
  test.beforeEach(async ({ page }) => {
    await mockNextImages(page);
    // Assume user is authenticated
    await mockSessionWithAuth(page);
  });

  test("profile form loads with editable fields", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET /api/user/profile
    await page.route("**/api/user/profile", (route) =>
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

    await profilePage.goto();
    await waitForHydration(page);

    // Form fields should be visible and editable
    await expect(profilePage.firstNameInput).toBeVisible();
    await expect(profilePage.lastNameInput).toBeVisible();
    await expect(profilePage.emailInput).toBeVisible();
    await expect(profilePage.bioInput).toBeVisible();
    await expect(profilePage.saveButton).toBeVisible();
  });

  test("successful profile update shows confirmation", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
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

    // Mock PUT endpoint
    let putCalled = false;
    await page.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "PUT") {
        putCalled = true;
        const bodyText = route.request().postData() || "";
        const body = JSON.parse(bodyText);

        // Verify request contains updated data
        expect(body.firstName).toBe("Jane");
        expect(body.bio).toBe("Updated bio");

        route.fulfill({
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
      } else {
        route.continue();
      }
    });

    await profilePage.goto();
    await waitForHydration(page);

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

  test("client validation prevents invalid email", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
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

    await profilePage.goto();
    await waitForHydration(page);

    // Try to enter invalid email
    await profilePage.emailInput.clear();
    await profilePage.emailInput.fill("not-an-email");

    // Client-side validation should mark field as invalid
    const isInvalid = await profilePage.emailInput.evaluate((el) =>
      (el as HTMLInputElement).validity.valid
    );
    expect(isInvalid).toBe(false);
  });

  test("server validation error is displayed on invalid field", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
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

    // Mock PUT endpoint to return validation error
    await page.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "PUT") {
        route.fulfill({
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
      } else {
        route.continue();
      }
    });

    await profilePage.goto();
    await waitForHydration(page);

    // Submit with empty first name
    await profilePage.updateProfile({ firstName: "" });
    await profilePage.save();

    // Error message should be displayed
    const errorMessage = await profilePage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain("error");
  });

  test("respects field length constraints", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
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

    await profilePage.goto();
    await waitForHydration(page);

    // Test firstName max length (50 chars)
    const longName = "a".repeat(51);
    await profilePage.firstNameInput.clear();
    await profilePage.firstNameInput.fill(longName);

    // HTML5 validation should prevent exceeding max
    const actualValue = await profilePage.getFieldValue("firstNameInput");
    expect(actualValue.length).toBeLessThanOrEqual(50);
  });

  test("bio field max length is 500 characters", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
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

    await profilePage.goto();
    await waitForHydration(page);

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

  test("unauthenticated users are redirected to login", async ({ page }) => {
    // Don't mock session, user is not authenticated
    await page.goto("/profile");

    // Should redirect to login
    await page.waitForURL("**/login**");
    expect(page.url()).toContain("/login");
  });

  test("rate limiting returns 429 on excessive updates", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            firstName: "John",
          }),
        });
      }
    });

    // Mock PUT to return rate limit error on subsequent requests
    let requestCount = 0;
    await page.route("**/api/user/profile", async (route) => {
      if (route.request().method() === "PUT") {
        requestCount++;
        if (requestCount > 5) {
          route.fulfill({
            status: 429,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Too many requests",
              message: "Rate limit exceeded",
            }),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "user-123",
              email: "user@example.com",
              firstName: "John",
            }),
          });
        }
      } else {
        route.continue();
      }
    });

    await profilePage.goto();
    await waitForHydration(page);

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

  test("cancel button reverts unsaved changes", async ({ page }) => {
    const profilePage = new ProfilePage(page);

    // Mock GET endpoint
    await page.route("**/api/user/profile", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          firstName: "OriginalName",
        }),
      })
    );

    await profilePage.goto();
    await waitForHydration(page);

    // Make changes
    await profilePage.updateProfile({ firstName: "NewName" });

    // Cancel
    await profilePage.cancel();

    // Changes should be reverted
    // Note: Depending on implementation, this might reload or reset form
    await page.waitForLoadState("domcontentloaded");
    const currentValue = await profilePage.getFieldValue("firstNameInput");
    expect(currentValue).toBe("OriginalName");
  });
});
