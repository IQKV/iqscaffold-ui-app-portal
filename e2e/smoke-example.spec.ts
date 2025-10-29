import { test, expect } from "@playwright/test";

/**
 * Example Smoke Test Implementation
 *
 * This file shows concrete examples of how to implement
 * the smoke test template with real assertions.
 * Use this as a reference when customizing your smoke tests.
 */
test.describe("Example Smoke Tests", () => {
  test.skip("homepage loads and shows expected content", async ({ page }) => {
    await page.goto("/");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check page title
    await expect(page).toHaveTitle(/My App/);

    // Check for main navigation
    await expect(page.locator("nav")).toBeVisible();

    // Check for hero section
    await expect(page.locator("h1")).toContainText("Welcome");

    // Verify no 404 or error messages
    await expect(page.locator("text=404")).not.toBeVisible();
    await expect(page.locator("text=Error")).not.toBeVisible();
  });

  test.skip("authentication redirect works", async ({ page }) => {
    // Navigate to protected route
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/login/);

    // Login form should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test.skip("main navigation works", async ({ page }) => {
    await page.goto("/");

    // Click on About link
    await page.click("text=About");
    await expect(page).toHaveURL(/about/);

    // Click on Contact link
    await page.click("text=Contact");
    await expect(page).toHaveURL(/contact/);

    // Go back to home
    await page.click("text=Home");
    await expect(page).toHaveURL(/^\//);
  });

  test.skip("search functionality works", async ({ page }) => {
    await page.goto("/");

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Perform search
    await searchInput.fill("test query");
    await searchInput.press("Enter");

    // Check results page
    await expect(page).toHaveURL(/search/);
    await expect(page.locator("text=Results")).toBeVisible();
  });

  test.skip("form submission works", async ({ page }) => {
    await page.goto("/contact");

    // Fill out contact form
    await page.fill('input[name="name"]', "John Doe");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('textarea[name="message"]', "Test message");

    // Submit form
    await page.click('button[type="submit"]');

    // Check for success message
    await expect(page.locator("text=Thank you")).toBeVisible();
  });

  test.skip("mobile menu works", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile menu button should be visible
    const menuButton = page.locator('[aria-label="Menu"]');
    await expect(menuButton).toBeVisible();

    // Click menu button
    await menuButton.click();

    // Menu should open
    await expect(page.locator("nav")).toBeVisible();

    // Click a menu item
    await page.click("text=About");
    await expect(page).toHaveURL(/about/);
  });

  test.skip("error page handles 404", async ({ page }) => {
    await page.goto("/non-existent-page");

    // Should show 404 page
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.locator("text=Page not found")).toBeVisible();

    // Should have link back to home
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    // Click home link
    await homeLink.click();
    await expect(page).toHaveURL(/^\//);
  });

  test.skip("performance is acceptable", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
  });

  test.skip("accessibility basics work", async ({ page }) => {
    await page.goto("/");

    // Check for proper heading structure
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy(); // All images should have alt text
    }

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy(); // Should be able to focus elements
  });

  test.skip("JavaScript errors are handled", async ({ page }) => {
    const jsErrors: string[] = [];

    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        jsErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Filter out expected errors (customize based on your app)
    const criticalErrors = jsErrors.filter(
      (error) =>
        !error.includes("favicon.ico") &&
        !error.includes("analytics") &&
        !error.includes("third-party-script")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
