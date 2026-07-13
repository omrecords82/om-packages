import { describe, expect, it } from "vitest";

import { bootstrapContract } from "./index.js";

describe("@om/contracts bootstrap export", () => {
  it("identifies the phase 0 contract package", () => {
    expect(bootstrapContract).toEqual({
      packageName: "@om/contracts",
      phase: "phase-0"
    });
  });
});
