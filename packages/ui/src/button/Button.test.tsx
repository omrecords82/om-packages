/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./Button.js";

afterEach(cleanup);

describe("Button", () => {
  it("renders as a native button and defaults to type button", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("supports submit and reset button types", () => {
    render(
      <>
        <Button type="submit">Submit</Button>
        <Button type="reset">Reset</Button>
      </>
    );

    expect(screen.getByRole("button", { name: "Submit" }).getAttribute("type")).toBe("submit");
    expect(screen.getByRole("button", { name: "Reset" }).getAttribute("type")).toBe("reset");
  });

  it("invokes onAction for pointer and keyboard activation", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Button onAction={onAction}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));
    screen.getByRole("button", { name: "Save" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onAction).toHaveBeenCalledTimes(3);
  });

  it("blocks action when disabled or pending", async () => {
    const user = userEvent.setup();
    const disabledAction = vi.fn();
    const pendingAction = vi.fn();
    render(
      <>
        <Button isDisabled onAction={disabledAction}>
          Disabled
        </Button>
        <Button isPending onAction={pendingAction}>
          Pending action
        </Button>
      </>
    );

    await user.click(screen.getByRole("button", { name: "Disabled" }));
    await user.click(screen.getByRole("button", { name: "Pending action" }));

    expect(disabledAction).not.toHaveBeenCalled();
    expect(pendingAction).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Pending");
    expect(
      screen.getByRole("button", { name: "Pending action" }).hasAttribute("data-pending")
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Pending action" }).getAttribute("data-om-pending")
    ).toBe("true");
  });

  it("applies accessible label, attributes, form fields, class names, and ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button
        ref={ref}
        accessibleLabel="Run report"
        className="custom-button"
        form="report-form"
        fullWidth
        name="intent"
        size="lg"
        value="run"
        variant="secondary"
      >
        Run
      </Button>
    );

    const button = screen.getByRole("button", { name: "Run report" });
    expect(button.getAttribute("data-om-variant")).toBe("secondary");
    expect(button.getAttribute("data-om-size")).toBe("lg");
    expect(button.getAttribute("data-om-full-width")).toBe("true");
    expect(button.getAttribute("form")).toBe("report-form");
    expect(button.getAttribute("name")).toBe("intent");
    expect(button.getAttribute("value")).toBe("run");
    expect(button.classList.contains("om-button")).toBe(true);
    expect(button.classList.contains("custom-button")).toBe(true);
    expect(ref.current).toBe(button);
  });
});
