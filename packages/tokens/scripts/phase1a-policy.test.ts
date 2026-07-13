import type { LoadedTokenDocument } from "./load-token-sources.js";
import type { TokenDefinition } from "@om/contracts";
import { DEFAULT_ACCESSIBILITY_PREFERENCES, THEME_LAYER_ORDER } from "@om/contracts";
import { describe, expect, it } from "vitest";

import { buildTokenRegistry, loadTokenDocuments } from "./load-token-sources.js";
import {
  assertLiturgicalOverrideAllowed,
  assertNoCircularReferences,
  assertThemeLayerOrder,
  resolveExperimentalTokens
} from "./resolve-tokens.js";
import { getReferencedTokenPath, isCanonicalTokenPath } from "./schema/path-policy.js";
import {
  brandPackSchema,
  themePreferencesSchema,
  tokenDefinitionSchema,
  tokenSourceDocumentSchema
} from "./schema/schemas.js";

describe("phase 1a token path and reference policy", () => {
  it("accepts valid canonical token paths", () => {
    expect(isCanonicalTokenPath("primitive.color.neutral.0")).toBe(true);
    expect(isCanonicalTokenPath("component.button.primary.background")).toBe(true);
    expect(isCanonicalTokenPath("accessibility.focus.enhanced.width")).toBe(true);
  });

  it("rejects invalid canonical token paths", () => {
    expect(isCanonicalTokenPath("primary")).toBe(false);
    expect(isCanonicalTokenPath("mui.button.color")).toBe(false);
    expect(isCanonicalTokenPath("modernize.sidebar.background")).toBe(false);
    expect(isCanonicalTokenPath("church46.header.color")).toBe(false);
    expect(isCanonicalTokenPath("semantic..text")).toBe(false);
    expect(isCanonicalTokenPath("semantic text primary")).toBe(false);
    expect(isCanonicalTokenPath("--om-action-primary")).toBe(false);
  });

  it("accepts valid token references", () => {
    expect(getReferencedTokenPath("{semantic.text.primary}")).toBe("semantic.text.primary");
  });

  it("rejects malformed token references", () => {
    expect(getReferencedTokenPath("semantic.text.primary")).toBeUndefined();
    expect(getReferencedTokenPath("{--om-action-primary}")).toBeUndefined();
    expect(getReferencedTokenPath("{semantic text primary}")).toBeUndefined();
  });
});

describe("phase 1a token source validation", () => {
  it("rejects invalid schema versions", () => {
    expect(() =>
      tokenSourceDocumentSchema.parse({
        schemaVersion: 2,
        layer: "primitive",
        tokens: {}
      })
    ).toThrow();
  });

  it("rejects duplicate token paths in the same base resolution context", () => {
    const docs: LoadedTokenDocument[] = [
      {
        filePath: "a.json",
        document: {
          schemaVersion: 1,
          layer: "primitive",
          tokens: {
            "primitive.space.4": {
              type: "dimension",
              value: "1rem",
              description: "A",
              stability: "bootstrap"
            }
          }
        }
      },
      {
        filePath: "b.json",
        document: {
          schemaVersion: 1,
          layer: "primitive",
          tokens: {
            "primitive.space.4": {
              type: "dimension",
              value: "1rem",
              description: "B",
              stability: "bootstrap"
            }
          }
        }
      }
    ];

    expect(() => buildTokenRegistry(docs)).toThrow(/Duplicate token path/u);
  });

  it("rejects deprecated tokens without replacement metadata", () => {
    expect(() =>
      tokenDefinitionSchema.parse({
        type: "color",
        value: "#fff",
        description: "Deprecated without replacement.",
        stability: "deprecated"
      })
    ).toThrow();
  });
});

describe("phase 1a reference and resolution policy", () => {
  it("rejects unresolved references", () => {
    const registry = new Map<string, TokenDefinition>([
      [
        "semantic.text.primary",
        {
          path: "semantic.text.primary",
          category: "semantic",
          type: "color",
          value: "{primitive.color.missing}",
          description: "Missing reference.",
          stability: "bootstrap"
        }
      ]
    ]);

    expect(() => resolveExperimentalTokens({ registry })).toThrow(/Unresolved token reference/u);
  });

  it("rejects circular references", () => {
    const registry = new Map<string, TokenDefinition>([
      [
        "semantic.a",
        {
          path: "semantic.a",
          category: "semantic",
          type: "color",
          value: "{semantic.b}",
          description: "A",
          stability: "bootstrap"
        }
      ],
      [
        "semantic.b",
        {
          path: "semantic.b",
          category: "semantic",
          type: "color",
          value: "{semantic.a}",
          description: "B",
          stability: "bootstrap"
        }
      ]
    ]);

    expect(() => assertNoCircularReferences(registry)).toThrow(/Circular token reference/u);
  });

  it("accepts the required layer ordering and rejects other orderings", () => {
    expect(() => assertThemeLayerOrder(THEME_LAYER_ORDER)).not.toThrow();
    expect(() => assertThemeLayerOrder(["om-defaults", "brand-pack"] as never)).toThrow(
      /Invalid theme layer order/u
    );
  });

  it("resolves light and dark semantic values differently", async () => {
    const documents = await loadTokenDocuments();
    const light = resolveExperimentalTokens({
      registry: buildTokenRegistry(documents, { colorScheme: "light" })
    });
    const dark = resolveExperimentalTokens({
      registry: buildTokenRegistry(documents, { colorScheme: "dark" })
    });

    expect(light.tokens["semantic.background.canvas"]).toBe("#ffffff");
    expect(dark.tokens["semantic.background.canvas"]).toBe("#111111");
  });

  it("resolves component tokens through semantic references", async () => {
    const registry = buildTokenRegistry(await loadTokenDocuments(), { colorScheme: "light" });
    const resolved = resolveExperimentalTokens({ registry });

    expect(resolved.tokens["component.button.primary.background"]).toBe(
      resolved.tokens["semantic.action.accent"]
    );
  });
});

describe("phase 1a overlay and brand policy", () => {
  it("accepts valid liturgical decorative overrides", () => {
    expect(() => assertLiturgicalOverrideAllowed("component.header.accent")).not.toThrow();
  });

  it("rejects liturgical status and focus overrides", () => {
    expect(() => assertLiturgicalOverrideAllowed("semantic.status.error")).toThrow(/prohibited/u);
    expect(() => assertLiturgicalOverrideAllowed("semantic.focus.ring")).toThrow(/prohibited/u);
  });

  it("applies accessibility overrides as a final layer", async () => {
    const registry = buildTokenRegistry(await loadTokenDocuments(), { colorScheme: "light" });
    const resolved = resolveExperimentalTokens({
      registry,
      accessibility: {
        ...DEFAULT_ACCESSIBILITY_PREFERENCES,
        focusVisibility: "enhanced"
      }
    });

    expect(resolved.appliedLayers.at(-1)).toBe("accessibility-preferences");
    expect(resolved.tokens["semantic.focus.width"]).toBe("3px");
  });

  it("rejects invalid brand override paths", () => {
    expect(() =>
      brandPackSchema.parse({
        schemaVersion: 1,
        id: "bad-brand",
        version: "0.0.0",
        identity: {
          id: "bad-brand",
          fullChurchName: "Bad Brand"
        },
        layoutDensity: "comfortable",
        supportedColorSchemes: ["light"],
        tokenOverrides: {
          "semantic.status.error": "{primitive.color.neutral.900}"
        },
        liturgicalMode: "automatic"
      })
    ).toThrow();
  });

  it("rejects unsafe brand asset URLs", () => {
    expect(() =>
      brandPackSchema.parse({
        schemaVersion: 1,
        id: "bad-brand",
        version: "0.0.0",
        identity: {
          id: "bad-brand",
          fullChurchName: "Bad Brand"
        },
        assets: [
          {
            kind: "primary-logo",
            src: "javascript:alert(1)",
            alt: "Bad logo"
          }
        ],
        layoutDensity: "comfortable",
        supportedColorSchemes: ["light"],
        liturgicalMode: "automatic"
      })
    ).toThrow();
  });

  it("rejects duplicate brand color schemes", () => {
    expect(() =>
      brandPackSchema.parse({
        schemaVersion: 1,
        id: "bad-brand",
        version: "0.0.0",
        identity: {
          id: "bad-brand",
          fullChurchName: "Bad Brand"
        },
        layoutDensity: "comfortable",
        supportedColorSchemes: ["light", "light"],
        liturgicalMode: "automatic"
      })
    ).toThrow();
  });

  it("rejects manual liturgical color outside manual mode", () => {
    expect(() =>
      themePreferencesSchema.parse({
        themeMode: "light",
        liturgicalMode: "automatic",
        manualLiturgicalColor: "red",
        accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES
      })
    ).toThrow();
  });

  it("validates the generic example parish fixture", async () => {
    await expect(
      import("./validate-brand-pack.js").then(({ validateBrandPack }) => validateBrandPack())
    ).resolves.toBeUndefined();
  });
});
