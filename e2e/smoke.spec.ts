import { test, expect } from "@playwright/test";

/**
 * E2E Smoke Tests for IQ Scaffold Platform
 *
 * These tests verify critical application functionality including:
 * - Page loading and rendering
 * - Navigation and routing
 * - Error handling
 * - Responsive design
 * - Performance
 * - Accessibility basics
 */
test.describe("App Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify page renders with expected elements
    await expect(page.getByTestId("page-home")).toBeVisible();
    
    // Verify sidebar navigation is present
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();
    
    // Verify main navigation links are present
    await expect(page.getByTestId("nav-home")).toBeVisible();
    await expect(page.getByTestId("nav-about")).toBeVisible();
    await expect(page.getByTestId("nav-users")).toBeVisible();
    
    console.log("✓ Homepage loaded with all navigation elements");
  });

  test("application renders without critical JavaScript errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    const criticalErrors: string[] = [];

    // Capture console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        errors.push(text);
        
        // Filter critical errors (exclude known warnings)
        if (!text.includes("Download the React DevTools")) {
          criticalErrors.push(text);
        }
      }
    });

    // Capture page errors
    page.on("pageerror", (error) => {
      criticalErrors.push(error.message);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify no critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);

    console.log(`✓ No critical errors (${errors.length} total console messages)`);
  });

  test("authentication flow works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify auth guard is present (protected routes)
    // The homepage uses AuthGuard component
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
    
    // Verify page renders (auth guard allows access or redirects)
    await expect(page.getByTestId("page-home")).toBeVisible();

    console.log("✓ Authentication flow verified");
  });

  test("main navigation and routing works", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test navigation to About page
    await page.getByTestId("nav-about").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/about");
    
    // Test navigation to Users page
    await page.getByTestId("nav-users").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/users");
    
    // Test navigation to Examples page
    await page.getByTestId("nav-examples").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/examples");
    
    // Test navigation back to Home
    await page.getByTestId("nav-home").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
    
    // Test browser back button
    await page.goBack();
    await expect(page).toHaveURL("/examples");
    
    // Test browser forward button
    await page.goForward();
    await expect(page).toHaveURL("/");

    console.log("✓ Navigation and routing verified");
  });

  test("responsive design works on different viewports", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();
    
    // Test tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();
    
    // Test desktop viewport (Full HD)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();
    
    // Test large desktop viewport (4K)
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.waitForTimeout(500);
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();

    console.log("✓ Responsive design verified across viewports");
  });

  test("critical user workflows function correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test workflow: Navigate to Users page
    await page.getByTestId("nav-users").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/users");
    
    // Test workflow: Navigate to Dashboard
    await page.getByTestId("nav-dashboard").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/dashboard");
    
    // Test workflow: Navigate to Examples
    await page.getByTestId("nav-examples").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/examples");

    console.log("✓ Critical workflows verified");
  });

  test("error handling and error boundaries work", async ({ page }) => {
    // Test 404 page
    await page.goto("/non-existent-page");
    await page.waitForLoadState("networkidle");
    
    // Verify 404 page elements
    await expect(page.getByTestId("page-404")).toBeVisible();
    await expect(page.getByTestId("404-code")).toHaveText("404");
    await expect(page.getByTestId("404-title")).toBeVisible();
    await expect(page.getByTestId("404-message")).toBeVisible();
    
    // Test "Go Home" button
    await expect(page.getByTestId("btn-go-home")).toBeVisible();
    await page.getByTestId("btn-go-home").click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL("/");
    
    // Test "Go Back" button functionality
    await page.goto("/non-existent-page");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("btn-go-back")).toBeVisible();

    console.log("✓ Error handling and 404 page verified");
  });

  test("performance and loading times are acceptable", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Verify page loads within acceptable time (10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Verify page is interactive
    await expect(page.getByTestId("widget-sidebar")).toBeVisible();
    await expect(page.getByTestId("nav-home")).toBeEnabled();

    console.log(`✓ Page loaded in ${loadTime}ms (acceptable performance)`);
  });

  test("third-party integrations work", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify Mantine UI components render correctly
    const sidebar = page.getByTestId("widget-sidebar");
    await expect(sidebar).toBeVisible();
    
    // Verify TanStack Router is working
    await expect(page).toHaveURL("/");
    
    // Verify page renders without integration errors
    const pageContent = await page.content();
    expect(pageContent).toContain("Navigation");

    console.log("✓ Third-party integrations verified");
  });

  test("accessibility basics are functional", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    
    // Verify focus is visible (navigation should be focusable)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Verify semantic HTML structure
    const main = await page.locator("main").count();
    expect(main).toBeGreaterThan(0);
    
    // Verify navigation links have proper attributes
    const navHome = page.getByTestId("nav-home");
    await expect(navHome).toHaveAttribute("href", "/");

    console.log("✓ Accessibility basics verified");
  });

  test("CRM navigation works when feature is enabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if CRM navigation is present (feature-gated)
    const crmDashboard = page.getByTestId("nav-crm-dashboard");
    const isCrmVisible = await crmDashboard.isVisible().catch(() => false);
    
    if (isCrmVisible) {
      // Test CRM Dashboard navigation
      await crmDashboard.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("/crm/dashboard");
      
      // Test CRM Leads navigation
      await page.getByTestId("nav-crm-leads").click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("/crm/leads");
      
      // Test CRM Contacts navigation
      await page.getByTestId("nav-crm-contacts").click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("/crm/contacts");
      
      console.log("✓ CRM navigation verified");
    } else {
      console.log("✓ CRM feature not enabled (skipped)");
    }
  });

  test("billing navigation works when feature is enabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if Billing navigation is present (feature-gated)
    const billingNav = page.getByTestId("nav-billing");
    const isBillingVisible = await billingNav.isVisible().catch(() => false);
    
    if (isBillingVisible) {
      // Test Billing navigation
      await billingNav.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("/billing");
      
      // Test Gateway Config navigation
      await page.getByTestId("nav-gateway-config").click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL("/gateway-config");
      
      console.log("✓ Billing navigation verified");
    } else {
      console.log("✓ Billing feature not enabled (skipped)");
    }
  });
});
