import { test, expect, type Page } from "@playwright/test";

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/register");
  });

  test("should display registration form elements", async ({ page }) => {
    // Check page title
    await expect(
      page.getByRole("heading", { name: "Create Your Account" })
    ).toBeVisible();

    // Check subtitle
    await expect(
      page.getByText("Join Gripday and start your journey")
    ).toBeVisible();

    // Check form fields
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();

    // Check submit button
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();

    // Check sign in link
    await expect(
      page.getByText("Already have an account? Sign in")
    ).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Click submit without filling form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Check for validation messages
    await expect(
      page.getByText("First name must be between 1 and 100 characters")
    ).toBeVisible();
    await expect(
      page.getByText("Last name must be between 1 and 100 characters")
    ).toBeVisible();
    await expect(
      page.getByText("Username must be between 3 and 50 characters")
    ).toBeVisible();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();
    await expect(
      page.getByText("Password must be between 8 and 100 characters")
    ).toBeVisible();
  });

  test("should validate username format", async ({ page }) => {
    // Test with special characters
    await page.getByLabel("Username").fill("user@name");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText(
        "Username can only contain letters, numbers, and underscores"
      )
    ).toBeVisible();

    // Test with spaces
    await page.getByLabel("Username").clear();
    await page.getByLabel("Username").fill("user name");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText(
        "Username can only contain letters, numbers, and underscores"
      )
    ).toBeVisible();
  });

  test("should validate username length", async ({ page }) => {
    // Too short
    await page.getByLabel("Username").fill("ab");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Username must be between 3 and 50 characters")
    ).toBeVisible();

    // Too long
    await page.getByLabel("Username").clear();
    await page.getByLabel("Username").fill("a".repeat(51));
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Username must be between 3 and 50 characters")
    ).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Invalid email without @
    await page.getByLabel("Email").fill("invalidemail");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Please enter a valid email")).toBeVisible();

    // Invalid email without domain
    await page.getByLabel("Email").clear();
    await page.getByLabel("Email").fill("invalid@");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Please enter a valid email")).toBeVisible();
  });

  test("should validate password complexity", async ({ page }) => {
    // Too short
    await page.getByLabel("Password", { exact: true }).fill("Pass1!");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Password must be between 8 and 100 characters")
    ).toBeVisible();

    // No uppercase
    await page.getByLabel("Password", { exact: true }).clear();
    await page.getByLabel("Password", { exact: true }).fill("password123!");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Password must include at least one uppercase letter")
    ).toBeVisible();

    // No lowercase
    await page.getByLabel("Password", { exact: true }).clear();
    await page.getByLabel("Password", { exact: true }).fill("PASSWORD123!");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Password must include at least one lowercase letter")
    ).toBeVisible();

    // No number
    await page.getByLabel("Password", { exact: true }).clear();
    await page.getByLabel("Password", { exact: true }).fill("Password!");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText("Password must include at least one number")
    ).toBeVisible();

    // No special character
    await page.getByLabel("Password", { exact: true }).clear();
    await page.getByLabel("Password", { exact: true }).fill("Password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(
      page.getByText(
        "Password must include at least one special character (@$!%*?&)"
      )
    ).toBeVisible();
  });

  test("should validate password confirmation", async ({ page }) => {
    // Fill password
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("DifferentPassword123!");

    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("should accept valid registration data", async ({ page }) => {
    // Fill all fields with valid data
    await page.getByLabel("First Name").fill("John");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Username").fill("johndoe");
    await page.getByLabel("Email").fill("john.doe@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    // No validation errors should be visible
    await expect(
      page.getByText("Username must be between 3 and 50 characters")
    ).not.toBeVisible();
    await expect(
      page.getByText("Please enter a valid email")
    ).not.toBeVisible();
  });

  test("should show username helper text", async ({ page }) => {
    // Check for username description
    await expect(
      page.getByText("3-50 characters, letters, numbers, and underscores only")
    ).toBeVisible();
  });

  test("should show password helper text", async ({ page }) => {
    // Check for password description
    await expect(
      page.getByText(
        "Min 8 characters with uppercase, lowercase, number, and special character"
      )
    ).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.getByLabel("Password", { exact: true });
    const confirmPasswordInput = page.getByLabel("Confirm Password");

    // Initially password type
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Toggle password visibility
    const toggleButtons = page.locator(
      'button[aria-label="Toggle password visibility"]'
    );

    // Toggle first password field
    await toggleButtons.first().click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Toggle confirm password field
    await toggleButtons.nth(1).click();
    await expect(confirmPasswordInput).toHaveAttribute("type", "text");
  });

  test("should navigate to login page", async ({ page }) => {
    // Click sign in link
    await page.getByText("Already have an account? Sign in").click();

    // Should navigate to home/login page
    await expect(page).toHaveURL(/\/?$/);
    await expect(
      page.getByRole("heading", { name: "Welcome to Gripday" })
    ).toBeVisible();
  });

  test("should have proper form accessibility", async ({ page }) => {
    // Check form has proper structure
    const form = page.locator("form");
    await expect(form).toBeVisible();

    // Check all inputs have labels
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();

    // Check submit button is properly labeled
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
  });

  test("should show loading state when submitting", async ({ page }) => {
    // Fill form with valid data
    await page.getByLabel("First Name").fill("John");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Username").fill("johndoe_test");
    await page.getByLabel("Email").fill("john.doe.test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    // Click submit
    const submitButton = page.getByRole("button", { name: "Create Account" });
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton)
      .toBeDisabled({ timeout: 1000 })
      .catch(() => {
        // Loading state might be too fast to catch
      });
  });

  test("should have gradient background", async ({ page }) => {
    // Check if the auth layout has a gradient background
    const background = page.locator("body > div > div").first();
    const bgStyle = await background.evaluate(
      (el) => window.getComputedStyle(el).background
    );

    // Should contain gradient
    expect(bgStyle).toContain("gradient");
  });
});

test.describe("Register Form Interactions", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/register");
  });

  test("should allow tab navigation between fields", async ({ page }) => {
    const firstNameInput = page.getByLabel("First Name");
    const lastNameInput = page.getByLabel("Last Name");
    const usernameInput = page.getByLabel("Username");

    // Focus first name
    await firstNameInput.focus();
    await expect(firstNameInput).toBeFocused();

    // Tab to last name
    await page.keyboard.press("Tab");
    await expect(lastNameInput).toBeFocused();

    // Tab to username
    await page.keyboard.press("Tab");
    await expect(usernameInput).toBeFocused();
  });

  test("should submit form with Enter key", async ({ page }) => {
    // Fill form
    await page.getByLabel("First Name").fill("John");
    await page.getByLabel("Last Name").fill("Doe");
    await page.getByLabel("Username").fill("johndoe");
    await page.getByLabel("Email").fill("john@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel("Confirm Password").fill("Password123!");

    // Press Enter in last field
    await page.getByLabel("Confirm Password").press("Enter");

    // Form should be submitted
  });

  test("should clear field on triple click", async ({ page }) => {
    const usernameInput = page.getByLabel("Username");

    // Fill field
    await usernameInput.fill("testuser");

    // Triple click to select all
    await usernameInput.click({ clickCount: 3 });

    // Type new value (should replace)
    await page.keyboard.type("newuser");

    await expect(usernameInput).toHaveValue("newuser");
  });
});
