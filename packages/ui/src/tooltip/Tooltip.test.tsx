/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, forwardRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Tooltip } from "./Tooltip.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

beforeAll(() => {
  const currentCss = (globalThis as { CSS?: object }).CSS ?? {};
  Object.defineProperty(globalThis, "CSS", {
    configurable: true,
    value: {
      ...currentCss,
      escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/gu, "\\$&")
    }
  });
});

describe("Tooltip", () => {
  it("renders the supplied trigger, preserves its accessible name, and forwards refs", () => {
    const ref = createRef<HTMLElement>();
    const triggerRef = createRef<HTMLButtonElement>();
    render(
      <Tooltip
        ref={ref}
        trigger={
          <Button ref={triggerRef} className="trigger-original">
            Refresh
          </Button>
        }
        content="Reload latest records"
        triggerClassName="trigger-extra"
        className="tooltip-root"
      />
    );

    const trigger = screen.getByRole("button", { name: "Refresh" });
    expect(ref.current).toBe(trigger);
    expect(triggerRef.current).toBe(trigger);
    expect(trigger.getAttribute("aria-label")).toBeNull();
    expect(trigger.classList.contains("trigger-original")).toBe(true);
    expect(trigger.classList.contains("trigger-extra")).toBe(true);
    expect(trigger.closest(".om-tooltip")?.classList.contains("tooltip-root")).toBe(true);
  });

  it("keeps icon-only triggers independently named and does not copy content into aria-label", () => {
    render(
      <Tooltip
        isOpen
        trigger={
          <IconButton icon={<span aria-hidden="true">R</span>} accessibleLabel="Refresh records" />
        }
        content="Reload the latest records"
      />
    );

    const trigger = screen.getByRole("button", { name: "Refresh records" });
    expect(trigger.getAttribute("aria-label")).toBe("Refresh records");
    expect(trigger.getAttribute("aria-label")).not.toBe("Reload the latest records");
    expect(screen.getByRole("tooltip").textContent).toContain("Reload the latest records");
  });

  it("associates tooltip content descriptively when open", () => {
    render(
      <Tooltip isOpen trigger={<Button>Describe me</Button>} content="Supplemental description" />
    );

    const trigger = screen.getByRole("button", { name: "Describe me" });
    const tooltip = screen.getByRole("tooltip");
    const describedBy = trigger.getAttribute("aria-describedby") ?? "";
    expect(describedBy.length).toBeGreaterThan(0);
    expect(describedBy.split(/\s+/u)).toContain(tooltip.id);
    expect(tooltip.textContent).toContain("Supplemental description");
  });

  it("supports controlled open state and boolean-only close requests", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip
        trigger={<Button>Controlled tooltip</Button>}
        content="Controlled description"
        isOpen
        onOpenChange={onOpenChange}
      />
    );

    expect(screen.getByRole("tooltip").textContent).toContain("Controlled description");

    rerender(
      <Tooltip
        trigger={<Button>Controlled tooltip</Button>}
        content="Controlled description"
        isOpen
        isDisabled
        onOpenChange={onOpenChange}
      />
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls[0]?.[0]).toEqual(expect.any(Boolean));
  });

  it("supports uncontrolled hover, pointer-leave, focus, blur, and Escape behavior", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip
        trigger={<Button>Hover tooltip</Button>}
        content="Hover description"
        delay="immediate"
      />
    );

    const trigger = screen.getByRole("button", { name: "Hover tooltip" });
    await user.hover(trigger);
    expect((await screen.findByRole("tooltip")).textContent).toContain("Hover description");

    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());

    await user.tab();
    expect((await screen.findByRole("tooltip")).textContent).toContain("Hover description");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());

    trigger.blur();
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("does not trap focus and keeps trigger activation functional", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <>
        <Tooltip
          trigger={<Button onAction={onAction}>Activate</Button>}
          content="Activation remains available"
          delay="immediate"
        />
        <Button>Next action</Button>
      </>
    );

    const trigger = screen.getByRole("button", { name: "Activate" });
    await user.tab();
    expect((await screen.findByRole("tooltip")).textContent).toContain(
      "Activation remains available"
    );
    expect(document.activeElement).toBe(trigger);
    await user.keyboard("[Enter]");
    expect(onAction).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next action" }));
  });

  it("keeps disabled Tooltip behavior closed without adding a focusable wrapper", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip
        isDisabled
        trigger={<Button>Disabled tooltip trigger</Button>}
        content="Disabled description"
      />
    );

    const trigger = screen.getByRole("button", { name: "Disabled tooltip trigger" });
    await user.hover(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger.closest(".om-tooltip")?.getAttribute("tabindex")).toBeNull();
  });

  it("documents native disabled control behavior without creating a focusable wrapper", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip
        trigger={
          <button type="button" disabled>
            Native disabled
          </button>
        }
        content="Native disabled controls may not expose tooltip interaction"
        delay="immediate"
      />
    );

    const trigger = screen.getByRole("button", { name: "Native disabled" });
    await user.hover(trigger);
    expect(trigger.closest(".om-tooltip")?.getAttribute("tabindex")).toBeNull();
  });

  it("validates content and trigger configuration", () => {
    expect(() => render(<Tooltip trigger={<Button>Invalid</Button>} content="" />)).toThrow(
      /non-empty string/u
    );
    expect(() => render(<Tooltip trigger={<Button>Invalid</Button>} content="   " />)).toThrow(
      /non-empty string/u
    );
    expect(() => render(<Tooltip trigger={"not an element" as never} content="Invalid" />)).toThrow(
      /React element/u
    );
    expect(() =>
      render(
        <Tooltip
          trigger={<Button>Invalid</Button>}
          content="Invalid"
          placement={"center" as never}
        />
      )
    ).toThrow(/Unsupported Tooltip placement/u);
    expect(() =>
      render(
        <Tooltip trigger={<Button>Invalid</Button>} content="Invalid" delay={"slow" as never} />
      )
    ).toThrow(/Unsupported Tooltip delay/u);
  });

  it("warns for obvious noninteractive and unlabeled icon-only triggers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<Tooltip trigger={<span>Plain text</span>} content="Supplemental" />);
    render(<Tooltip trigger={<button type="button" />} content="Icon help" />);

    expect(warn).toHaveBeenCalledWith("Tooltip trigger should be an interactive React element.");
    expect(warn).toHaveBeenCalledWith(
      "Tooltip trigger appears to lack an accessible name. Tooltip content is descriptive and is not copied into aria-label."
    );
  });

  it("maps every placement and supports arrow and class-name controls", () => {
    const placements = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end"
    ] as const;

    for (const placement of placements) {
      const { unmount } = render(
        <Tooltip
          isOpen
          trigger={<Button>{placement}</Button>}
          content={`Placement ${placement}`}
          placement={placement}
          tooltipClassName="bubble-extra"
          arrowClassName="arrow-extra"
        />
      );
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip.getAttribute("data-om-placement")).toBe(placement);
      expect(tooltip.classList.contains("bubble-extra")).toBe(true);
      expect(document.querySelector(".om-tooltip__arrow")?.classList.contains("arrow-extra")).toBe(
        true
      );
      unmount();
    }

    render(
      <Tooltip isOpen showArrow={false} trigger={<Button>No arrow</Button>} content="No arrow" />
    );
    expect(document.querySelector(".om-tooltip__arrow")).toBeNull();
  });

  it("applies standard and immediate delay attributes", () => {
    render(<Tooltip isOpen trigger={<Button>Delayed</Button>} content="Delayed content" />);
    expect(screen.getByRole("tooltip").getAttribute("data-om-delay")).toBe("standard");

    cleanup();

    render(
      <Tooltip
        isOpen
        trigger={<Button>Immediate</Button>}
        content="Immediate content"
        delay="immediate"
      />
    );
    expect(screen.getByRole("tooltip").getAttribute("data-om-delay")).toBe("immediate");
  });

  it("wraps long content and renders safely on the server", () => {
    const longContent =
      "This supplemental tooltip content is intentionally long enough to exercise wrapping behavior without adding interactive controls.";
    render(
      <Tooltip
        isOpen
        trigger={<Button>Long content</Button>}
        content={longContent}
        tooltipClassName="long-tooltip"
      />
    );
    expect(screen.getByRole("tooltip").querySelector(".om-tooltip__content")?.textContent).toBe(
      longContent
    );

    const markup = renderToString(
      <Tooltip trigger={<button type="button">Server trigger</button>} content="Server tooltip" />
    );
    expect(markup).toContain("Server trigger");
    expect(markup).not.toContain("Server tooltip</");
  });

  it("supports ref-forwarding custom interactive triggers", () => {
    const CustomTrigger = forwardRef<HTMLButtonElement, { readonly className?: string }>(
      function CustomTrigger({ className }, ref) {
        return (
          <button ref={ref} type="button" className={className}>
            Custom trigger
          </button>
        );
      }
    );
    const ref = createRef<HTMLElement>();

    render(<Tooltip ref={ref} trigger={<CustomTrigger />} content="Custom tooltip" />);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Custom trigger" }));
  });
});
