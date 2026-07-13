/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { Dialog } from "./Dialog.js";

afterEach(cleanup);

describe("Dialog", () => {
  it("renders the supplied trigger and opens uncontrolled", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Details" description="Record details" trigger={<Button>Open details</Button>}>
        <p>Dialog body</p>
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open details" }));

    const dialog = await screen.findByRole("dialog", { name: "Details" });
    expect(getDescribedText(dialog)).toContain("Record details");
    expect(screen.getByText("Dialog body")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close dialog" })).not.toBeNull();
  });

  it("supports controlled open state and boolean open-change callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog title="Controlled" isOpen onOpenChange={onOpenChange}>
        Controlled body
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls[0]?.[0]).toEqual(expect.any(Boolean));
  });

  it("does not render empty description or footer markup", () => {
    render(
      <Dialog title="No description" isOpen>
        Body
      </Dialog>
    );

    expect(screen.getByRole("dialog", { name: "No description" })).not.toBeNull();
    expect(document.querySelector(".om-dialog__description")).toBeNull();
    expect(document.querySelector(".om-dialog__footer")).toBeNull();
  });

  it("renders footer, sizes, class names, and forwards the surface ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog
        ref={ref}
        title="Configured"
        isOpen
        size="xl"
        className="custom-dialog"
        overlayClassName="custom-overlay"
        surfaceClassName="custom-surface"
        bodyClassName="custom-body"
        footerClassName="custom-footer"
        footer={<Button>Done</Button>}
      >
        Body
      </Dialog>
    );

    expect(screen.getByRole("dialog", { name: "Configured" }).classList).toContain("custom-dialog");
    expect(document.querySelector(".om-dialog__overlay")?.classList).toContain("custom-overlay");
    expect(ref.current?.classList).toContain("custom-surface");
    expect(ref.current?.getAttribute("data-om-size")).toBe("xl");
    expect(document.querySelector(".om-dialog__body")?.classList).toContain("custom-body");
    expect(document.querySelector(".om-dialog__footer")?.classList).toContain("custom-footer");
  });

  it("closes through close button and Escape when enabled", async () => {
    const user = userEvent.setup();
    render(
      <Dialog title="Dismissible" trigger={<Button>Open dismissible</Button>}>
        Body
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open dismissible" }));
    await user.click(await screen.findByRole("button", { name: "Close dialog" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Open dismissible" }));
    await screen.findByRole("dialog", { name: "Dismissible" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("respects disabled keyboard dismissal", async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        title="Keyboard locked"
        trigger={<Button>Open keyboard locked</Button>}
        isKeyboardDismissDisabled
      >
        Body
      </Dialog>
    );

    await user.click(screen.getByRole("button", { name: "Open keyboard locked" }));
    await screen.findByRole("dialog", { name: "Keyboard locked" });
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog", { name: "Keyboard locked" })).not.toBeNull();
  });

  it("traps focus and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        title="Focus"
        trigger={<Button className="open-focus">Open focus dialog</Button>}
        footer={<Button>Footer action</Button>}
      >
        <Button>Body action</Button>
      </Dialog>
    );

    const trigger = screen.getByRole("button", { name: "Open focus dialog" });
    await user.click(trigger);
    await screen.findByRole("dialog", { name: "Focus" });
    await waitFor(() => expect(document.activeElement).not.toBe(trigger));
    await user.tab();
    expect(screen.getByRole("dialog", { name: "Focus" }).contains(document.activeElement)).toBe(
      true
    );
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("warns for unreachable closed triggerless uncontrolled usage", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Dialog title="Unreachable">Body</Dialog>);

    expect(warning).toHaveBeenCalledWith(
      "Dialog without a trigger must be controlled with isOpen or rendered initially open."
    );
    warning.mockRestore();
  });
});

function getDescribedText(element: HTMLElement): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/u) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
}
