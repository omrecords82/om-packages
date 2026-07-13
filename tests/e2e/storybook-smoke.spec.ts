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

test("UI TextField story supports labels, typing, states, and descriptions", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-textfield--examples");

  await page.locator("label").filter({ hasText: "Default" }).click();
  await expect(page.getByRole("textbox", { name: "Default" })).toBeFocused();

  const hidden = page.getByRole("searchbox", { name: "Hidden search label" });
  await expect(hidden).toBeVisible();

  await tabUntilFocused(page, page.getByRole("textbox", { name: "Placeholder" }));
  await page.keyboard.type("Typed value");
  await expect(page.getByRole("textbox", { name: "Placeholder" })).toHaveValue("Typed value");

  const disabled = page.getByRole("textbox", { name: "Disabled" });
  await expect(disabled).toBeDisabled();
  await disabled.fill("Blocked", { force: true }).catch(() => undefined);
  await expect(disabled).toHaveValue("Disabled value");

  const readOnly = page.getByRole("textbox", { name: "Read only" });
  await readOnly.focus();
  await expect(readOnly).toBeFocused();
  await page.keyboard.type(" blocked");
  await expect(readOnly).toHaveValue("Read-only value");

  const required = page.getByRole("textbox", { name: "Required" });
  await expect(required).toHaveAttribute("required", "");

  const invalid = page.getByRole("textbox", { name: "Invalid" });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Example validation error.")).toBeVisible();

  const describedBy = await page
    .getByRole("textbox", { name: "Description" })
    .getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.getByText("Description is associated with the input.")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("UI TextArea story supports typing, multiline content, and states", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-textarea--examples");

  await tabUntilFocused(page, page.getByRole("textbox", { name: "Default" }));
  await page.keyboard.type("Line one");
  await expect(page.getByRole("textbox", { name: "Default" })).toHaveValue("Line one");

  const controlled = page.getByRole("textbox", { name: "Controlled" });
  await controlled.fill("First line\nSecond line");
  await expect(controlled).toHaveValue("First line\nSecond line");

  await expect(page.getByRole("textbox", { name: "Disabled" })).toBeDisabled();

  const readOnly = page.getByRole("textbox", { name: "Read only" });
  await readOnly.focus();
  await expect(readOnly).toBeFocused();
  await page.keyboard.type(" blocked");
  await expect(readOnly).toHaveValue("Read-only value");

  await expect(page.getByRole("textbox", { name: "Required" })).toHaveAttribute("required", "");
  await expect(page.getByRole("textbox", { name: "Invalid" })).toHaveAttribute(
    "aria-invalid",
    "true"
  );
  await expect(page.getByText("Example validation error.")).toBeVisible();
});

test("UI field themes preserve focus, validation, liturgical, and large-text behavior", async ({
  page
}) => {
  await page.goto("/iframe.html?id=ui-textfield--themes");

  const dark = page.getByRole("textbox", { name: "Dark mode" });
  const darkColor = await dark.evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const liturgical = page.getByRole("textbox", { name: "Liturgical overlay" });
  await expect(liturgical).toHaveAttribute("aria-invalid", "true");
  const liturgicalOutline = await liturgical.evaluate((element) => {
    element.focus();
    return getComputedStyle(element).outlineColor;
  });
  const errorColor = await page
    .getByText("Error stays protected.")
    .evaluate((element) => getComputedStyle(element).color);
  expect(liturgicalOutline).not.toBe(errorColor);

  const enhanced = page.getByRole("textbox", { name: "Enhanced focus" });
  await enhanced.focus();
  const outlineWidth = await enhanced.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(outlineWidth).not.toBe("0px");

  const large = page.getByRole("textbox", { name: "Large text" });
  await expect(large).toBeVisible();
  await expect(page.getByText("Description remains visible.")).toBeVisible();
  await expect(page.getByText("Error remains visible.")).toBeVisible();
});

test("existing Phase 1C stories continue loading", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-button--variants");
  await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-link--variants");
  await expect(page.getByRole("link", { name: "Inline link" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-iconbutton--sizes");
  await expect(page.getByRole("button", { name: "Small add action" })).toBeVisible();
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

function collectConsoleErrors(page: import("@playwright/test").Page): string[] {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  return consoleErrors;
}
