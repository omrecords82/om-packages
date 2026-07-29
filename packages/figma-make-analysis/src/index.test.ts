import { describe, expect, it } from "vitest";
import { classifyInventory } from "./index.js";

describe("@om/figma-make-analysis", () => {
  it("blocks traversal and symlinks", () => {
    const inv = classifyInventory([
      { path: "../escape.tsx", size: 10 },
      { path: "components/Button.tsx", size: 20, isSymlink: true },
      { path: "components/Card.tsx", size: 30 }
    ]);
    expect(inv.files.some((f) => f.rejected === "path traversal")).toBe(true);
    expect(inv.files.some((f) => f.rejected === "symlink blocked")).toBe(true);
    expect(inv.candidates.some((c) => c.path.includes("Card.tsx"))).toBe(true);
  });
});
