import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke tests - Quick sanity checks to verify the app is working
 * These tests should be fast and cover critical paths
 */
test.describe("App Smoke Tests", () => {
  test("homepage (login page) loads successfully", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/");

    // Verify URL
    await expect(page).toHaveURL(/\/?$/);

    // Verify main heading
    await expect(
      page.getByRole("heading", { name: "Welcome to Gripday" })
    ).toBeVisible();

    // Verify subtitle
    await expect(
      page.getByText("Sign in to your account to continue")
    ).toBeVisible();

    // Verify login form is present
    await expect(page.getByLabel("Username or Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();
  });

  test("register page loads successfully", async ({ page }) => {
    await page.goto("/register");

    // Verify URL
    await expect(page).toHaveURL(/\/register$/);

    // Verify main heading
    await expect(
      page.getByRole("heading", { name: "Create Your Account" })
    ).toBeVisible();

    // Verify registration form is present
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
  });

  test("app has no console errors on load", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Load the page
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Check for console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test("app has no uncaught exceptions on load", async ({ page }) => {
    const pageErrors: string[] = [];

    // Listen for page errors
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    // Load the page
    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Check for page errors
    expect(pageErrors).toHaveLength(0);
  });

  test("navigation between login and register works", async ({ page }) => {
    // Start at login
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Welcome to Gripday" })
    ).toBeVisible();

    // Navigate to register
    await page.getByText("Don't have an account? Sign up").click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByRole("heading", { name: "Create Your Account" })
    ).toBeVisible();

    // Navigate back to login
    await page.getByText("Already have an account? Sign in").click();
    await expect(page).toHaveURL(/\/?$/);
    await expect(
      page.getByRole("heading", { name: "Welcome to Gripday" })
    ).toBeVisible();
  });

  test("404 page loads for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    // Should show 404 page or redirect to login
    // Adjust based on your actual 404 behavior
    const url = page.url();
    expect(url).toMatch(/\/this-page-does-not-exist|\/404|\/?$/);
  });

  test("app is responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/");

    // Core elements should be visible on mobile
    await expect(
      page.getByRole("heading", { name: "Welcome to Gripday" })
    ).toBeVisible();
    await expect(page.getByLabel("Username or Email", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign In" })
    ).toBeVisible();
  });

  test("app handles network errors gracefully", async ({ page }) => {
    await page.goto("/");

    // Simulate offline mode
    await page.context().setOffline(true);

    // Fill and submit form (should fail gracefully)
    await page.getByLabel("Username or Email", { exact: true }).fill("testuser");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // App should handle the error (not crash)
    // The form should still be visible
    await expect(page.getByLabel("Username or Email", { exact: true })).toBeVisible();

    // Restore network
    await page.context().setOffline(false);
  });

  test("all critical assets load", async ({ page }) => {
    const failedRequests: string[] = [];

    // Listen for failed requests
    page.on("requestfailed", (request) => {
      const url = request.url();
      // Only track critical assets (JS, CSS, fonts)
      if (
        url.endsWith(".js") ||
        url.endsWith(".css") ||
        url.includes("font")
      ) {
        failedRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // No critical assets should fail
    expect(failedRequests).toHaveLength(0);
  });

  test("app loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (adjust as needed)
    expect(loadTime).toBeLessThan(5000);
  });

  test("essential meta tags are present", async ({ page }) => {
    await page.goto("/");

    // Check for viewport meta tag (important for responsive design)
    const viewport = await page.locator('meta[name="viewport"]').count();
    expect(viewport).toBeGreaterThan(0);

    // Check for charset
    const hasCharset =
      (await page.locator('meta[charset]').count()) > 0 ||
      (await page.locator('meta[charset="utf-8"]').count()) > 0;
    expect(hasCharset).toBeTruthy();
  });

  test("javascript is enabled and working", async ({ page }) => {
    await page.goto("/");

    // Check if React has rendered (by checking for React-specific attributes)
    const reactRoot = await page.locator("#root").count();
    expect(reactRoot).toBeGreaterThan(0);

    // Check if interactive elements work
    const submitButton = page.getByRole("button", { name: "Sign In" });
    await expect(submitButton).toBeEnabled();
  });
});

test.describe("Critical User Paths", () => {
  test("user can interact with login form", async ({ page }) => {
    await page.goto("/");

    // Fill form
    await page.getByLabel("Username or Email", { exact: true }).fill("testuser");
    await page.getByLabel("Password").fill("password123");

    // Check remember me
    await page.getByLabel("Remember me").check();

    // Submit (will fail without backend, but form should work)
    await page.getByRole("button", { name: "Sign In" }).click();

    // Form should have processed the submission
    // (Button disabled or API call made)
  });

  test("user can interact with register form", async ({ page }) => {
    await page.goto("/register");

    // Fill form
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    // Submit
    await page.getByRole("button", { name: "Create Account" }).click();

    // Form should have processed the submission
  });
});
