/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { AlertDialog } from "./AlertDialog.js";

afterEach(cleanup);

describe("AlertDialog", () => {
  it("opens from a trigger with alert-dialog semantics and associated text", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog
        title="Delete item?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={vi.fn()}
        trigger={<Button variant="destructive">Delete</Button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("alertdialog", { name: "Delete item?" });
    expect(getDescribedText(dialog)).toContain("This action cannot be undone.");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
  });

  it("allows explicit confirm focus without making destructive focus automatic", async () => {
    const user = userEvent.setup();
    render(
      <>
        <AlertDialog
          title="Confirm focus"
          description="Confirm focus is explicit."
          confirmLabel="Proceed"
          initialFocus="confirm"
          onConfirm={vi.fn()}
          trigger={<Button>Open confirm focus</Button>}
        />
        <AlertDialog
          title="Destructive"
          description="Destructive still starts at cancel."
          confirmLabel="Delete"
          intent="destructive"
          onConfirm={vi.fn()}
          trigger={<Button>Open destructive</Button>}
        />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Open confirm focus" }));
    expect(document.activeElement).toBe(await screen.findByRole("button", { name: "Proceed" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Open destructive" }));
    expect(document.activeElement).toBe(await screen.findByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete" }).getAttribute("data-om-variant")).toBe(
      "destructive"
    );
  });

  it("invokes confirm and cancel callbacks without events", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <AlertDialog
        title="Confirm"
        description="Confirm action."
        confirmLabel="Confirm"
        onConfirm={onConfirm}
        onCancel={onCancel}
        trigger={<Button>Open confirm</Button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open confirm" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Open confirm" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledWith();
  });

  it("supports manual close confirmation", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog
        title="Manual"
        description="Caller closes manually."
        confirmLabel="Confirm"
        confirmBehavior="manual"
        onConfirm={vi.fn()}
        trigger={<Button>Open manual</Button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open manual" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    expect(screen.getByRole("alertdialog", { name: "Manual" })).not.toBeNull();
  });

  it("blocks dismissal while pending", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AlertDialog
        title="Pending"
        description="Pending action."
        confirmLabel="Save"
        isConfirmPending
        onCancel={onCancel}
        onConfirm={vi.fn()}
        trigger={<Button>Open pending</Button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open pending" }));
    await screen.findByRole("alertdialog", { name: "Pending" });

    expect(screen.getByRole("button", { name: "Save" }).getAttribute("data-pending")).toBe("true");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" }).disabled).toBe(true);
    await user.keyboard("{Escape}");

    expect(screen.getByRole("alertdialog", { name: "Pending" })).not.toBeNull();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("preserves class names, state attributes, default cancel label, and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AlertDialog
        ref={ref}
        title="Configured alert"
        description="Configured description."
        confirmLabel="Continue"
        defaultOpen
        intent="warning"
        size="lg"
        className="custom-alert"
        overlayClassName="custom-overlay"
        surfaceClassName="custom-surface"
        bodyClassName="custom-body"
        actionsClassName="custom-actions"
        onConfirm={vi.fn()}
      >
        <p>Extra context</p>
      </AlertDialog>
    );

    expect(screen.getByRole("alertdialog", { name: "Configured alert" }).classList).toContain(
      "custom-alert"
    );
    expect(document.querySelector(".om-alert-dialog__overlay")?.classList).toContain(
      "custom-overlay"
    );
    expect(ref.current?.classList).toContain("custom-surface");
    expect(ref.current?.getAttribute("data-om-intent")).toBe("warning");
    expect(ref.current?.getAttribute("data-om-size")).toBe("lg");
    expect(document.querySelector(".om-alert-dialog__body")?.classList).toContain("custom-body");
    expect(document.querySelector(".om-alert-dialog__actions")?.classList).toContain(
      "custom-actions"
    );
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull();
  });

  it("rejects empty confirm labels", () => {
    expect(() =>
      render(
        <AlertDialog
          title="Invalid"
          description="Invalid label."
          confirmLabel=" "
          onConfirm={vi.fn()}
        />
      )
    ).toThrow("AlertDialog requires a non-empty confirmLabel.");
  });
});

function getDescribedText(element: HTMLElement): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/u) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
}
