import { describe, expect, it } from "vitest";

import { bootstrapTokens } from "./index.js";

describe("@om/tokens bootstrap export", () => {
  it("provides CSS custom property references", () => {
    expect(bootstrapTokens.colorSurface).toBe("var(--om-bootstrap-surface)");
    expect(bootstrapTokens.colorText).toBe("var(--om-bootstrap-text)");
  });
});
