/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch.js";

afterEach(cleanup);

describe("Switch", () => {
  it("renders switch semantics and child content as the accessible name", () => {
    render(<Switch>Enable notifications</Switch>);

    expect(screen.getByRole("switch", { name: "Enable notifications" })).not.toBeNull();
  });

  it("supports controlled and uncontrolled state with boolean callbacks", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    function Controlled(): JSX.Element {
      const [selected, setSelected] = useState(false);
      return (
        <Switch
          isSelected={selected}
          onSelectionChange={(nextSelected) => {
            onSelectionChange(nextSelected);
            setSelected(nextSelected);
          }}
        >
          Controlled
        </Switch>
      );
    }

    render(
      <>
        <Controlled />
        <Switch defaultSelected>Uncontrolled</Switch>
      </>
    );

    const controlled = screen.getByRole("switch", { name: "Controlled" });
    expect(controlled.checked).toBe(false);
    expect(screen.getByRole("switch", { name: "Uncontrolled" }).checked).toBe(true);
    await user.click(controlled);
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it("supports pointer and Space activation", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<Switch onSelectionChange={onSelectionChange}>Keyboard switch</Switch>);

    const control = screen.getByRole("switch", { name: "Keyboard switch" });
    await user.click(control);
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
        <Switch isDisabled onSelectionChange={onDisabled}>
          Disabled
        </Switch>
        <Switch isReadOnly onSelectionChange={onReadOnly}>
          Read only
        </Switch>
      </>
    );

    await user.click(screen.getByRole("switch", { name: "Disabled" }));
    await user.click(screen.getByRole("switch", { name: "Read only" }));
    expect(onDisabled).not.toHaveBeenCalled();
    expect(onReadOnly).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { name: "Disabled" }).disabled).toBe(true);
    expect(
      screen.getByRole("switch", { name: "Read only" }).closest(".om-switch")?.dataset.omReadOnly
    ).toBe("true");
  });

  it("supports required, invalid, description, active errors, and inactive errors", () => {
    render(
      <>
        <Switch isRequired isInvalid description="Switch description." errorMessage="Switch error.">
          Invalid switch
        </Switch>
        <Switch errorMessage="Inactive error.">Inactive switch</Switch>
      </>
    );

    const control = screen.getByRole("switch", { name: "Invalid switch" });
    expect(control.hasAttribute("required")).toBe(true);
    expect(control.getAttribute("aria-invalid")).toBe("true");
    expect(getDescribedText(control)).toContain("Switch description.");
    expect(getDescribedText(control)).toContain("Switch error.");
    expect(screen.queryByText("Inactive error.")).toBeNull();
  });

  it("supports selected state attributes, size, classes, and ref forwarding", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Switch
        ref={ref}
        defaultSelected
        size="lg"
        className="root-class"
        controlClassName="control-class"
      >
        Selected switch
      </Switch>
    );

    const control = screen.getByRole("switch", { name: "Selected switch" });
    expect(ref.current).toBe(control);
    expect(control.checked).toBe(true);
    expect(control.closest(".om-switch")?.getAttribute("data-om-size")).toBe("lg");
    expect(control.closest(".om-switch")?.classList.contains("root-class")).toBe(true);
    expect(
      screen
        .getByText("Selected switch")
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
