import { CURRENT_THEME_SCHEMA_VERSION } from "@om/contracts";
import { z } from "zod";

import { approvedBrandOverrideTokens, tokenCategories, tokenValueTypes } from "./constants.js";
import { getReferencedTokenPath, isCanonicalTokenPath } from "./path-policy.js";

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema)
  ])
);

const tokenValueSchema = z.union([
  z.string().refine((value) => {
    if (!value.startsWith("{") && !value.endsWith("}")) {
      return true;
    }
    return getReferencedTokenPath(value) !== undefined;
  }, "Token references must wrap a valid canonical token path in braces."),
  z.number()
]);

export const tokenDefinitionSchema = z
  .object({
    type: z.enum(tokenValueTypes),
    value: tokenValueSchema,
    description: z.string().min(1),
    stability: z.enum(["bootstrap", "experimental", "stable", "deprecated"]),
    deprecated: z.boolean().optional(),
    replacement: z.string().refine(isCanonicalTokenPath).optional(),
    extensions: z.record(z.string(), jsonValueSchema).optional()
  })
  .superRefine((definition, context) => {
    if (definition.stability === "deprecated" && definition.replacement === undefined) {
      context.addIssue({
        code: "custom",
        message: "Deprecated tokens require replacement metadata.",
        path: ["replacement"]
      });
    }
  });

export const tokenSourceDocumentSchema = z.object({
  schemaVersion: z.literal(CURRENT_THEME_SCHEMA_VERSION),
  layer: z.enum(tokenCategories),
  tokens: z.record(z.string().refine(isCanonicalTokenPath), tokenDefinitionSchema),
  extensions: z.record(z.string(), jsonValueSchema).optional()
});

const assetSchema = z
  .object({
    kind: z.enum(["primary-logo", "alternate-logo", "seal", "favicon", "social-preview"]),
    src: z.string().min(1),
    alt: z.string().optional(),
    mediaType: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional()
  })
  .superRefine((asset, context) => {
    if (!isSafeAssetSource(asset.src)) {
      context.addIssue({ code: "custom", message: "Brand asset src is not safe.", path: ["src"] });
    }
    if (asset.kind !== "favicon" && asset.alt === undefined) {
      context.addIssue({
        code: "custom",
        message: "Meaningful brand assets require alternate text.",
        path: ["alt"]
      });
    }
  });

export const brandPackSchema = z
  .object({
    schemaVersion: z.literal(CURRENT_THEME_SCHEMA_VERSION),
    id: z.string().min(1),
    version: z.string().min(1),
    identity: z.object({
      id: z.string().min(1),
      fullChurchName: z.string().min(1),
      shortChurchName: z.string().optional(),
      jurisdiction: z.string().optional(),
      address: z
        .object({
          line1: z.string().min(1),
          line2: z.string().optional(),
          city: z.string().min(1),
          region: z.string().min(1),
          postalCode: z.string().min(1),
          countryCode: z.string().regex(/^[A-Z]{2}$/u)
        })
        .optional(),
      parishWebsite: z.string().url().optional(),
      extensions: z.record(z.string(), jsonValueSchema).optional()
    }),
    assets: z.array(assetSchema).optional(),
    typographyPresetId: z.string().optional(),
    headerPresetId: z.string().optional(),
    footerPresetId: z.string().optional(),
    layoutDensity: z.enum(["compact", "comfortable", "spacious"]),
    supportedColorSchemes: z.array(z.enum(["light", "dark"])).min(1),
    tokenOverrides: z.partialRecord(z.enum(approvedBrandOverrideTokens), z.string()).optional(),
    liturgicalMode: z.enum(["automatic", "manual", "disabled"]),
    extensions: z.record(z.string(), jsonValueSchema).optional()
  })
  .superRefine((brandPack, context) => {
    const uniqueSchemes = new Set(brandPack.supportedColorSchemes);
    if (uniqueSchemes.size !== brandPack.supportedColorSchemes.length) {
      context.addIssue({
        code: "custom",
        message: "Brand packs must not contain duplicate color schemes.",
        path: ["supportedColorSchemes"]
      });
    }
    for (const [path, reference] of Object.entries(brandPack.tokenOverrides ?? {})) {
      if (
        !approvedBrandOverrideTokens.includes(path as (typeof approvedBrandOverrideTokens)[number])
      ) {
        context.addIssue({
          code: "custom",
          message: "Brand override token is not approved.",
          path: ["tokenOverrides", path]
        });
      }
      if (getReferencedTokenPath(reference) === undefined) {
        context.addIssue({
          code: "custom",
          message: "Brand override must be a valid token reference.",
          path: ["tokenOverrides", path]
        });
      }
    }
  });

export function isSafeAssetSource(source: string): boolean {
  if (/^[a-z][a-z0-9+.-]*:/iu.test(source)) {
    try {
      const url = new URL(source);
      return url.protocol === "https:" && url.username === "" && url.password === "";
    } catch {
      return false;
    }
  }

  return !source.startsWith("/") && !source.includes("..") && !source.includes("\\");
}
