import { describe, expect, it } from "vitest";
import { analyzeStyleSource } from "./index.js";

describe("@om/style-analysis", () => {
  it("classifies tokens, hardcoded hex, and tailwind classes", () => {
    const src = `const x = "var(--om-primitive-color-neutral-900)";\nconst y = "#ff0000";\n<div className="flex gap-2" />\n`;
    const findings = analyzeStyleSource("x.tsx", src);
    expect(findings.some((f) => f.classification === "TOKEN_COMPLIANT")).toBe(true);
    expect(findings.some((f) => f.classification === "HARDCODED_VALUE")).toBe(true);
    expect(findings.some((f) => f.classification === "TAILWIND_UTILITY")).toBe(true);
  });
});
