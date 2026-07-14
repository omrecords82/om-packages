/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { ComboBox } from "./ComboBox.js";

const options = [
  {
    value: "baptism",
    label: "Baptism",
    description: "Baptism records"
  },
  {
    value: "marriage",
    label: "Marriage"
  },
  {
    value: "chrismation",
    label: "Chrismation",
    isDisabled: true
  }
] as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeAll(() => {
  const currentCss = (globalThis as { CSS?: object }).CSS ?? {};
  Object.defineProperty(globalThis, "CSS", {
    configurable: true,
    value: {
      ...currentCss,
      escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/gu, "\\$&")
    }
  });
});

describe("ComboBox", () => {
  it("names the input through the visible or hidden label and forwards the input ref", () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <ComboBox ref={ref} label="Record type" options={options} labelVisibility="visually-hidden" />
    );

    const input = screen.getByRole("combobox", { name: "Record type" });
    expect(ref.current).toBe(input);
    expect(
      screen
        .getByText("Record type")
        .closest(".om-combo-box__label")
        ?.getAttribute("data-om-label-visibility")
    ).toBe("visually-hidden");
  });

  it("supports placeholder, descriptions, errors, and invalid semantics", () => {
    render(
      <ComboBox
        label="Record type"
        options={options}
        placeholder="Select a record family"
        description="Choose from the local static options."
        isInvalid
        errorMessage="Record type is required."
      />
    );

    const input = screen.getByRole("combobox", { name: "Record type" });
    expect(input.getAttribute("placeholder")).toBe("Select a record family");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Choose from the local static options.")).toBeTruthy();
    expect(screen.getByText("Record type is required.")).toBeTruthy();
  });

  it("supports controlled and uncontrolled selected and input values", async () => {
    const user = userEvent.setup();
    const onSelectedValueChange = vi.fn();
    const onInputValueChange = vi.fn();

    function Controlled(): JSX.Element {
      const [selectedValue, setSelectedValue] = useState<string | null>("baptism");
      const [inputValue, setInputValue] = useState("Baptism");
      return (
        <ComboBox
          label="Controlled"
          options={options}
          selectedValue={selectedValue}
          onSelectedValueChange={(nextValue) => {
            onSelectedValueChange(nextValue);
            setSelectedValue(nextValue);
          }}
          inputValue={inputValue}
          onInputValueChange={(nextValue) => {
            onInputValueChange(nextValue);
            setInputValue(nextValue);
          }}
        />
      );
    }

    render(
      <>
        <Controlled />
        <ComboBox
          label="Uncontrolled selection"
          options={options}
          defaultSelectedValue="marriage"
        />
        <ComboBox label="Uncontrolled input" options={options} defaultInputValue="B" />
      </>
    );

    expect(screen.getByRole("combobox", { name: "Controlled" })).toHaveProperty("value", "Baptism");
    expect(screen.getByRole("combobox", { name: "Uncontrolled selection" })).toHaveProperty(
      "value",
      "Marriage"
    );
    expect(screen.getByRole("combobox", { name: "Uncontrolled input" })).toHaveProperty(
      "value",
      "B"
    );

    const controlled = screen.getByRole("combobox", { name: "Controlled" });
    await user.clear(controlled);
    await user.type(controlled, "Mar");
    expect(onInputValueChange).toHaveBeenCalled();
    expect(typeof onInputValueChange.mock.calls[0]?.[0]).toBe("string");

    const marriage = await screen.findByRole("option", { name: "Marriage" });
    await user.click(marriage);
    expect(onSelectedValueChange).toHaveBeenCalledWith("marriage");
  });

  it("submits only the committed selected value and not unmatched input text", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form aria-label="Record form">
        <ComboBox label="Record type" options={options} name="recordType" />
      </form>
    );

    const input = screen.getByRole("combobox", { name: "Record type" });
    await user.type(input, "Mar");
    expect(new FormData(getRequiredForm(container)).get("recordType")).toBe("");

    const marriage = await screen.findByRole("option", { name: "Marriage" });
    await user.click(marriage);
    expect(new FormData(getRequiredForm(container)).get("recordType")).toBe("marriage");
  });

  it("warns on unknown selected values, empty labels, duplicate values, and empty collections", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<ComboBox label="Unknown" options={options} selectedValue="unknown" />);
    expect(warn).toHaveBeenCalledWith(
      "ComboBox selectedValue does not match an option value: unknown"
    );

    cleanup();
    render(<ComboBox label="Empty" options={[]} />);
    expect(warn).toHaveBeenCalledWith("ComboBox options are empty.");

    cleanup();
    render(
      <ComboBox
        label="Invalid options"
        options={[
          { value: " ", label: "Blank" },
          { value: "duplicate", label: "First" },
          { value: "duplicate", label: "Second" }
        ]}
      />
    );
    expect(warn).toHaveBeenCalledWith("ComboBox options require non-empty string values.");
    expect(warn).toHaveBeenCalledWith("ComboBox option values must be unique: duplicate");
  });

  it("supports contains and starts-with filtering and preserves disabled options", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ComboBox label="Contains" options={options} filterMode="contains" />
        <ComboBox label="Starts with" options={options} filterMode="starts-with" />
      </>
    );

    const contains = screen.getByRole("combobox", { name: "Contains" });
    await user.click(contains);
    await user.type(contains, "ri");
    const containsOptions = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(containsOptions.map((option) => option.textContent)).toEqual(
      expect.arrayContaining(["Chrismation"])
    );

    await user.keyboard("{Escape}");
    const startsWith = screen.getByRole("combobox", { name: "Starts with" });
    await user.click(startsWith);
    await user.type(startsWith, "chr");
    const startsWithOptions = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(startsWithOptions.map((option) => option.textContent)).toEqual(
      expect.arrayContaining(["Chrismation"])
    );
  });

  it("supports disabled and read-only behavior distinctly", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ComboBox label="Disabled" options={options} isDisabled defaultSelectedValue="baptism" />
        <ComboBox label="Read only" options={options} isReadOnly defaultSelectedValue="baptism" />
      </>
    );

    const disabled = screen.getByRole("combobox", { name: "Disabled" });
    expect(disabled.getAttribute("disabled")).toBe("");
    await user.click(disabled).catch(() => undefined);
    expect(screen.queryByRole("listbox")).toBeNull();

    const readOnly = screen.getByRole("combobox", { name: "Read only" });
    readOnly.focus();
    expect(document.activeElement).toBe(readOnly);
    await user.type(readOnly, "Mar");
    expect(readOnly).toHaveProperty("value", "Baptism");
    await user.click(readOnly).catch(() => undefined);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports keyboard opening, selection, no-results, and empty-option states", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ComboBox label="Keyboard" options={options} />
        <ComboBox label="Empty options" options={[]} noResultsMessage="No configured options." />
      </>
    );

    const keyboard = screen.getByRole("combobox", { name: "Keyboard" });
    keyboard.focus();
    await user.keyboard("[ArrowDown]");
    expect(screen.getByRole("listbox")).toBeTruthy();
    await user.keyboard("[Enter]");
    expect(keyboard).toHaveProperty("value", "Baptism");

    const empty = screen.getByRole("combobox", { name: "Empty options" });
    await user.click(empty);
    await user.keyboard("[ArrowDown]");
    const noResults = screen.getByRole("status");
    expect(noResults.textContent).toBe("No configured options.");
    expect(noResults.closest('[role="option"]')).toBeNull();
  });

  it("keeps class-name escape hatches and SSR rendering intact", () => {
    const { container } = render(
      <ComboBox
        label="Styled"
        options={options}
        className="combo-root"
        inputClassName="combo-input"
        triggerClassName="combo-trigger"
        popoverClassName="combo-popover"
        listBoxClassName="combo-listbox"
      />
    );

    expect(container.querySelector(".combo-root")).not.toBeNull();
    expect(container.querySelector(".combo-input")).not.toBeNull();
    expect(container.querySelector(".combo-trigger")).not.toBeNull();
    expect(container.querySelector(".combo-popover")).toBeNull();
    expect(container.querySelector(".combo-listbox")).toBeNull();

    const markup = renderToString(<ComboBox label="Server combo" options={options} />);
    expect(markup).toContain("Server combo");
    expect(markup).toContain("Show options");
  });
});

function getRequiredForm(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector("form");
  if (form === null) {
    throw new Error("Expected a form.");
  }

  return form;
}
