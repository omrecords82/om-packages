import { describe, expect, it } from "vitest";

import { phase1bTokenSourceStatus } from "./index.js";

describe("@om/tokens phase 1b source marker", () => {
  it("identifies JSON as the canonical token source", () => {
    expect(phase1bTokenSourceStatus).toEqual({
      canonicalSource: "json",
      cssGeneration: "generated-in-phase-1b",
      stability: "bootstrap"
    });
  });
});
