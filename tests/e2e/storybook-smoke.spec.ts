import { expect, test } from "@playwright/test";

test("built Storybook renders the bootstrap notice story", async ({ page }) => {
  await page.goto("/iframe.html?id=bootstrap-bootstrapnotice--default");

  await expect(page.getByRole("region", { name: "Bootstrap package notice" })).toContainText(
    "Orthodox Metrics package bootstrap"
  );
});

test("built Storybook renders generated token artifact previews", async ({ page }) => {
  await page.goto("/iframe.html?id=tokens-generatedartifacts--overview");

  await expect(
    page.getByRole("main", { name: "Experimental token artifact preview" })
  ).toContainText("Experimental token artifacts");
  await expect(page.getByText("Light scheme")).toBeVisible();
  await expect(page.getByText("Dark scheme")).toBeVisible();

  for (const color of ["white", "gold", "green", "purple", "red", "blue", "black"]) {
    await expect(page.getByText(color, { exact: true })).toBeVisible();
  }

  await expect(page.getByText("Enhanced focus")).toBeVisible();

  const background = await page
    .locator('[data-om-theme="light"]')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe("rgba(0, 0, 0, 0)");
});
