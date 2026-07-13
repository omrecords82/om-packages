/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RadioGroup } from "../radio-group/index.js";
import { Radio } from "./Radio.js";

afterEach(cleanup);

describe("Radio", () => {
  it("renders correctly inside RadioGroup with child content as the accessible name", () => {
    render(
      <RadioGroup label="Record type">
        <Radio value="baptism">Baptism</Radio>
      </RadioGroup>
    );

    expect(screen.getByRole("radio", { name: "Baptism" })).not.toBeNull();
  });

  it("requires a non-empty value", () => {
    expect(() =>
      render(
        <RadioGroup label="Record type">
          <Radio value="">Empty</Radio>
        </RadioGroup>
      )
    ).toThrow("non-empty");
  });

  it("does not allow disabled items to be selected and associates descriptions", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Record type" onValueChange={onValueChange}>
        <Radio value="baptism">Baptism</Radio>
        <Radio value="chrismation" isDisabled description="Disabled option description.">
          Chrismation
        </Radio>
      </RadioGroup>
    );

    const disabled = screen.getByRole("radio", { name: "Chrismation" });
    await user.click(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
    expect((disabled as HTMLInputElement).disabled).toBe(true);
    expect(getDescribedText(disabled)).toContain("Disabled option description.");
  });

  it("forwards ref to the native radio input and does not duplicate accessible names", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <RadioGroup label="Record type">
        <Radio ref={ref} value="baptism">
          Baptism
        </Radio>
      </RadioGroup>
    );

    const radio = screen.getByRole("radio", { name: "Baptism" });
    expect(ref.current).toBe(radio);
    expect(screen.getAllByRole("radio", { name: "Baptism" })).toHaveLength(1);
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}
