import { test, expect, type Page } from "@playwright/test";

test.describe("App smoke", () => {
  test("home page renders", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/?$/);

    await expect(page.getByTestId("home-container")).toBeVisible();
    await expect(page.getByTestId("home-title")).toHaveText(
      "Welcome to Mantine UI Template"
    );
    await expect(page.getByTestId("home-subtitle")).toBeVisible();

    await expect(page.getByTestId("quick-start-card")).toBeVisible();
    await expect(page.getByTestId("features-card")).toBeVisible();
    await expect(page.getByTestId("try-components-card")).toBeVisible();

    await expect(page.getByTestId("show-notification-btn")).toBeVisible();
  });
});
