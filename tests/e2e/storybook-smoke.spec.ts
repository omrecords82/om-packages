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

test("UI Checkbox story supports keyboard, blocked states, validation, and themes", async ({
  page
}) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-checkbox--examples");

  const unselected = page.getByRole("checkbox", { name: "Unselected" });
  await tabUntilFocused(page, unselected);
  await page.keyboard.press("Space");
  await expect(unselected).toBeChecked();

  const mixed = page.getByRole("checkbox", { name: "Indeterminate" });
  await expect(mixed).toHaveJSProperty("indeterminate", true);

  const disabled = page.getByRole("checkbox", { name: "Disabled" });
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true }).catch(() => undefined);
  await expect(disabled).not.toBeChecked();

  const readOnly = page.getByRole("checkbox", { name: "Read only" });
  await expect(readOnly).toBeChecked();
  await readOnly.click({ force: true });
  await expect(readOnly).toBeChecked();

  const invalid = page.getByRole("checkbox", { name: "Invalid" });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Example checkbox error.")).toBeVisible();

  await page.goto("/iframe.html?id=ui-checkbox--themes");
  const enhanced = page.getByRole("checkbox", { name: "Enhanced focus" });
  await enhanced.focus();
  const outlineWidth = await enhanced.evaluate((element) => {
    const container = element.closest(".om-selection-control");
    return container === null ? "0px" : getComputedStyle(container).outlineWidth;
  });
  const indicatorOutline = await enhanced.evaluate((element) => {
    const indicator = element
      .closest(".om-selection-control")
      ?.querySelector(".om-selection-control__indicator");
    return indicator === null || indicator === undefined
      ? "0px"
      : getComputedStyle(indicator).outlineWidth;
  });
  expect(outlineWidth !== "0px" || indicatorOutline !== "0px").toBe(true);

  const dark = page.getByRole("checkbox", { name: "Dark mode" });
  const darkColor = await dark.evaluate((element) => {
    const container = element.closest(".om-selection-control");
    return container === null ? "rgba(0, 0, 0, 0)" : getComputedStyle(container).color;
  });
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const liturgical = page.getByRole("checkbox", { name: "Liturgical overlay" });
  await expect(liturgical).toHaveAttribute("aria-invalid", "true");
  const errorColor = await page
    .getByText("Validation stays protected.")
    .evaluate((element) => getComputedStyle(element).color);
  const focusColor = await liturgical.evaluate((element) => {
    element.focus();
    const indicator = element
      .closest(".om-selection-control")
      ?.querySelector(".om-selection-control__indicator");
    return indicator === null || indicator === undefined
      ? "rgba(0, 0, 0, 0)"
      : getComputedStyle(indicator).outlineColor;
  });
  expect(focusColor).not.toBe(errorColor);

  await expect(page.getByText("Description remains visible.")).toBeVisible();
  await expect(page.getByText("Error remains visible.")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("UI RadioGroup story supports arrow navigation and blocked states", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-radiogroup--examples");

  const defaultGroup = page.getByRole("radiogroup", { name: "Default vertical" });
  const baptism = defaultGroup.getByRole("radio", { name: "Baptism" });
  const marriage = defaultGroup.getByRole("radio", { name: "Marriage" });
  await baptism.focus();
  await page.keyboard.press("ArrowDown");
  await expect(marriage).toBeChecked();

  const disabledGroup = page.getByRole("radiogroup", { name: "Disabled option" });
  const disabledOption = disabledGroup.getByRole("radio", { name: "Disabled option" });
  await disabledOption.click({ force: true }).catch(() => undefined);
  await expect(disabledOption).not.toBeChecked();

  const readOnlyGroup = page.getByRole("radiogroup", { name: "Read only" });
  const readOnlyTwo = readOnlyGroup.getByRole("radio", { name: "Read-only two" });
  await readOnlyTwo.click({ force: true });
  await expect(readOnlyTwo).not.toBeChecked();

  const invalidGroup = page.getByRole("radiogroup", { name: "Invalid" });
  await expect(invalidGroup).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Example radio group error.")).toBeVisible();
});

test("UI Switch story supports keyboard, blocked states, validation, and themes", async ({
  page
}) => {
  await page.goto("/iframe.html?id=ui-switch--examples");

  const off = page.getByRole("switch", { name: "Off" });
  await tabUntilFocused(page, off);
  await page.keyboard.press("Space");
  await expect(off).toBeChecked();

  const disabled = page.getByRole("switch", { name: "Disabled" });
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true }).catch(() => undefined);
  await expect(disabled).not.toBeChecked();

  const readOnly = page.getByRole("switch", { name: "Read only" });
  await expect(readOnly).toBeChecked();
  await readOnly.click({ force: true });
  await expect(readOnly).toBeChecked();

  const invalid = page.getByRole("switch", { name: "Invalid" });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Example switch error.")).toBeVisible();

  const selectedTrackOffset = await page
    .getByRole("switch", { name: "On", exact: true })
    .evaluate((element) => {
      const thumb = element.closest(".om-switch")?.querySelector(".om-switch__thumb");
      return thumb === null || thumb === undefined ? "none" : getComputedStyle(thumb).transform;
    });
  expect(selectedTrackOffset).not.toBe("none");

  await page.goto("/iframe.html?id=ui-switch--themes");
  const enhanced = page.getByRole("switch", { name: "Enhanced focus" });
  await enhanced.focus();
  const outlineWidth = await enhanced.evaluate((element) => {
    const track = element.closest(".om-switch")?.querySelector(".om-switch__track");
    return track === null || track === undefined ? "0px" : getComputedStyle(track).outlineWidth;
  });
  expect(outlineWidth).not.toBe("0px");
});

test("UI Select story supports keyboard selection, blocked states, validation, and themes", async ({
  page
}) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-select--examples");

  const placeholder = page.getByRole("button", { name: /Placeholder/ });
  await tabUntilFocused(page, placeholder);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(placeholder).toContainText("Marriage");

  const selected = page.getByRole("button", { name: /Selected value/ });
  await selected.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();

  await expect(page.getByRole("button", { name: /Hidden select label/ })).toBeVisible();

  const disabledOptionSelect = page.getByRole("button", { name: /Disabled option/ });
  await disabledOptionSelect.click();
  const disabledOption = page.getByRole("option", { name: /Disabled option/ });
  await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  await disabledOption.click({ force: true }).catch(() => undefined);
  await expect(disabledOptionSelect).not.toContainText("Disabled option");
  await page.keyboard.press("Escape").catch(() => undefined);

  const disabled = page.getByRole("button", {
    exact: true,
    name: "Select an option Disabled"
  });
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true }).catch(() => undefined);
  await expect(page.getByRole("listbox")).toBeHidden();

  const readOnly = page.getByRole("button", { name: /Read only/ });
  await readOnly.focus();
  await expect(readOnly).toBeFocused();
  await page.keyboard.press("Enter");
  await readOnly.click({ force: true }).catch(() => undefined);
  await expect(page.getByRole("listbox")).toBeHidden();

  const invalid = page.getByRole("button", { name: /Invalid/ });
  await expect(invalid).toHaveAttribute("data-om-invalid", "true");
  await expect(page.getByText("Example select error.")).toBeVisible();

  const describedBy = await page
    .getByRole("button", { name: /Description/ })
    .getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.getByText("Description is associated with the Select trigger.")).toBeVisible();

  const longList = page.getByRole("button", { name: /Long option list/ });
  await longList.click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  const canScroll = await listbox.evaluate(
    (element) => element.scrollHeight > element.clientHeight
  );
  expect(canScroll).toBe(true);

  await page.goto("/iframe.html?id=ui-select--themes");
  const dark = page.getByRole("button", { name: /Dark mode/ });
  const darkColor = await dark.evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const liturgical = page.getByRole("button", { name: /Liturgical overlay/ });
  await expect(liturgical).toHaveAttribute("data-om-invalid", "true");
  await expect(page.getByText("Validation and focus treatment stay protected.")).toBeVisible();
  await liturgical.focus();
  const focusOutline = await liturgical.evaluate(
    (element) => getComputedStyle(element).outlineWidth
  );
  expect(focusOutline).not.toBe("0px");

  const highContrast = page.getByRole("button", { name: /High contrast/ });
  await expect(highContrast).toBeVisible();
  const enhanced = page.getByRole("button", { name: /Enhanced focus/ });
  await enhanced.focus();
  const outlineWidth = await enhanced.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(outlineWidth).not.toBe("0px");

  await expect(page.getByText("Large-text error remains visible.")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("UI Dialog story supports modal focus, dismissal, and themes", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-dialog--examples");

  const trigger = page.getByRole("button", { name: "Open basic dialog" });
  await tabUntilFocused(page, trigger);
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Basic dialog" });
  await expect(dialog).toBeVisible();
  const initialFocusInside = await dialog.evaluate((element) =>
    element.contains(document.activeElement)
  );
  expect(initialFocusInside).toBe(true);

  await page.keyboard.press("Tab");
  const focusInside = await dialog.evaluate((element) => element.contains(document.activeElement));
  expect(focusInside).toBe(true);

  await page.getByRole("button", { exact: true, name: "Close dialog" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.getByRole("button", { name: "Open keyboard locked dialog" }).click();
  const locked = page.getByRole("dialog", { name: "Keyboard dismissal disabled" });
  await expect(locked).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(locked).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Close dialog" }).click();

  await page.getByRole("button", { name: "Open nondismissable dialog" }).click();
  const nondismissable = page.getByRole("dialog", { name: "Nondismissable dialog" });
  await expect(nondismissable).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(nondismissable).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Close dialog" }).click();

  await page.setViewportSize({ height: 420, width: 375 });
  await page.getByRole("button", { name: "Open long content dialog" }).click();
  const bodyCanScroll = await page
    .getByRole("dialog", { name: "Long content dialog" })
    .locator(".om-dialog__body")
    .evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(bodyCanScroll).toBe(true);
  await page.keyboard.press("Escape");

  await page.goto("/iframe.html?id=ui-dialog--themes");
  await page.getByRole("button", { name: "Open dark dialog" }).click();
  const darkColor = await page
    .getByRole("dialog", { name: "Dark mode dialog" })
    .evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Open enhanced focus dialog" }).focus();
  const outlineWidth = await page
    .getByRole("button", { name: "Open enhanced focus dialog" })
    .evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(outlineWidth).not.toBe("0px");

  await page.getByRole("button", { name: "Open large text dialog" }).click();
  await expect(page.getByRole("dialog", { name: "Large text dialog" })).toBeVisible();
  await expect(page.getByText("Large text should not clip")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("UI AlertDialog story supports confirmation, focus policy, and pending behavior", async ({
  page
}) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-alertdialog--examples");

  await page.getByRole("button", { name: "Open confirmation alert" }).click();
  const confirmation = page.getByRole("alertdialog", { name: "Confirm this action?" });
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.mouse.click(4, 4);
  await expect(confirmation).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Confirm" }).click();
  await expect(page.getByText("Confirmation action invoked.")).toBeVisible();
  await expect(confirmation).toBeHidden();

  await page.getByRole("button", { name: "Open destructive alert" }).click();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  const destructive = page.getByRole("button", { name: "Delete" });
  await expect(destructive).toHaveAttribute("data-om-variant", "destructive");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog", { name: "Delete this item?" })).toBeHidden();

  await page.getByRole("button", { name: "Open manual alert" }).click();
  await page.getByRole("button", { exact: true, name: "Confirm" }).click();
  await expect(page.getByRole("alertdialog", { name: "Manual close alert" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("button", { name: "Open pending alert" }).click();
  const pending = page.getByRole("alertdialog", { name: "Pending confirmation" });
  await expect(pending).toBeVisible();
  await expect(page.locator(".om-alert-dialog__confirm")).toHaveAttribute("data-pending", "true");
  await page.keyboard.press("Escape");
  await expect(pending).toBeVisible();

  await page.goto("/iframe.html?id=ui-alertdialog--themes");
  await page.getByRole("button", { name: "Open enhanced focus alert dialog" }).focus();
  const outlineWidth = await page
    .getByRole("button", { name: "Open enhanced focus alert dialog" })
    .evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(outlineWidth).not.toBe("0px");
  expect(consoleErrors).toEqual([]);
});

test("UI Menu story supports keyboard, typeahead, links, and themes", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-menu--examples");

  const trigger = page.getByRole("button", { name: "Basic action menu" });
  await tabUntilFocused(page, trigger);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("d");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Last action: duplicate")).toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Home");
  await page.keyboard.press("End");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Disabled item menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Disabled item" })).toHaveAttribute(
    "aria-disabled",
    "true"
  );
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Separator menu" }).click();
  await expect(page.getByRole("separator")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Link menu" }).click();
  const link = page.getByRole("menuitem", { name: "Documentation link" });
  await expect(link).toHaveAttribute("href", "https://example.test/docs");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Destructive action menu" }).click();
  const destructive = page.getByRole("menuitem", { name: "Delete" });
  await expect(destructive).toHaveAttribute("data-om-intent", "destructive");
  const destructiveDecoration = await destructive.evaluate(
    (element) => getComputedStyle(element).textDecorationLine
  );
  expect(destructiveDecoration).toContain("underline");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Destructive action menu" })).toBeHidden();

  await page.getByRole("button", { name: "Long scrolling menu" }).click();
  const menu = page.getByRole("menu", { name: "Long scrolling menu" });
  const canScroll = await page
    .locator(".om-menu__popover")
    .evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(canScroll).toBe(true);
  await page.mouse.click(4, 4);
  await expect(menu).toBeHidden();

  await page.goto("/iframe.html?id=ui-menu--themes");
  const dark = page.getByRole("button", { name: "Dark menu" });
  const darkColor = await dark.evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const enhanced = page.getByRole("button", { name: "Enhanced focus menu" });
  await enhanced.focus();
  const outlineWidth = await enhanced.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(outlineWidth).not.toBe("0px");

  const highContrast = page.getByRole("button", { name: "High contrast menu" });
  await expect(highContrast).toBeVisible();
  const largeText = page.getByRole("button", { name: "Large text menu" });
  await expect(largeText).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("UI Tabs story supports keyboard selection, mounting, and themes", async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto("/iframe.html?id=ui-tabs--examples");

  const defaultList = page.getByRole("tablist", { name: "Default horizontal" });
  const overview = defaultList.getByRole("tab", { name: "Overview" });
  await tabUntilFocused(page, overview);
  await page.keyboard.press("ArrowRight");
  await expect(defaultList.getByRole("tab", { name: "Records" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("ArrowLeft");
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(defaultList.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("Home");
  await expect(overview).toHaveAttribute("aria-selected", "true");

  const verticalList = page.getByRole("tablist", { name: "Vertical sections" });
  await verticalList.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(verticalList.getByRole("tab", { name: "Records" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("ArrowUp");
  await expect(verticalList.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  const manualList = page.getByRole("tablist", { name: "Manual activation" });
  await manualList.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(manualList.getByRole("tab", { name: "Overview" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("Enter");
  await expect(manualList.getByRole("tab", { name: "Records" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(manualList.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  const disabledList = page.getByRole("tablist", { name: "Disabled tab" });
  await disabledList.getByRole("tab", { name: "Records" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(disabledList.getByRole("tab", { name: "Disabled" })).toHaveAttribute(
    "aria-disabled",
    "true"
  );
  await expect(disabledList.getByRole("tab", { name: "Activity" })).toHaveAttribute(
    "aria-selected",
    "true"
  );

  const allPanels = page
    .getByRole("tablist", { name: "All panel mounting" })
    .locator("xpath=ancestor::div[contains(@class, 'om-tabs')][1]");
  await expect(allPanels.locator(".om-tabs__panel")).toHaveCount(3);
  await expect(allPanels.locator(".om-tabs__panel[data-inert='true']").first()).toBeAttached();

  const narrowTabs = page
    .getByRole("tablist", { name: "Narrow scrolling tabs" })
    .locator("xpath=ancestor::div[contains(@class, 'om-tabs')][1]")
    .locator(".om-tabs__list");
  const canScroll = await narrowTabs.evaluate(
    (element) => element.scrollWidth > element.clientWidth
  );
  expect(canScroll).toBe(true);

  await page.goto("/iframe.html?id=ui-tabs--themes");
  const darkList = page.getByRole("tablist", { name: "Dark mode sections" });
  const darkColor = await darkList
    .getByRole("tab", { name: "Overview" })
    .evaluate((element) => getComputedStyle(element).color);
  expect(darkColor).not.toBe("rgba(0, 0, 0, 0)");

  const liturgicalTab = page
    .getByRole("tablist", { name: "Liturgical sections" })
    .getByRole("tab", { name: "Overview" });
  await liturgicalTab.focus();
  const liturgicalOutline = await liturgicalTab.evaluate(
    (element) => getComputedStyle(element).outlineWidth
  );
  expect(liturgicalOutline).not.toBe("0px");

  const enhancedTab = page
    .getByRole("tablist", { name: "Enhanced focus sections" })
    .getByRole("tab", { name: "Overview" });
  await enhancedTab.focus();
  const outlineWidth = await enhancedTab.evaluate(
    (element) => getComputedStyle(element).outlineWidth
  );
  expect(outlineWidth).not.toBe("0px");

  await expect(page.getByRole("tablist", { name: "High contrast sections" })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Large text sections" })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("existing UI stories continue loading", async ({ page }) => {
  await page.goto("/iframe.html?id=ui-button--variants");
  await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-link--variants");
  await expect(page.getByRole("link", { name: "Inline link" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-iconbutton--sizes");
  await expect(page.getByRole("button", { name: "Small add action" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-textfield--examples");
  await expect(page.getByRole("textbox", { name: "Default" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-textarea--examples");
  await expect(page.getByRole("textbox", { name: "Default" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-checkbox--examples");
  await expect(page.getByRole("checkbox", { name: "Unselected" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-radiogroup--examples");
  await expect(page.getByRole("radiogroup", { name: "Default vertical" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-switch--examples");
  await expect(page.getByRole("switch", { name: "Off" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-select--examples");
  await expect(page.getByRole("button", { name: /Placeholder/ })).toBeVisible();
  await page.goto("/iframe.html?id=ui-dialog--examples");
  await expect(page.getByRole("button", { name: "Open basic dialog" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-alertdialog--examples");
  await expect(page.getByRole("button", { name: "Open confirmation alert" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-menu--examples");
  await expect(page.getByRole("button", { name: "Basic action menu" })).toBeVisible();
  await page.goto("/iframe.html?id=ui-tabs--examples");
  await expect(page.getByRole("tablist", { name: "Default horizontal" })).toBeVisible();
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
