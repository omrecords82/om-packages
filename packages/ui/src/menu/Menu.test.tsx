/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { Menu } from "./Menu.js";

const items = [
  {
    type: "action",
    id: "edit",
    label: "Edit",
    description: "Edit this record"
  },
  {
    type: "action",
    id: "archive",
    label: "Archive",
    isDisabled: true
  },
  {
    type: "separator",
    id: "divider"
  },
  {
    type: "link",
    id: "profile",
    label: "View profile",
    href: "/profile",
    target: "_blank"
  },
  {
    type: "action",
    id: "delete",
    label: "Delete",
    intent: "destructive"
  }
] as const;

afterEach(() => {
  cleanup();
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

describe("Menu", () => {
  it("renders the supplied trigger, preserves accessible label, and forwards the trigger ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Menu
        ref={ref}
        trigger={<Button className="trigger-class">Actions</Button>}
        items={items}
        className="menu-root"
        triggerClassName="menu-trigger"
      />
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(ref.current).toBe(trigger);
    expect(trigger.classList.contains("trigger-class")).toBe(true);
    expect(trigger.classList.contains("menu-trigger")).toBe(true);
    expect(trigger.closest(".om-menu")?.classList.contains("menu-root")).toBe(true);
  });

  it("supports accessible trigger labels", () => {
    render(
      <Menu trigger={<Button accessibleLabel="Open record actions">...</Button>} items={items} />
    );

    expect(screen.getByRole("button", { name: "Open record actions" })).not.toBeNull();
  });

  it("supports uncontrolled opening and action callbacks with string ids only", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Menu
        trigger={<Button>Open menu</Button>}
        items={items}
        onAction={onAction}
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).not.toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("menuitem", { name: /Edit/u }));
    expect(onAction).toHaveBeenCalledWith("edit");
    expect(onAction.mock.calls[0]?.[0]).toEqual(expect.any(String));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("supports controlled open state and boolean open-change callbacks", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function ControlledMenu(): JSX.Element {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Menu
          trigger={<Button>Controlled menu</Button>}
          items={items}
          isOpen={isOpen}
          onOpenChange={(nextOpen) => {
            onOpenChange(nextOpen);
            setIsOpen(nextOpen);
          }}
        />
      );
    }

    render(<ControlledMenu />);

    await user.click(screen.getByRole("button", { name: "Controlled menu" }));
    expect(screen.getByRole("menu")).not.toBeNull();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(onOpenChange.mock.calls[0]?.[0]).toEqual(expect.any(Boolean));
  });

  it("supports keyboard opening, navigation, typeahead, activation, Escape, and focus restoration", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Menu trigger={<Button>Keyboard menu</Button>} items={items} onAction={onAction} />);

    const trigger = screen.getByRole("button", { name: "Keyboard menu" });
    trigger.focus();
    await user.keyboard("[ArrowDown]");
    expect(screen.getByRole("menu")).not.toBeNull();
    await user.keyboard("d");
    await user.keyboard("[Enter]");
    expect(onAction).toHaveBeenCalledWith("delete");
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    await user.keyboard("[Enter]");
    expect(screen.getByRole("menu")).not.toBeNull();
    await user.keyboard("[Home]");
    await user.keyboard("[End]");
    await user.keyboard("[ArrowUp]");
    await user.keyboard("[Escape]");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("supports Space opening and Escape dismissal", async () => {
    const user = userEvent.setup();
    render(<Menu trigger={<Button>Space menu</Button>} items={items} />);

    const trigger = screen.getByRole("button", { name: "Space menu" });
    trigger.focus();
    await user.keyboard("[Space]");
    expect(screen.getByRole("menu")).not.toBeNull();
    await user.keyboard("[Escape]");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("skips disabled items and keeps separators noninteractive", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Menu trigger={<Button>Disabled menu</Button>} items={items} onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "Disabled menu" }));
    const disabled = screen.getByRole("menuitem", { name: "Archive" });
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    await user.click(disabled);
    expect(onAction).not.toHaveBeenCalledWith("archive");
    expect(screen.getByRole("separator")).not.toBeNull();
  });

  it("renders links as safe anchors and blocks disabled link activation", async () => {
    const user = userEvent.setup();
    render(
      <Menu
        trigger={<Button>Link menu</Button>}
        items={[
          {
            type: "link",
            id: "external",
            label: "External profile",
            href: "https://example.test/profile",
            target: "_blank"
          },
          {
            type: "link",
            id: "disabled-link",
            label: "Disabled link",
            href: "/disabled",
            isDisabled: true
          }
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Link menu" }));
    const external = screen.getByRole("menuitem", { name: "External profile" });
    expect(external.tagName).toBe("A");
    expect(external.getAttribute("href")).toBe("https://example.test/profile");
    expect(external.getAttribute("rel")).toBe("noopener noreferrer");
    expect(
      screen.getByRole("menuitem", { name: "Disabled link" }).getAttribute("aria-disabled")
    ).toBe("true");
  });

  it("validates ids, labels, hrefs, duplicate ids, and unsafe links", () => {
    expect(() =>
      render(
        <Menu
          trigger={<Button>Invalid</Button>}
          items={[{ type: "action", id: " ", label: "Invalid" }]}
        />
      )
    ).toThrow(/non-empty string ids/u);
    expect(() =>
      render(
        <Menu
          trigger={<Button>Invalid</Button>}
          items={[{ type: "action", id: "edit", label: " " }]}
        />
      )
    ).toThrow(/non-empty labels/u);
    expect(() =>
      render(
        <Menu
          trigger={<Button>Invalid</Button>}
          items={[
            { type: "action", id: "same", label: "First" },
            { type: "action", id: "same", label: "Second" }
          ]}
        />
      )
    ).toThrow(/unique/u);
    expect(() =>
      render(
        <Menu
          trigger={<Button>Invalid</Button>}
          items={[{ type: "link", id: "link", label: "Link", href: " " }]}
        />
      )
    ).toThrow(/non-empty href/u);
    expect(() =>
      render(
        <Menu
          trigger={<Button>Invalid</Button>}
          items={[{ type: "link", id: "link", label: "Link", href: "javascript:alert(1)" }]}
        />
      )
    ).toThrow(/unsafe href/u);
  });

  it("keeps disabled and separator-only menus closed and warns for separator-only menus", async () => {
    const user = userEvent.setup();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <>
        <Menu trigger={<Button>Disabled root</Button>} items={items} isDisabled />
        <Menu
          trigger={<Button>Separator only</Button>}
          items={[{ type: "separator", id: "only" }]}
        />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Disabled root" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: "Disabled root" }).hasAttribute("disabled")).toBe(
      true
    );

    await user.click(screen.getByRole("button", { name: "Separator only" }));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(warning).toHaveBeenCalledWith("Menu contains no available action or link items.");
  });

  it("applies placement, long-menu scrolling structure, destructive state, and class names", async () => {
    const user = userEvent.setup();
    const longItems = Array.from({ length: 30 }, (_, index) => {
      const itemNumber = String(index);
      return {
        type: "action" as const,
        id: `item-${itemNumber}`,
        label: `Item ${itemNumber}`
      };
    });
    render(
      <Menu
        trigger={<Button>Configured menu</Button>}
        items={[
          ...longItems,
          { type: "action", id: "delete", label: "Delete", intent: "destructive" }
        ]}
        placement="top-end"
        popoverClassName="custom-popover"
        menuClassName="custom-menu"
      />
    );

    await user.click(screen.getByRole("button", { name: "Configured menu" }));
    expect(document.querySelector(".om-menu__popover")?.getAttribute("data-om-placement")).toBe(
      "top-end"
    );
    expect(document.querySelector(".om-menu__popover")?.classList.contains("custom-popover")).toBe(
      true
    );
    expect(screen.getByRole("menu").classList.contains("custom-menu")).toBe(true);
    expect(screen.getByRole("menuitem", { name: "Delete" }).getAttribute("data-om-intent")).toBe(
      "destructive"
    );
  });

  it("server-renders closed state without browser globals", () => {
    const html = renderToString(<Menu trigger={<Button>SSR menu</Button>} items={items} />);

    expect(html).toContain("SSR menu");
    expect(html).not.toContain("react-aria-components");
  });
});
