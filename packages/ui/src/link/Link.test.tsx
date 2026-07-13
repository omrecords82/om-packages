/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Link } from "./Link.js";

afterEach(cleanup);

describe("Link", () => {
  it("renders as an anchor with href", () => {
    render(<Link href="/records">Records</Link>);

    const link = screen.getByRole("link", { name: "Records" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/records");
  });

  it("supports keyboard activation without changing link semantics", async () => {
    const user = userEvent.setup();
    const click = vi.fn((event: Event) => event.preventDefault());
    render(<Link href="/records">Records</Link>);

    const link = screen.getByRole("link", { name: "Records" });
    link.addEventListener("click", click);
    link.focus();
    await user.keyboard("{Enter}");

    expect(click).toHaveBeenCalledTimes(1);
  });

  it("prevents disabled navigation and exposes disabled state", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <Link href="/records" isDisabled>
        Records
      </Link>
    );

    const link = screen.getByRole("link", { name: "Records" });
    link.addEventListener("click", click);
    await user.click(link);

    expect(link.hasAttribute("href")).toBe(false);
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("applies safe blank target rel behavior and preserves safe caller rel values", () => {
    render(
      <>
        <Link href="https://example.com" target="_blank">
          External
        </Link>
        <Link href="https://example.com" target="_blank" rel="external noopener noreferrer">
          Caller rel
        </Link>
      </>
    );

    expect(screen.getByRole("link", { name: "External" }).getAttribute("rel")).toBe(
      "noopener noreferrer"
    );
    expect(screen.getByRole("link", { name: "Caller rel" }).getAttribute("rel")).toBe(
      "external noopener noreferrer"
    );
  });

  it("supports download, accessible label, variant, class name, and ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link
        ref={ref}
        href="/export.csv"
        download="records.csv"
        accessibleLabel="Download records"
        className="custom-link"
        variant="standalone"
      >
        Export
      </Link>
    );

    const link = screen.getByRole("link", { name: "Download records" });
    expect(link.getAttribute("download")).toBe("records.csv");
    expect(link.getAttribute("data-om-variant")).toBe("standalone");
    expect(link.classList.contains("om-link")).toBe(true);
    expect(link.classList.contains("custom-link")).toBe(true);
    expect(ref.current).toBe(link);
  });
});
