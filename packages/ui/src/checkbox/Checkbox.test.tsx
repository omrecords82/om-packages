/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Checkbox } from "./Checkbox.js";

afterEach(cleanup);

describe("Checkbox", () => {
  it("renders checkbox semantics and child content as the accessible name", () => {
    render(<Checkbox>Include archived records</Checkbox>);

    expect(screen.getByRole("checkbox", { name: "Include archived records" })).not.toBeNull();
  });

  it("supports controlled and uncontrolled selection with boolean callbacks", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    function Controlled(): JSX.Element {
      const [selected, setSelected] = useState(false);
      return (
        <Checkbox
          isSelected={selected}
          onSelectionChange={(nextSelected) => {
            onSelectionChange(nextSelected);
            setSelected(nextSelected);
          }}
        >
          Controlled
        </Checkbox>
      );
    }

    render(
      <>
        <Controlled />
        <Checkbox defaultSelected>Uncontrolled</Checkbox>
      </>
    );

    const controlled = screen.getByRole("checkbox", { name: "Controlled" });
    const uncontrolled = screen.getByRole("checkbox", { name: "Uncontrolled" });
    expect(controlled.checked).toBe(false);
    expect(uncontrolled.checked).toBe(true);
    await user.click(controlled);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
    expect(controlled.checked).toBe(true);
  });

  it("supports pointer and Space activation", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Checkbox onSelectionChange={onSelectionChange}>Keyboard option</Checkbox>);

    const checkbox = screen.getByRole("checkbox", { name: "Keyboard option" });
    await user.click(checkbox);
    await user.keyboard("[Space]");
    expect(onSelectionChange).toHaveBeenCalledWith(true);
    expect(onSelectionChange).toHaveBeenCalledWith(false);
  });

  it("blocks disabled and read-only changes", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    const onReadOnly = vi.fn();
    render(
      <>
        <Checkbox isDisabled onSelectionChange={onDisabled}>
          Disabled
        </Checkbox>
        <Checkbox isReadOnly onSelectionChange={onReadOnly}>
          Read only
        </Checkbox>
      </>
    );

    await user.click(screen.getByRole("checkbox", { name: "Disabled" }));
    await user.click(screen.getByRole("checkbox", { name: "Read only" }));
    expect(onDisabled).not.toHaveBeenCalled();
    expect(onReadOnly).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox", { name: "Disabled" }).disabled).toBe(true);
    expect(
      screen.getByRole("checkbox", { name: "Read only" }).closest(".om-checkbox")?.dataset
        .omReadOnly
    ).toBe("true");
  });

  it("supports required, invalid, description, active errors, and inactive errors", () => {
    render(
      <>
        <Checkbox
          isRequired
          isInvalid
          description="Checkbox description."
          errorMessage="Checkbox error."
        >
          Invalid option
        </Checkbox>
        <Checkbox errorMessage="Inactive error.">Inactive option</Checkbox>
      </>
    );

    const checkbox = screen.getByRole("checkbox", { name: "Invalid option" });
    expect(checkbox.hasAttribute("required")).toBe(true);
    expect(checkbox.getAttribute("aria-invalid")).toBe("true");
    expect(getDescribedText(checkbox)).toContain("Checkbox description.");
    expect(getDescribedText(checkbox)).toContain("Checkbox error.");
    expect(screen.queryByText("Inactive error.")).toBeNull();
  });

  it("supports indeterminate state, attributes, classes, and ref forwarding", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        isIndeterminate
        size="lg"
        className="root-class"
        controlClassName="control-class"
      >
        Mixed option
      </Checkbox>
    );

    const checkbox = screen.getByRole("checkbox", { name: "Mixed option" });
    expect(ref.current).toBe(checkbox);
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.closest(".om-checkbox")?.getAttribute("data-om-size")).toBe("lg");
    expect(checkbox.closest(".om-checkbox")?.classList.contains("root-class")).toBe(true);
    expect(
      screen
        .getByText("Mixed option")
        .closest(".om-selection-control__button")
        ?.classList.contains("control-class")
    ).toBe(true);
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}
