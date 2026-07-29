/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModulePage } from "./ModulePage.js";

describe("ModulePage", () => {
  it("renders title and body", () => {
    render(
      <ModulePage title="Example" description="Demo module">
        <p>Body content</p>
      </ModulePage>
    );
    expect(screen.getByRole("heading", { name: "Example" })).toBeTruthy();
    expect(screen.getByText("Body content")).toBeTruthy();
  });
});
