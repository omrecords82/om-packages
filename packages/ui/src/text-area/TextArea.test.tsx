/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TextArea } from "./TextArea.js";

afterEach(cleanup);

describe("TextArea", () => {
  it("renders a native textarea and associates a visible label", () => {
    render(<TextArea label="Notes" />);

    expect(screen.getByRole("textbox", { name: "Notes" }).tagName).toBe("TEXTAREA");
  });

  it("supports visually hidden label, description, errors, and invalid semantics", () => {
    render(
      <TextArea
        label="Private notes"
        labelVisibility="visually-hidden"
        description="Internal notes."
        isInvalid
        errorMessage="Notes are invalid."
      />
    );

    const area = screen.getByRole("textbox", { name: "Private notes" });
    expect(getDescribedText(area)).toContain("Internal notes.");
    expect(area.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Notes are invalid.").textContent).toBe("Notes are invalid.");
  });

  it("does not treat errorMessage alone as application invalid state", () => {
    render(<TextArea label="Optional notes" errorMessage="Not shown until invalid." />);

    const area = screen.getByRole("textbox", { name: "Optional notes" });
    expect(area.getAttribute("aria-invalid")).not.toBe("true");
    expect(screen.queryByText("Not shown until invalid.")).toBeNull();
  });

  it("supports required, disabled, read-only, rows, resize, form, name, and length attrs", async () => {
    const user = userEvent.setup();
    render(
      <TextArea
        label="Summary"
        name="summary"
        form="summary-form"
        minLength={3}
        maxLength={80}
        rows={4}
        resize="both"
        isRequired
        isDisabled
      />
    );

    const area = screen.getByRole("textbox", { name: "Summary" });
    expect((area as HTMLTextAreaElement).disabled).toBe(true);
    await user.type(area, "Blocked");
    expect((area as HTMLTextAreaElement).value).toBe("");
    expect(area.hasAttribute("required")).toBe(true);
    expect(area.getAttribute("rows")).toBe("4");
    expect(area.getAttribute("name")).toBe("summary");
    expect(area.getAttribute("form")).toBe("summary-form");
    expect(area.getAttribute("minlength")).toBe("3");
    expect(area.getAttribute("maxlength")).toBe("80");
    expect(area.closest(".om-field")?.getAttribute("data-om-resize")).toBe("both");
  });

  it("supports controlled, uncontrolled, callbacks, read-only, class names, and refs", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const ref = createRef<HTMLTextAreaElement>();
    function Controlled(): JSX.Element {
      const [value, setValue] = useState("");
      return (
        <TextArea
          ref={ref}
          label="Controlled notes"
          value={value}
          className="area-root"
          controlClassName="area-control"
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
        <TextArea label="Uncontrolled notes" defaultValue="Initial" isReadOnly resize="none" />
      </>
    );

    const controlled = screen.getByRole("textbox", { name: "Controlled notes" });
    await user.type(controlled, "Line one{Enter}Line two");
    expect(onValueChange).toHaveBeenLastCalledWith("Line one\nLine two");
    expect(ref.current).toBe(controlled);
    expect(controlled.closest(".om-field")?.classList.contains("area-root")).toBe(true);
    expect(controlled.classList.contains("area-control")).toBe(true);

    const readOnly = screen.getByRole("textbox", { name: "Uncontrolled notes" });
    readOnly.focus();
    expect(document.activeElement).toBe(readOnly);
    await user.type(readOnly, " blocked");
    expect((readOnly as HTMLTextAreaElement).value).toBe("Initial");
    expect(readOnly.closest(".om-field")?.getAttribute("data-om-resize")).toBe("none");
  });

  it("rejects invalid rows", () => {
    expect(() => render(<TextArea label="Invalid rows" rows={0} />)).toThrow(
      "TextArea rows must be a positive integer."
    );
  });

  it("supports resize modes, sizes, and server rendering", () => {
    render(
      <>
        <TextArea label="Vertical" resize="vertical" size="sm" />
        <TextArea label="Horizontal" resize="horizontal" size="lg" />
      </>
    );

    expect(
      screen.getByRole("textbox", { name: "Vertical" }).closest(".om-field")?.dataset.omResize
    ).toBe("vertical");
    expect(
      screen.getByRole("textbox", { name: "Horizontal" }).closest(".om-field")?.dataset.omSize
    ).toBe("lg");
    expect(renderToString(<TextArea label="Server area" />)).toContain("Server area");
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}
