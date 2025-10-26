import { test, expect, type Page } from "@playwright/test";

test.describe("App smoke", () => {
  test("home page renders", async ({ page }: { page: Page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/?$/);

    await expect(
      page.getByRole("heading", { name: "Welcome to Mantine UI Template" })
    ).toBeVisible();

    await expect(page.getByText("A modern React template"))
      .toBeVisible();

    await expect(page.getByRole("button", { name: "Show Notification" }))
      .toBeVisible();
  });
});
