import { expect, test } from "@playwright/test";

test("built Storybook renders the bootstrap notice story", async ({ page }) => {
  await page.goto("/iframe.html?id=bootstrap-bootstrapnotice--default");

  await expect(page.getByRole("region", { name: "Bootstrap package notice" })).toContainText(
    "Orthodox Metrics package bootstrap"
  );
});
