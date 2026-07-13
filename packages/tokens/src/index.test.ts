import { describe, expect, it } from "vitest";

import { phase1aTokenSourceStatus } from "./index.js";

describe("@om/tokens phase 1a marker", () => {
  it("identifies JSON as the canonical token source", () => {
    expect(phase1aTokenSourceStatus).toEqual({
      canonicalSource: "json",
      cssGeneration: "deferred-to-phase-1b",
      stability: "bootstrap"
    });
  });
});
