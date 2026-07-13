/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { Tabs } from "./Tabs.js";

const items = [
  {
    id: "overview",
    label: "Overview",
    content: <Button>Overview action</Button>
  },
  {
    id: "details",
    label: "Details",
    content: "Details panel"
  },
  {
    id: "disabled",
    label: "Disabled",
    content: "Disabled panel",
    isDisabled: true
  },
  {
    id: "history",
    label: "History",
    content: "History panel"
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

describe("Tabs", () => {
  it("renders tab-list semantics, labels, relationships, default selection, and ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs
        ref={ref}
        accessibleLabel="Record sections"
        items={items}
        className="tabs-root"
        tabListClassName="tabs-list"
        tabClassName="tabs-tab"
        panelClassName="tabs-panel"
      />
    );

    const tabList = screen.getByRole("tablist", { name: "Record sections" });
    const overview = screen.getByRole("tab", { name: "Overview" });
    const panel = screen.getByRole("tabpanel");
    expect(ref.current?.classList.contains("om-tabs")).toBe(true);
    expect(ref.current?.classList.contains("tabs-root")).toBe(true);
    expect(tabList.classList.contains("tabs-list")).toBe(true);
    expect(overview.classList.contains("tabs-tab")).toBe(true);
    expect(panel.classList.contains("tabs-panel")).toBe(true);
    expect(overview.getAttribute("aria-selected")).toBe("true");
    expect(panel.getAttribute("aria-labelledby")).toBe(overview.getAttribute("id"));
    expect(overview.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(screen.getByText("Overview action")).not.toBeNull();
  });

  it("supports controlled selected IDs and string-only callbacks", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    function ControlledTabs(): JSX.Element {
      const [selectedId, setSelectedId] = useState<string | null>("details");
      return (
        <Tabs
          accessibleLabel="Controlled sections"
          items={items}
          selectedId={selectedId}
          onSelectionChange={(id) => {
            onSelectionChange(id);
            setSelectedId(id);
          }}
        />
      );
    }

    render(<ControlledTabs />);

    expect(screen.getByRole("tab", { name: "Details" }).getAttribute("aria-selected")).toBe("true");
    await user.click(screen.getByRole("tab", { name: "History" }));
    expect(onSelectionChange).toHaveBeenCalledWith("history");
    expect(onSelectionChange.mock.calls[0]?.[0]).toEqual(expect.any(String));
    expect(onSelectionChange.mock.calls[0]?.[0]).not.toHaveProperty("target");
  });

  it("supports uncontrolled default selected IDs and explicit null handling", () => {
    const { rerender } = render(
      <Tabs accessibleLabel="Default sections" items={items} defaultSelectedId="history" />
    );

    expect(screen.getByRole("tab", { name: "History" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("History panel")).not.toBeNull();

    rerender(<Tabs accessibleLabel="No selected section" items={items} selectedId={null} />);
    expect(screen.queryByRole("tabpanel")).toBeNull();
  });

  it("warns on unknown controlled IDs and rejects invalid item definitions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Tabs accessibleLabel="Unknown selection" items={items} selectedId="unknown" />);
    expect(warn).toHaveBeenCalledWith("Tabs selectedId does not match a tab item id: unknown");
    expect(screen.queryByRole("tabpanel")).toBeNull();

    expect(() =>
      render(<Tabs accessibleLabel="Invalid" items={[{ id: " ", label: "Blank", content: "" }]} />)
    ).toThrow(/non-empty string ids/u);
    expect(() =>
      render(<Tabs accessibleLabel="Invalid" items={[{ id: "blank", label: " ", content: "" }]} />)
    ).toThrow(/non-empty labels/u);
    expect(() =>
      render(
        <Tabs
          accessibleLabel="Invalid"
          items={[
            { id: "same", label: "One", content: "" },
            { id: "same", label: "Two", content: "" }
          ]}
        />
      )
    ).toThrow(/unique/u);
    expect(() =>
      render(<Tabs accessibleLabel="Invalid" items={items} defaultSelectedId="unknown" />)
    ).toThrow(/defaultSelectedId/u);
    expect(() => render(<Tabs accessibleLabel=" " items={items} />)).toThrow(/accessibleLabel/u);
  });

  it("warns on duplicate labels, empty items, and all-disabled items", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <>
        <Tabs
          accessibleLabel="Duplicate labels"
          items={[
            { id: "one", label: "Duplicate", content: "One" },
            { id: "two", label: "Duplicate", content: "Two" }
          ]}
        />
        <Tabs accessibleLabel="Empty tabs" items={[]} />
        <Tabs
          accessibleLabel="Disabled tabs"
          items={[{ id: "disabled", label: "Disabled", content: "Disabled", isDisabled: true }]}
        />
      </>
    );

    expect(warn).toHaveBeenCalledWith("Tabs contains duplicate tab labels: Duplicate");
    expect(warn).toHaveBeenCalledWith("Tabs contains no tab items.");
    expect(warn).toHaveBeenCalledWith("Tabs contains only disabled tab items.");
    expect(screen.getByRole("tablist", { name: "Empty tabs" })).not.toBeNull();
    expect(screen.getByRole("tab", { name: "Disabled" }).getAttribute("aria-disabled")).toBe(
      "true"
    );
  });

  it("supports horizontal keyboard navigation, Home, End, and disabled-tab skipping", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Tabs
        accessibleLabel="Horizontal sections"
        items={items}
        onSelectionChange={onSelectionChange}
      />
    );

    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("[ArrowRight]");
    expect(onSelectionChange).toHaveBeenCalledWith("details");
    await user.keyboard("[ArrowRight]");
    expect(onSelectionChange).toHaveBeenCalledWith("history");
    await user.keyboard("[Home]");
    expect(onSelectionChange).toHaveBeenCalledWith("overview");
    await user.keyboard("[End]");
    expect(onSelectionChange).toHaveBeenCalledWith("history");
  });

  it("supports vertical keyboard navigation", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Tabs
        accessibleLabel="Vertical sections"
        items={items}
        orientation="vertical"
        onSelectionChange={onSelectionChange}
      />
    );

    const tabList = screen.getByRole("tablist", { name: "Vertical sections" });
    expect(tabList.getAttribute("aria-orientation")).toBe("vertical");
    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("[ArrowDown]");
    expect(onSelectionChange).toHaveBeenCalledWith("details");
    await user.keyboard("[ArrowDown]");
    expect(onSelectionChange).toHaveBeenCalledWith("history");
    expect(document.querySelector(".om-tabs")?.getAttribute("data-om-orientation")).toBe(
      "vertical"
    );
  });

  it("supports manual activation with focused and selected states kept distinct", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Tabs
        accessibleLabel="Manual sections"
        items={items}
        activationMode="manual"
        onSelectionChange={onSelectionChange}
      />
    );

    screen.getByRole("tab", { name: "Overview" }).focus();
    await user.keyboard("[ArrowRight]");
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    await user.keyboard("[Enter]");
    expect(onSelectionChange).toHaveBeenCalledWith("details");

    await user.keyboard("[ArrowRight]");
    await user.keyboard("[Space]");
    expect(onSelectionChange).toHaveBeenCalledWith("history");
    expect(document.querySelector(".om-tabs")?.getAttribute("data-om-activation-mode")).toBe(
      "manual"
    );
  });

  it("supports active-only and all-panel mounting policies", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Tabs accessibleLabel="Active panels" items={items} panelMounting="active" />
    );

    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);

    rerender(<Tabs accessibleLabel="All panels" items={items} panelMounting="all" />);
    expect(document.querySelectorAll(".om-tabs__panel")).toHaveLength(items.length);
    expect(document.querySelectorAll(".om-tabs__panel[data-inert='true']").length).toBeGreaterThan(
      0
    );
    await user.tab();
    expect(document.activeElement?.textContent).not.toContain("Overview action");
    expect(document.querySelector(".om-tabs")?.getAttribute("data-om-panel-mounting")).toBe("all");
  });

  it("keeps globally disabled tabs from changing selection while preserving visible content", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Tabs
        accessibleLabel="Disabled root"
        items={items}
        defaultSelectedId="details"
        isDisabled
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText("Details panel")).not.toBeNull();
    const history = screen.getByRole("tab", { name: "History" });
    expect(history.getAttribute("aria-disabled")).toBe("true");
    await user.click(history);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(document.querySelector(".om-tabs")?.getAttribute("data-om-disabled")).toBe("true");
  });

  it("server-renders without browser globals", () => {
    const markup = renderToString(<Tabs accessibleLabel="Server tabs" items={items} />);

    expect(markup).toContain("Server tabs");
    expect(markup).toContain("Overview");
    expect(markup).toContain("Overview action");
  });
});
