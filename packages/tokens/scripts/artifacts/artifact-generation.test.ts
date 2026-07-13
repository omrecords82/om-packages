import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { emitArtifacts, emitLiturgicalCss } from "./emit.js";
import {
  assertCssNameCollisions,
  createArtifactModel,
  cssValueForToken,
  tokenPathToCssCustomProperty
} from "./model.js";
import { generateTokenArtifacts } from "../generate-artifacts.js";

describe("Phase 1B token artifact generation", () => {
  test("converts canonical token paths to stable CSS variables", () => {
    expect(tokenPathToCssCustomProperty("primitive.color.neutral.0")).toBe(
      "--om-primitive-color-neutral-0"
    );
    expect(tokenPathToCssCustomProperty("component.pageShell.background")).toBe(
      "--om-component-page-shell-background"
    );
    expect(tokenPathToCssCustomProperty("primitive.space.4")).toBe("--om-primitive-space-4");
  });

  test("detects CSS variable collisions", () => {
    expect(() =>
      assertCssNameCollisions([
        { path: "component.pageShell.background" },
        { path: "component.page.shell.background" }
      ])
    ).toThrow(/collision/u);
  });

  test("emits primitive literals and token references as CSS var references", () => {
    expect(cssValueForToken("#ffffff")).toBe("#ffffff");
    expect(cssValueForToken("{primitive.color.accent.red}")).toBe(
      "var(--om-primitive-color-accent-red)"
    );
  });

  test("generates deterministic artifacts byte for byte", async () => {
    const first = emitArtifacts(await createArtifactModel());
    const second = emitArtifacts(await createArtifactModel());
    expect(first).toEqual(second);
  });

  test("writes the same files during repeated clean generation", async () => {
    const directory = await mkdtemp(join(tmpdir(), "om-token-artifacts-test-"));
    try {
      await generateTokenArtifacts(directory);
      const firstManifest = await readFile(join(directory, "manifest.json"), "utf8");
      await rm(directory, { recursive: true, force: true });
      await generateTokenArtifacts(directory);
      const secondManifest = await readFile(join(directory, "manifest.json"), "utf8");
      expect(secondManifest).toBe(firstManifest);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("manifest includes authored values, resolved values, and stable path ordering", async () => {
    const model = await createArtifactModel();
    const manifest = model.manifest;
    const semanticAccent = manifest.tokens.find(
      (token) => token.path === "semantic.action.accent" && token.colorScheme === "light"
    );
    expect(semanticAccent?.value).toBe("{primitive.color.accent.red}");
    expect(semanticAccent?.resolvedValue).toBe("#7f1d1d");
    expect(manifest.tokenPaths).toEqual([...manifest.tokenPaths].sort());
  });

  test("metadata counts and digests are deterministic", async () => {
    const first = (await createArtifactModel()).metadata;
    const second = (await createArtifactModel()).metadata;
    expect(first).toEqual(second);
    expect(first.tokenCountsByCategory.primitive).toBeGreaterThan(0);
    expect(first.sourceContentDigest).toMatch(/^sha256-[a-f0-9]{64}$/u);
  });

  test("emits required CSS layers, selectors, and media queries", async () => {
    const artifacts = emitArtifacts(await createArtifactModel());
    expect(artifacts["css/om-tokens.css"]).toContain(
      "@layer om.defaults, om.app, om.brand, om.liturgical, om.accessibility;"
    );
    expect(artifacts["css/om-tokens.light.css"]).toContain('[data-om-theme="light"]');
    expect(artifacts["css/om-tokens.dark.css"]).toContain('[data-om-theme="dark"]');
    for (const color of ["white", "gold", "green", "purple", "red", "blue", "black"]) {
      expect(artifacts["css/om-liturgical.css"]).toContain(`[data-om-liturgical-color="${color}"]`);
    }
    expect(artifacts["css/om-accessibility.css"]).toContain('[data-om-motion="reduced"]');
    expect(artifacts["css/om-accessibility.css"]).toContain(
      "@media (prefers-reduced-motion: reduce)"
    );
    expect(artifacts["css/om-accessibility.css"]).toContain("@media (forced-colors: active)");
  });

  test("rejects prohibited liturgical output paths during validation", () => {
    expect(() =>
      emitLiturgicalCss([
        {
          path: "semantic.focus.ring",
          category: "liturgical",
          type: "color",
          value: "{primitive.color.neutral.0}",
          resolvedValue: "#ffffff",
          description: "Invalid liturgical focus override.",
          stability: "bootstrap",
          deprecated: false,
          layer: "liturgical"
        }
      ])
    ).toThrow(/prohibited/u);
  });

  test("package exports expose only controlled Phase 1B artifact paths", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      readonly exports: Readonly<Record<string, unknown>>;
    };
    expect(Object.keys(packageJson.exports).sort()).toEqual([
      ".",
      "./css",
      "./css/accessibility",
      "./css/dark",
      "./css/light",
      "./css/liturgical",
      "./css/primitives",
      "./manifest",
      "./metadata",
      "./tokens"
    ]);
  });
});
