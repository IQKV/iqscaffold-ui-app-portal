import { test, expect } from "@playwright/test";

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the users page
    await page.goto("/users");
  });

  test("should display users page with data grid", async ({ page }) => {
    // Check page title and main elements
    await expect(page.getByText("User Management")).toBeVisible();
    await expect(page.getByText("Add User")).toBeVisible();
    await expect(page.getByPlaceholder("Search users...")).toBeVisible();

    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Jane Smith")).toBeVisible();
  });

  test("should create a new user", async ({ page }) => {
    // Click Add User button
    await page.getByText("Add User").click();

    // Modal should open
    await expect(page.getByText("Create New User")).toBeVisible();

    // Fill out the form
    await page.getByLabel("Username").fill("e2euser");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("First Name").fill("E2E");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Role").selectOption("manager");

    // Submit the form
    await page.getByText("Create User").click();

    // Wait for success notification
    await expect(page.getByText("User created successfully")).toBeVisible();

    // Modal should close
    await expect(page.getByText("Create New User")).not.toBeVisible();

    // New user should appear in the list
    await expect(page.getByText("E2E User")).toBeVisible();
    await expect(page.getByText("@e2euser • e2e@example.com")).toBeVisible();
  });

  test("should edit an existing user", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();

    // Click edit button for the first user
    await page.locator('[aria-label="Edit user"]').first().click();

    // Edit modal should open
    await expect(page.getByText("Edit User")).toBeVisible();

    // Update the first name
    await page.getByLabel("First Name").clear();
    await page.getByLabel("First Name").fill("Johnny");

    // Submit the update
    await page.getByText("Update User").click();

    // Wait for success notification
    await expect(page.getByText("User updated successfully")).toBeVisible();

    // Updated name should appear in the list
    await expect(page.getByText("Johnny Doe")).toBeVisible();
  });

  test("should search users", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();

    // Search for a specific user
    await page.getByPlaceholder("Search users...").fill("jane");

    // Only Jane should be visible
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await expect(page.getByText("John Doe")).not.toBeVisible();

    // Clear search
    await page.getByPlaceholder("Search users...").clear();

    // All users should be visible again
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Jane Smith")).toBeVisible();
  });

  test("should delete a user with confirmation", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("Bob Wilson")).toBeVisible();

    // Click delete button for Bob Wilson
    const bobRow = page.locator("tr").filter({ hasText: "Bob Wilson" });
    await bobRow.locator('[aria-label="Delete user"]').click();

    // Confirmation modal should appear
    await expect(page.getByText("Delete User")).toBeVisible();
    await expect(
      page.getByText("Are you sure you want to delete user Bob Wilson?")
    ).toBeVisible();

    // Confirm deletion
    await page.getByText("Delete").click();

    // Wait for success notification
    await expect(page.getByText("User deleted successfully")).toBeVisible();

    // User should be removed from the list
    await expect(page.getByText("Bob Wilson")).not.toBeVisible();
  });

  test("should cancel user deletion", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("Alice Brown")).toBeVisible();

    // Click delete button for Alice Brown
    const aliceRow = page.locator("tr").filter({ hasText: "Alice Brown" });
    await aliceRow.locator('[aria-label="Delete user"]').click();

    // Confirmation modal should appear
    await expect(page.getByText("Delete User")).toBeVisible();

    // Cancel deletion
    await page.getByText("Cancel").click();

    // Modal should close and user should still be in the list
    await expect(page.getByText("Delete User")).not.toBeVisible();
    await expect(page.getByText("Alice Brown")).toBeVisible();
  });

  test("should validate form fields", async ({ page }) => {
    // Click Add User button
    await page.getByText("Add User").click();

    // Try to submit without filling required fields
    await page.getByText("Create User").click();

    // Validation errors should appear
    await expect(
      page.getByText("Username must be at least 3 characters")
    ).toBeVisible();
    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("First name must be at least 2 characters")
    ).toBeVisible();
    await expect(
      page.getByText("Last name must be at least 2 characters")
    ).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    // Click Add User button
    await page.getByText("Add User").click();

    // Fill with invalid email
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByText("Create User").click();

    // Email validation error should appear
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("should display role badges correctly", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();

    // Check that role badges are displayed
    await expect(
      page.locator(".mantine-Badge-root").filter({ hasText: "admin" })
    ).toBeVisible();
    await expect(
      page.locator(".mantine-Badge-root").filter({ hasText: "manager" })
    ).toBeVisible();
    await expect(
      page.locator(".mantine-Badge-root").filter({ hasText: "user" })
    ).toBeVisible();
  });

  test("should handle form cancellation", async ({ page }) => {
    // Click Add User button
    await page.getByText("Add User").click();

    // Fill some fields
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill("test@example.com");

    // Cancel the form
    await page.getByText("Cancel").click();

    // Modal should close
    await expect(page.getByText("Create New User")).not.toBeVisible();

    // Open modal again to check if form is reset
    await page.getByText("Add User").click();

    // Fields should be empty
    await expect(page.getByLabel("Username")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
  });

  test("should navigate to users page from sidebar", async ({ page }) => {
    // Navigate to home page first
    await page.goto("/");

    // Click on User Management in sidebar
    await page.getByText("User Management").click();

    // Should navigate to users page
    await expect(page).toHaveURL("/users");
    await expect(page.getByText("User Management")).toBeVisible();
  });

  test("should display user creation and update timestamps in edit mode", async ({
    page,
  }) => {
    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();

    // Click edit button for the first user
    await page.locator('[aria-label="Edit user"]').first().click();

    // Check if timestamps are displayed
    await expect(page.getByText(/Created:/)).toBeVisible();
    await expect(page.getByText(/Updated:/)).toBeVisible();
  });

  test("should not show password field in edit mode", async ({ page }) => {
    // Wait for users to load
    await expect(page.getByText("John Doe")).toBeVisible();

    // Click edit button for the first user
    await page.locator('[aria-label="Edit user"]').first().click();

    // Password field should not be visible in edit mode
    await expect(page.getByLabel("Password")).not.toBeVisible();
  });
});
