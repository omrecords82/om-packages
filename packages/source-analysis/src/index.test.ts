import { describe, expect, it } from "vitest";
import {
  analyzeJsxSource,
  applyStructuredEdit,
  applySupportedTextEdit
} from "./index.js";

const fixture = `export function Page() {
  return (
    <>
      <h1>Deterministic heading</h1>
      <Button label="Save" disabled={false} />
      <section className="px-4 py-6">Content</section>
      <h1>{getHeading(record)}</h1>
      <div className={cn(base, active && selected)} />
    </>
  );
}
`;

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

  it("finds and edits simple string prop literals", () => {
    const src = `const Enrollment = () => {\n  return <PublicSeo title="Enroll Your Parish" />;\n};\n`;
    const result = analyzeJsxSource("Enrollment.tsx", src);
    const hit = result.textLiterals.find((h) => h.value === "Enroll Your Parish");
    expect(hit?.form).toBe("string-prop");
    const next = applySupportedTextEdit(src, hit!, "Hello Community Parish");
    expect(next).toContain('title="Hello Community Parish"');
  });

  it("covers fixture supported and unsupported cases", () => {
    const result = analyzeJsxSource("Page.tsx", fixture);
    expect(result.textLiterals.some((h) => h.value === "Deterministic heading")).toBe(true);
    expect(result.textLiterals.some((h) => h.value === "Save" && h.form === "string-prop")).toBe(
      true
    );
    expect(
      result.textLiterals.some((h) => h.value === "false" && h.form === "boolean-prop")
    ).toBe(true);
    expect(
      result.textLiterals.some((h) => h.value === "px-4 py-6" && h.form === "className")
    ).toBe(true);
    expect(
      result.textLiterals.some((h) => h.kind === "unsupported" && h.reason?.includes("dynamic"))
    ).toBe(true);
  });

  it("applies typed structured ops without unrelated changes", () => {
    const result = analyzeJsxSource("Page.tsx", fixture);
    const heading = result.textLiterals.find((h) => h.value === "Deterministic heading")!;
    const next = applyStructuredEdit(fixture, heading, "replace_jsx_text", "Updated heading");
    expect(next).toContain("Updated heading");
    expect(next).toContain('label="Save"');
    expect(next).toContain("disabled={false}");
    expect(next).toContain('className="px-4 py-6"');
  });

  it("rejects stale span values", () => {
    const result = analyzeJsxSource("Page.tsx", fixture);
    const hit = result.textLiterals.find((h) => h.value === "Save")!;
    expect(() => applySupportedTextEdit(fixture.replace("Save", "Nope"), hit, "X")).toThrow(
      /no longer matches/
    );
  });
});
