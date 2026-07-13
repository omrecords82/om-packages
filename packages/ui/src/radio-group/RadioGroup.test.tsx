/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Radio } from "../radio/index.js";
import { RadioGroup } from "./RadioGroup.js";

afterEach(cleanup);

describe("RadioGroup", () => {
  it("renders radiogroup semantics and an accessible group label", () => {
    render(
      <RadioGroup label="Record type">
        <Radio value="baptism">Baptism</Radio>
      </RadioGroup>
    );

    expect(screen.getByRole("radiogroup", { name: "Record type" })).not.toBeNull();
  });

  it("supports controlled value, uncontrolled default value, and string callbacks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled(): JSX.Element {
      const [value, setValue] = useState("baptism");
      return (
        <RadioGroup
          label="Controlled"
          value={value}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
        >
          <Radio value="baptism">Baptism</Radio>
          <Radio value="marriage">Marriage</Radio>
        </RadioGroup>
      );
    }

    render(
      <>
        <Controlled />
        <RadioGroup label="Uncontrolled" defaultValue="memorial">
          <Radio value="memorial">Memorial</Radio>
          <Radio value="chrismation">Chrismation</Radio>
        </RadioGroup>
      </>
    );

    await user.click(screen.getByRole("radio", { name: "Marriage" }));
    expect(onValueChange).toHaveBeenCalledWith("marriage");
    expect(screen.getByRole("radio", { name: "Marriage" }).checked).toBe(true);
    expect(screen.getByRole("radio", { name: "Memorial" }).checked).toBe(true);
  });

  it("supports one selected radio and arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup label="Record type" defaultValue="baptism">
        <Radio value="baptism">Baptism</Radio>
        <Radio value="marriage">Marriage</Radio>
      </RadioGroup>
    );

    const first = screen.getByRole("radio", { name: "Baptism" });
    const second = screen.getByRole("radio", { name: "Marriage" });
    first.focus();
    await user.keyboard("[ArrowDown]");
    expect(second.checked).toBe(true);
    expect(first.checked).toBe(false);
  });

  it("blocks disabled and read-only group interaction", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    const onReadOnly = vi.fn();
    render(
      <>
        <RadioGroup label="Disabled" isDisabled onValueChange={onDisabled}>
          <Radio value="one">Disabled one</Radio>
        </RadioGroup>
        <RadioGroup label="Read only" isReadOnly defaultValue="one" onValueChange={onReadOnly}>
          <Radio value="one">Read-only one</Radio>
          <Radio value="two">Read-only two</Radio>
        </RadioGroup>
      </>
    );

    await user.click(screen.getByRole("radio", { name: "Disabled one" }));
    await user.click(screen.getByRole("radio", { name: "Read-only two" }));
    expect(onDisabled).not.toHaveBeenCalled();
    expect(onReadOnly).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: "Disabled one" }).disabled).toBe(true);
    expect(
      screen.getByRole("radiogroup", { name: "Read only" }).getAttribute("data-om-read-only")
    ).toBe("true");
  });

  it("supports orientation, description, required, active errors, and inactive errors", () => {
    render(
      <>
        <RadioGroup
          label="Invalid"
          orientation="horizontal"
          isRequired
          isInvalid
          description="Group description."
          errorMessage="Group error."
        >
          <Radio value="one">One</Radio>
          <Radio value="two">Two</Radio>
        </RadioGroup>
        <RadioGroup label="Inactive" errorMessage="Inactive error.">
          <Radio value="inactive">Inactive</Radio>
        </RadioGroup>
      </>
    );

    const group = screen.getByRole("radiogroup", { name: "Invalid" });
    expect(group.getAttribute("aria-orientation")).toBe("horizontal");
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(getDescribedText(group)).toContain("Group description.");
    expect(getDescribedText(group)).toContain("Group error.");
    expect(screen.queryByText("Inactive error.")).toBeNull();
  });

  it("rejects empty and duplicate radio values", () => {
    expect(() =>
      render(
        <RadioGroup label="Duplicate">
          <Radio value="same">Same A</Radio>
          <Radio value="same">Same B</Radio>
        </RadioGroup>
      )
    ).toThrow("RadioGroup radio values must be unique: same");
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}
