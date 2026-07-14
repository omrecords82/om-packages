/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { TextField } from "../text-field/TextField.js";
import { Drawer } from "./Drawer.js";

afterEach(cleanup);

describe("Drawer", () => {
  it("renders the supplied trigger and opens uncontrolled", async () => {
    const user = userEvent.setup();

    render(
      <Drawer title="Details" description="Record details" trigger={<Button>Open details</Button>}>
        <p>Drawer body</p>
      </Drawer>
    );

    await user.click(screen.getByRole("button", { name: "Open details" }));

    const drawer = await screen.findByRole("dialog", { name: "Details" });
    expect(getDescribedText(drawer)).toContain("Record details");
    expect(screen.getByText("Drawer body")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close drawer" })).not.toBeNull();
  });

  it("supports controlled open state and boolean open-change callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer title="Controlled" isOpen onOpenChange={onOpenChange}>
        Controlled body
      </Drawer>
    );

    await user.click(screen.getByRole("button", { name: "Close drawer" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls[0]?.[0]).toEqual(expect.any(Boolean));
  });

  it("does not render empty description or footer markup", () => {
    render(
      <Drawer title="No description" isOpen>
        Body
      </Drawer>
    );

    expect(screen.getByRole("dialog", { name: "No description" })).not.toBeNull();
    expect(document.querySelector(".om-drawer__description")).toBeNull();
    expect(document.querySelector(".om-drawer__footer")).toBeNull();
  });

  it("renders footer, sizes, class names, and forwards the surface ref", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Drawer
        ref={ref}
        title="Configured"
        isOpen
        size="xl"
        className="custom-drawer"
        overlayClassName="custom-overlay"
        surfaceClassName="custom-surface"
        bodyClassName="custom-body"
        footerClassName="custom-footer"
        footer={<Button>Done</Button>}
      >
        Body
      </Drawer>
    );

    expect(screen.getByRole("dialog", { name: "Configured" }).classList).toContain("custom-drawer");
    expect(document.querySelector(".om-drawer__overlay")?.classList).toContain("custom-overlay");
    expect(ref.current?.classList).toContain("custom-surface");
    expect(ref.current?.getAttribute("data-om-size")).toBe("xl");
    expect(ref.current?.getAttribute("data-om-placement")).toBe("end");
    expect(document.querySelector(".om-drawer__body")?.classList).toContain("custom-body");
    expect(document.querySelector(".om-drawer__footer")?.classList).toContain("custom-footer");
  });

  it("closes through close button and Escape when enabled", async () => {
    const user = userEvent.setup();

    render(
      <Drawer title="Dismissible" trigger={<Button>Open dismissible</Button>}>
        Body
      </Drawer>
    );

    await user.click(screen.getByRole("button", { name: "Open dismissible" }));
    await user.click(await screen.findByRole("button", { name: "Close drawer" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Open dismissible" }));
    await screen.findByRole("dialog", { name: "Dismissible" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("respects disabled keyboard dismissal", async () => {
    const user = userEvent.setup();

    render(
      <Drawer
        title="Keyboard locked"
        trigger={<Button>Open keyboard locked</Button>}
        isKeyboardDismissDisabled
      >
        Body
      </Drawer>
    );

    await user.click(screen.getByRole("button", { name: "Open keyboard locked" }));
    await screen.findByRole("dialog", { name: "Keyboard locked" });
    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog", { name: "Keyboard locked" })).not.toBeNull();
  });

  it("traps focus and restores focus to the trigger", async () => {
    const user = userEvent.setup();

    render(
      <Drawer
        title="Focus"
        trigger={<Button className="open-focus">Open focus drawer</Button>}
        footer={<Button>Footer action</Button>}
      >
        <TextField label="Body input" />
      </Drawer>
    );

    const trigger = screen.getByRole("button", { name: "Open focus drawer" });
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

  it("supports triggerless controlled usage", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer title="Controlled drawer" isOpen onOpenChange={onOpenChange}>
        Controlled drawer body
      </Drawer>
    );

    await user.click(screen.getByRole("button", { name: "Close drawer" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("warns for unreachable closed triggerless uncontrolled usage", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<Drawer title="Unreachable">Body</Drawer>);

    expect(warning).toHaveBeenCalledWith(
      "Drawer without a trigger must be controlled with isOpen or rendered initially open."
    );
    warning.mockRestore();
  });

  it("warns when all dismissal mechanisms are disabled or hidden", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Drawer
        title="Impossible"
        isOpen
        trigger={<Button>Open impossible</Button>}
        hideCloseButton
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        Body
      </Drawer>
    );

    expect(warning).toHaveBeenCalledWith(
      "Drawer may become impossible to exit when all dismissal paths are disabled."
    );
    warning.mockRestore();
  });

  it("warns and normalizes unsupported placement and size values", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Drawer title="Invalid values" isOpen placement={"middle" as never} size={"massive" as never}>
        Body
      </Drawer>
    );

    expect(warning).toHaveBeenCalledWith("Unsupported Drawer placement: middle");
    expect(warning).toHaveBeenCalledWith("Unsupported Drawer size: massive");
    expect(screen.getByRole("dialog", { name: "Invalid values" })).toBeTruthy();
    expect(
      screen
        .getByRole("dialog", { name: "Invalid values" })
        .closest(".om-drawer__surface")
        ?.getAttribute("data-om-placement")
    ).toBe("end");
    expect(
      screen
        .getByRole("dialog", { name: "Invalid values" })
        .closest(".om-drawer__surface")
        ?.getAttribute("data-om-size")
    ).toBe("md");
    warning.mockRestore();
  });

  it("applies placement, size, and state attributes", () => {
    render(
      <Drawer
        title="Styled"
        isOpen
        placement="start"
        size="sm"
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        Body
      </Drawer>
    );

    const surface = screen.getByRole("dialog", { name: "Styled" }).closest(".om-drawer__surface");
    expect(surface?.getAttribute("data-om-placement")).toBe("start");
    expect(surface?.getAttribute("data-om-size")).toBe("sm");
    expect(surface?.getAttribute("data-om-open")).toBe("true");
    expect(document.querySelector(".om-drawer__overlay")?.getAttribute("data-om-dismissible")).toBe(
      null
    );
    expect(
      document
        .querySelector(".om-drawer__overlay")
        ?.getAttribute("data-om-keyboard-dismiss-disabled")
    ).toBe("true");
  });

  it("supports top and bottom placements with all sizes", () => {
    render(
      <>
        <Drawer title="Top small" isOpen placement="top" size="sm">
          Body
        </Drawer>
        <Drawer title="Bottom large" isOpen placement="bottom" size="xl">
          Body
        </Drawer>
      </>
    );

    expect(
      document
        .querySelector('.om-drawer__surface[data-om-placement="top"]')
        ?.getAttribute("data-om-size")
    ).toBe("sm");
    expect(
      document
        .querySelector('.om-drawer__surface[data-om-placement="bottom"]')
        ?.getAttribute("data-om-size")
    ).toBe("xl");
  });

  it("renders header, body, footer, and SSR output", () => {
    render(
      <Drawer title="Structure" isOpen footer={<Button>Footer action</Button>}>
        Body
      </Drawer>
    );

    expect(document.querySelector(".om-drawer__header")).not.toBeNull();
    expect(document.querySelector(".om-drawer__body")).not.toBeNull();
    expect(document.querySelector(".om-drawer__footer")).not.toBeNull();
  });

  it("renders without browser globals during SSR", () => {
    const markup = renderToString(
      <Drawer title="Server drawer" trigger={<Button>Open server drawer</Button>} />
    );

    expect(markup).toContain("Open server drawer");
    expect(markup).not.toContain("Server drawer body");
  });
});

function getDescribedText(element: HTMLElement): string {
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/u) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")
    .trim();
}
