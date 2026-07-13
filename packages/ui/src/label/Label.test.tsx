/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { Label } from "./Label.js";

afterEach(cleanup);

describe("Label", () => {
  it("renders a native label and associates through htmlFor", () => {
    render(<Label htmlFor="record-name">Record name</Label>);

    const label = screen.getByText("Record name").closest("label");
    expect(label?.tagName).toBe("LABEL");
    expect(label?.getAttribute("for")).toBe("record-name");
  });

  it("supports visible and visually hidden modes", () => {
    render(
      <>
        <Label>Visible label</Label>
        <Label visibility="visually-hidden">Hidden label</Label>
      </>
    );

    expect(screen.getByText("Visible label").closest("label")?.dataset.omLabelVisibility).toBe(
      "visible"
    );
    expect(screen.getByText("Hidden label").closest("label")?.dataset.omLabelVisibility).toBe(
      "visually-hidden"
    );
  });

  it("represents required state without relying only on color", () => {
    render(<Label isRequired>Required label</Label>);

    const label = screen.getByText("Required label").closest("label");
    expect(label?.getAttribute("data-om-required")).toBe("true");
    expect(label?.textContent).toContain("*");
    expect(label?.querySelector(".om-field__required-marker")?.getAttribute("aria-hidden")).toBe(
      "true"
    );
  });

  it("forwards ref and preserves plain class name", () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <Label ref={ref} className="custom-label">
        Name
      </Label>
    );

    expect(ref.current?.tagName).toBe("LABEL");
    expect(ref.current?.classList.contains("om-field__label")).toBe(true);
    expect(ref.current?.classList.contains("custom-label")).toBe(true);
  });
});
