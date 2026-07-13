/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton.js";

afterEach(cleanup);

describe("IconButton", () => {
  it("composes Button behavior and exposes an accessible name", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<IconButton icon={<span>+</span>} accessibleLabel="Add record" onAction={onAction} />);

    const button = screen.getByRole("button", { name: "Add record" });
    await user.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(button.classList.contains("om-button")).toBe(true);
    expect(button.classList.contains("om-icon-button")).toBe(true);
  });

  it("requires a non-empty accessible label", () => {
    expect(() => render(<IconButton icon={<span>+</span>} accessibleLabel=" " />)).toThrow(
      /accessibleLabel/u
    );
  });

  it("does not duplicate icon content into the accessible name", () => {
    render(<IconButton icon={<span>Visible plus</span>} accessibleLabel="Add record" />);

    expect(screen.getByRole("button", { name: "Add record" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Visible plus/u })).toBeNull();
  });

  it("blocks disabled and pending actions", async () => {
    const user = userEvent.setup();
    const disabledAction = vi.fn();
    const pendingAction = vi.fn();
    render(
      <>
        <IconButton
          icon={<span>Disabled</span>}
          accessibleLabel="Disabled icon"
          isDisabled
          onAction={disabledAction}
        />
        <IconButton
          icon={<span>Pending</span>}
          accessibleLabel="Pending icon"
          isPending
          onAction={pendingAction}
        />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Disabled icon" }));
    await user.click(screen.getByRole("button", { name: "Pending icon" }));

    expect(disabledAction).not.toHaveBeenCalled();
    expect(pendingAction).not.toHaveBeenCalled();
  });

  it("forwards refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} icon={<span>+</span>} accessibleLabel="Add record" />);

    expect(ref.current).toBe(screen.getByRole("button", { name: "Add record" }));
  });
});
