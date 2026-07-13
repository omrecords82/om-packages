import { expect, test } from "@playwright/test";

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

test("UI Button story supports keyboard and blocked states", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  await page.goto("/iframe.html?id=ui-button--states");

  await tabUntilFocused(page, page.getByRole("button", { name: "Full width" }));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");

  const disabled = page.getByRole("button", { name: "Disabled" });
  const pending = page.getByRole("button", { name: "Pending action" });
  await expect(disabled).toBeDisabled();
  await expect(pending).toHaveAttribute("data-pending", "true");
  await expect(pending).toHaveAttribute("data-om-pending", "true");
  await expect(page.getByRole("status")).toContainText("Pending");

  const outlineStyle = await page
    .getByRole("button", { name: "Full width" })
    .evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outlineStyle).not.toBe("none");
  expect(consoleErrors).toEqual([]);
});

test("UI Button themes resolve tokens and preserve liturgical/accessibility boundaries", async ({
  page
}) => {
  await page.goto("/iframe.html?id=ui-button--themes");

  const darkButton = page.getByRole("button", { name: "Dark mode" });
  await expect(darkButton).toBeVisible();
  const darkColor = await darkButton.evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const liturgicalButton = page.getByRole("button", { name: "Liturgical overlay" });
  const liturgicalBorder = await liturgicalButton.evaluate(
    (element) => getComputedStyle(element).borderColor
  );
  expect(liturgicalBorder).not.toBe("rgba(0, 0, 0, 0)");

  const focusButton = page.getByRole("button", { name: "Enhanced focus" });
  await focusButton.focus();
  const outlineWidth = await focusButton.evaluate(
    (element) => getComputedStyle(element).outlineWidth
  );
  expect(outlineWidth).not.toBe("0px");
});

test("UI Link story supports tab and Enter activation", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-link--variants");

  await tabUntilFocused(page, page.getByRole("link", { name: "Inline link" }));
  await page.keyboard.press("Enter");

  const disabled = page.getByRole("link", { name: "Disabled link" });
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("link", { name: "External target" })).toHaveAttribute(
    "rel",
    "noopener noreferrer"
  );
});

test("UI IconButton story exposes valid accessible names", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-iconbutton--sizes");

  await expect(page.getByRole("button", { name: "Small add action" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Medium add action" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Large add action" })).toBeVisible();
});

async function tabUntilFocused(
  page: import("@playwright/test").Page,
  locator: import("@playwright/test").Locator
): Promise<void> {
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }

  await expect(locator).toBeFocused();
}
