import { describe, expect, it } from "vitest";
import { analyzeJsxSource, applySupportedTextEdit } from "./index.js";

describe("@om/source-analysis", () => {
  it("finds supported JSX text and edits deterministically", () => {
    const src = `export function Page() {\n  return <h1>Hello Parish</h1>;\n}\n`;
    const result = analyzeJsxSource("Page.tsx", src);
    const hit = result.textLiterals.find((h) => h.kind === "supported");
    expect(hit?.value).toBe("Hello Parish");
    const next = applySupportedTextEdit(src, hit!, "Hello Community");
    expect(next).toContain("Hello Community");
  });

  it("labels dynamic expressions unsupported", () => {
    const src = `export function Page({t}:{t:string}) {\n  return <h1>{t}</h1>;\n}\n`;
    const result = analyzeJsxSource("Page.tsx", src);
    expect(result.textLiterals.some((h) => h.kind === "unsupported")).toBe(true);
  });
});
