/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TextField } from "./TextField.js";

afterEach(cleanup);

describe("TextField", () => {
  it("renders a native input, defaults to text, and associates a visible label", () => {
    render(<TextField label="Full name" />);

    const input = screen.getByRole("textbox", { name: "Full name" });
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("type")).toBe("text");
  });

  it("supports visually hidden labels, descriptions, errors, and invalid semantics", () => {
    render(
      <TextField
        label="Record search"
        labelVisibility="visually-hidden"
        description="Search by record name."
        isInvalid
        errorMessage="Record search is invalid."
      />
    );

    const input = screen.getByRole("textbox", { name: "Record search" });
    expect(getDescribedText(input)).toContain("Search by record name.");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Record search is invalid.").textContent).toBe(
      "Record search is invalid."
    );
    expect(screen.getByText("Record search").closest("label")?.dataset.omLabelVisibility).toBe(
      "visually-hidden"
    );
  });

  it("does not treat errorMessage alone as application invalid state", () => {
    render(<TextField label="Optional code" errorMessage="Not shown until invalid." />);

    const input = screen.getByRole("textbox", { name: "Optional code" });
    expect(input.getAttribute("aria-invalid")).not.toBe("true");
    expect(screen.queryByText("Not shown until invalid.")).toBeNull();
  });

  it("supports required, disabled, read-only, form, name, pattern, length, and class attrs", async () => {
    const user = userEvent.setup();
    render(
      <TextField
        label="Email"
        name="email"
        form="profile-form"
        placeholder="name@example.test"
        type="email"
        inputMode="email"
        autoComplete="email"
        pattern=".+@.+"
        minLength={3}
        maxLength={40}
        isRequired
        isDisabled
        className="field-root"
        controlClassName="field-control"
      />
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect((input as HTMLInputElement).disabled).toBe(true);
    await user.type(input, "test@example.test");
    expect((input as HTMLInputElement).value).toBe("");
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("name")).toBe("email");
    expect(input.getAttribute("form")).toBe("profile-form");
    expect(input.getAttribute("type")).toBe("email");
    expect(input.getAttribute("inputmode")).toBe("email");
    expect(input.getAttribute("autocomplete")).toBe("email");
    expect(input.getAttribute("pattern")).toBe(".+@.+");
    expect(input.getAttribute("minlength")).toBe("3");
    expect(input.getAttribute("maxlength")).toBe("40");
    expect(input.classList.contains("field-control")).toBe(true);
    expect(input.closest(".om-field")?.classList.contains("field-root")).toBe(true);
  });

  it("keeps read-only input focusable but unchanged", async () => {
    const user = userEvent.setup();
    render(<TextField label="Reference" defaultValue="ABC" isReadOnly />);

    const input = screen.getByRole("textbox", { name: "Reference" });
    input.focus();
    expect(document.activeElement).toBe(input);
    await user.type(input, "DEF");
    expect((input as HTMLInputElement).value).toBe("ABC");
    expect(input.hasAttribute("readonly")).toBe(true);
  });

  it("supports controlled, uncontrolled, empty-string, and string value callbacks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled(): JSX.Element {
      const [value, setValue] = useState("");
      return (
        <TextField
          label="Controlled"
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
        <TextField label="Uncontrolled" defaultValue="Initial" />
      </>
    );

    const controlled = screen.getByRole("textbox", { name: "Controlled" });
    const uncontrolled = screen.getByRole("textbox", { name: "Uncontrolled" });
    expect((controlled as HTMLInputElement).value).toBe("");
    expect((uncontrolled as HTMLInputElement).value).toBe("Initial");
    await user.type(controlled, "A");
    expect(onValueChange).toHaveBeenCalledWith("A");
    expect((controlled as HTMLInputElement).value).toBe("A");
  });

  it("supports text input types, size attributes, and ref forwarding", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <>
        <TextField ref={ref} label="Search" type="search" size="lg" />
        <TextField label="Password" type="password" />
        <TextField label="Phone" type="tel" />
        <TextField label="Website" type="url" />
        <TextField label="Text" type="text" />
      </>
    );

    expect(ref.current?.tagName).toBe("INPUT");
    expect(screen.getByRole("searchbox", { name: "Search" }).getAttribute("type")).toBe("search");
    expect(screen.getByLabelText("Password").getAttribute("type")).toBe("password");
    expect(screen.getByRole("textbox", { name: "Phone" }).getAttribute("type")).toBe("tel");
    expect(screen.getByRole("textbox", { name: "Website" }).getAttribute("type")).toBe("url");
    expect(screen.getByRole("textbox", { name: "Text" }).closest(".om-field")?.dataset.omSize).toBe(
      "md"
    );
  });

  it("server-renders without browser globals", () => {
    expect(renderToString(<TextField label="Server field" />)).toContain("Server field");
  });
});

function getDescribedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}
