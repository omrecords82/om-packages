/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Select } from "./Select.js";

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

describe("Select", () => {
  it("renders a visible trigger button with an associated visible label", () => {
    render(<Select label="Record type" options={options} />);

    expect(screen.getByRole("button", { name: /Record type/u }).tagName).toBe("BUTTON");
    expect(screen.getByText("Select an option")).not.toBeNull();
  });

  it("supports visually hidden labels, descriptions, errors, and invalid semantics", () => {
    render(
      <Select
        label="Hidden record type"
        labelVisibility="visually-hidden"
        options={options}
        description="Choose the record family."
        isInvalid
        errorMessage="Record type is required."
      />
    );

    const trigger = screen.getByRole("button", { name: /Hidden record type/u });
    expect(getDescribedText(trigger)).toContain("Choose the record family.");
    expect(trigger.dataset.omInvalid).toBe("true");
    expect(screen.getByText("Record type is required.")).not.toBeNull();
    expect(
      screen
        .getByText("Hidden record type")
        .closest(".om-select__label")
        ?.getAttribute("data-om-label-visibility")
    ).toBe("visually-hidden");
  });

  it("does not treat errorMessage alone as application invalid state", () => {
    render(
      <Select label="Optional record type" options={options} errorMessage="Inactive error." />
    );

    const trigger = screen.getByRole("button", { name: /Optional record type/u });
    expect(trigger.getAttribute("aria-invalid")).not.toBe("true");
    expect(screen.queryByText("Inactive error.")).toBeNull();
  });

  it("supports controlled and uncontrolled string values with string callbacks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled(): JSX.Element {
      const [value, setValue] = useState<string | null>("baptism");
      return (
        <Select
          label="Controlled"
          options={options}
          value={value}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
        />
      );
    }

    render(
      <>
        <Controlled />
        <Select label="Uncontrolled" options={options} defaultValue="marriage" />
      </>
    );

    expect(screen.getByRole("button", { name: /Controlled/u }).textContent).toContain("Baptism");
    expect(screen.getByRole("button", { name: /Uncontrolled/u }).textContent).toContain("Marriage");

    await user.click(screen.getByRole("button", { name: /Controlled/u }));
    await user.click(screen.getByRole("option", { name: "Marriage" }));
    expect(onValueChange).toHaveBeenCalledWith("marriage");
    expect(onValueChange.mock.calls[0]?.[0]).not.toHaveProperty("target");
  });

  it("preserves explicit null and omits placeholder as a submitted value", () => {
    const { container } = render(
      <form aria-label="Record form">
        <Select label="Record type" options={options} name="recordType" value={null} />
      </form>
    );

    expect(screen.getByText("Select an option")).not.toBeNull();
    expect(new FormData(getRequiredForm(container)).get("recordType")).toBeNull();
  });

  it("submits the selected string value through hidden form integration", () => {
    const { container } = render(
      <form aria-label="Record form">
        <Select label="Record type" options={options} name="recordType" defaultValue="baptism" />
      </form>
    );

    expect(new FormData(getRequiredForm(container)).get("recordType")).toBe("baptism");
  });

  it("validates option values, labels, duplicates, and unknown default values", () => {
    expect(() =>
      render(<Select label="Invalid value" options={[{ value: " ", label: "Blank" }]} />)
    ).toThrow(/non-empty string values/u);
    expect(() =>
      render(<Select label="Invalid label" options={[{ value: "blank", label: " " }]} />)
    ).toThrow(/non-empty labels/u);
    expect(() =>
      render(
        <Select
          label="Duplicate"
          options={[
            { value: "same", label: "First" },
            { value: "same", label: "Second" }
          ]}
        />
      )
    ).toThrow(/unique/u);
    expect(() =>
      render(<Select label="Unknown default" options={options} defaultValue="unknown" />)
    ).toThrow(/defaultValue/u);
  });

  it("warns on unknown controlled values and renders no selected option", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<Select label="Unknown controlled" options={options} value="unknown" />);

    expect(warn).toHaveBeenCalledWith("Select value does not match an option value: unknown");
    expect(screen.getByText("Select an option")).not.toBeNull();
  });

  it("blocks disabled and read-only interaction while preserving read-only focus", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    const onReadOnly = vi.fn();
    render(
      <>
        <Select label="Disabled" options={options} isDisabled onValueChange={onDisabled} />
        <Select
          label="Read only"
          options={options}
          defaultValue="baptism"
          isReadOnly
          onValueChange={onReadOnly}
        />
      </>
    );

    await user.click(screen.getByRole("button", { name: /Disabled/u }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onDisabled).not.toHaveBeenCalled();

    const readOnly = screen.getByRole("button", { name: /Read only/u });
    readOnly.focus();
    expect(document.activeElement).toBe(readOnly);
    await user.click(readOnly);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onReadOnly).not.toHaveBeenCalled();
    expect(readOnly.getAttribute("aria-disabled")).toBe("true");
    expect(readOnly.dataset.omReadOnly).toBe("true");
  });

  it("prevents disabled options from being selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select label="Record type" options={options} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: /Record type/u }));
    const listbox = screen.getByRole("listbox");
    const disabledOption = within(listbox).getByRole("option", { name: "Chrismation" });
    expect(disabledOption.getAttribute("aria-disabled")).toBe("true");
    await user.click(disabledOption);
    expect(onValueChange).not.toHaveBeenCalledWith("chrismation");
  });

  it("supports keyboard opening, navigation, selection, and dismissal", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select label="Keyboard record type" options={options} onValueChange={onValueChange} />);

    const trigger = screen.getByRole("button", { name: /Keyboard record type/u });
    trigger.focus();
    await user.keyboard("[Enter]");
    expect(screen.getByRole("listbox")).not.toBeNull();
    await user.keyboard("[ArrowDown]");
    await user.keyboard("[Enter]");
    expect(onValueChange).toHaveBeenCalledWith("marriage");

    trigger.focus();
    await user.keyboard("[Space]");
    expect(screen.getByRole("listbox")).not.toBeNull();
    await user.keyboard("[Escape]");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports required state, classes, id, size attributes, and ref forwarding", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select
        ref={ref}
        label="Reference"
        options={options}
        id="record-type-trigger"
        isRequired
        size="lg"
        className="select-root"
        triggerClassName="select-trigger"
        popoverClassName="select-popover"
        listBoxClassName="select-listbox"
      />
    );

    const trigger = screen.getByRole("button", { name: /Reference/u });
    expect(ref.current).toBe(trigger);
    expect(trigger.getAttribute("id")).toBe("record-type-trigger");
    expect(trigger.dataset.omRequired).toBe("true");
    expect(trigger.classList.contains("select-trigger")).toBe(true);
    expect(trigger.closest(".om-select")?.classList.contains("select-root")).toBe(true);
    expect(trigger.closest(".om-select")?.getAttribute("data-om-size")).toBe("lg");
  });

  it("renders empty-options state without creating selectable fake options", async () => {
    const user = userEvent.setup();
    render(<Select label="Empty records" options={[]} description="No configured record types." />);

    const trigger = screen.getByRole("button", { name: /Empty records/u });
    expect(trigger.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("No options available")).not.toBeNull();
    await user.click(trigger).catch(() => undefined);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("server-renders without browser globals", () => {
    expect(renderToString(<Select label="Server select" options={options} />)).toContain(
      "Server select"
    );
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

function getRequiredForm(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector("form");
  if (form === null) {
    throw new Error("Expected test form to be rendered.");
  }

  return form;
}
