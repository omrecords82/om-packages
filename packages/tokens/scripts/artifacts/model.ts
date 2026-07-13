import type {
  ColorScheme,
  LiturgicalColor,
  TokenCategory,
  TokenDefinition,
  TokenPath,
  TokenStability,
  TokenValue,
  TokenValueType
} from "@om/contracts";

import { CURRENT_THEME_SCHEMA_VERSION, LITURGICAL_COLORS, THEME_LAYER_ORDER } from "@om/contracts";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import type { LoadedTokenDocument } from "../load-token-sources.js";

import { buildTokenRegistry, loadTokenDocuments } from "../load-token-sources.js";
import { resolveExperimentalTokens } from "../resolve-tokens.js";
import { tokenCategories } from "../schema/constants.js";
import { getReferencedTokenPath } from "../schema/path-policy.js";

export const MANIFEST_FORMAT_VERSION = 1;
export const ARTIFACT_FORMAT_VERSION = 1;
export const GENERATOR_VERSION = "phase-1b.1";

export const generatedArtifactPaths = [
  "index.js",
  "index.d.ts",
  "tokens.js",
  "tokens.d.ts",
  "manifest.json",
  "metadata.json",
  "css/om-tokens.css",
  "css/om-primitives.css",
  "css/om-tokens.light.css",
  "css/om-tokens.dark.css",
  "css/om-liturgical.css",
  "css/om-accessibility.css"
] as const;

export type GeneratedArtifactPath = (typeof generatedArtifactPaths)[number];

export type NormalizedToken = {
  readonly path: TokenPath;
  readonly category: TokenCategory;
  readonly type: TokenValueType;
  readonly value: TokenValue;
  readonly resolvedValue: string | number;
  readonly description: string;
  readonly stability: TokenStability;
  readonly deprecated: boolean;
  readonly replacement?: TokenPath;
  readonly layer: TokenCategory;
  readonly colorScheme?: ColorScheme;
};

export type TokenManifest = {
  readonly schemaVersion: typeof CURRENT_THEME_SCHEMA_VERSION;
  readonly manifestFormatVersion: typeof MANIFEST_FORMAT_VERSION;
  readonly tokens: readonly NormalizedToken[];
  readonly tokenPaths: readonly TokenPath[];
  readonly tokenCategories: readonly TokenCategory[];
  readonly tokenTypes: readonly TokenValueType[];
  readonly supportedColorSchemes: readonly ColorScheme[];
  readonly supportedLiturgicalColors: readonly LiturgicalColor[];
};

export type TokenMetadata = {
  readonly artifactFormatVersion: typeof ARTIFACT_FORMAT_VERSION;
  readonly schemaVersion: typeof CURRENT_THEME_SCHEMA_VERSION;
  readonly generatorVersion: typeof GENERATOR_VERSION;
  readonly packageName: "@om/tokens";
  readonly canonicalLayerOrder: typeof THEME_LAYER_ORDER;
  readonly supportedColorSchemes: readonly ColorScheme[];
  readonly supportedLiturgicalColors: readonly LiturgicalColor[];
  readonly tokenCountsByCategory: Readonly<Record<TokenCategory, number>>;
  readonly tokenCountsByStability: Readonly<Record<TokenStability, number>>;
  readonly generatedArtifacts: readonly GeneratedArtifactPath[];
  readonly sourceContentDigest: string;
  readonly generatorContentDigest: string;
};

export type ArtifactModel = {
  readonly manifest: TokenManifest;
  readonly metadata: TokenMetadata;
  readonly lightRegistry: ReadonlyMap<TokenPath, TokenDefinition>;
  readonly darkRegistry: ReadonlyMap<TokenPath, TokenDefinition>;
  readonly primitiveTokens: readonly NormalizedToken[];
  readonly lightTokens: readonly NormalizedToken[];
  readonly darkTokens: readonly NormalizedToken[];
  readonly liturgicalTokens: readonly NormalizedToken[];
  readonly accessibilityTokens: readonly NormalizedToken[];
};

export function tokenPathToCssCustomProperty(path: TokenPath): string {
  return `--om-${path
    .split(".")
    .map((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/gu, "$1-$2")
        .replace(/_/gu, "-")
        .toLowerCase()
    )
    .join("-")}`;
}

export function cssValueForToken(value: TokenValue): string {
  if (typeof value === "number") {
    return String(value);
  }

  const reference = getReferencedTokenPath(value);
  return reference === undefined ? value : `var(${tokenPathToCssCustomProperty(reference)})`;
}

export async function createArtifactModel(
  tokenRoot = join(process.cwd(), "tokens"),
  scriptRoot = join(process.cwd(), "scripts")
): Promise<ArtifactModel> {
  const documents = await loadTokenDocuments(tokenRoot);
  const lightRegistry = buildTokenRegistry(documents, { colorScheme: "light" });
  const darkRegistry = buildTokenRegistry(documents, { colorScheme: "dark" });

  resolveExperimentalTokens({ registry: lightRegistry });
  resolveExperimentalTokens({ registry: darkRegistry });

  const primitiveTokens = normalizeTokensFromDocuments(documents, lightRegistry, ["primitive"]);
  const lightTokens = normalizeTokensFromDocuments(
    documents,
    lightRegistry,
    ["semantic", "component"],
    "light"
  );
  const darkTokens = normalizeTokensFromDocuments(
    documents,
    darkRegistry,
    ["semantic", "component"],
    "dark"
  );
  const liturgicalTokens = normalizeTokensFromDocuments(documents, lightRegistry, ["liturgical"]);
  const accessibilityTokens = normalizeTokensFromDocuments(documents, lightRegistry, [
    "accessibility"
  ]);
  const tokens = [
    ...primitiveTokens,
    ...lightTokens,
    ...darkTokens,
    ...liturgicalTokens,
    ...accessibilityTokens
  ].sort(compareNormalizedTokens);

  assertCssNameCollisions(tokens);

  const manifest: TokenManifest = {
    schemaVersion: CURRENT_THEME_SCHEMA_VERSION,
    manifestFormatVersion: MANIFEST_FORMAT_VERSION,
    tokens,
    tokenPaths: [...new Set(tokens.map((token) => token.path))].sort(),
    tokenCategories,
    tokenTypes: [...new Set(tokens.map((token) => token.type))].sort(),
    supportedColorSchemes: ["light", "dark"],
    supportedLiturgicalColors: LITURGICAL_COLORS
  };

  const metadata: TokenMetadata = {
    artifactFormatVersion: ARTIFACT_FORMAT_VERSION,
    schemaVersion: CURRENT_THEME_SCHEMA_VERSION,
    generatorVersion: GENERATOR_VERSION,
    packageName: "@om/tokens",
    canonicalLayerOrder: THEME_LAYER_ORDER,
    supportedColorSchemes: ["light", "dark"],
    supportedLiturgicalColors: LITURGICAL_COLORS,
    tokenCountsByCategory: countBy(tokens, tokenCategories, (token) => token.category),
    tokenCountsByStability: countBy(
      tokens,
      ["bootstrap", "experimental", "stable", "deprecated"] as const,
      (token) => token.stability
    ),
    generatedArtifacts: generatedArtifactPaths,
    sourceContentDigest: await digestDirectory(tokenRoot),
    generatorContentDigest: await digestDirectory(scriptRoot)
  };

  return {
    manifest,
    metadata,
    lightRegistry,
    darkRegistry,
    primitiveTokens,
    lightTokens,
    darkTokens,
    liturgicalTokens,
    accessibilityTokens
  };
}

export function assertCssNameCollisions(tokens: readonly Pick<NormalizedToken, "path">[]): void {
  const seen = new Map<string, TokenPath>();
  for (const token of tokens) {
    const property = tokenPathToCssCustomProperty(token.path);
    const existing = seen.get(property);
    if (existing !== undefined && existing !== token.path) {
      throw new Error(
        `CSS custom-property collision: ${existing} and ${token.path} both map to ${property}.`
      );
    }
    seen.set(property, token.path);
  }
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`;
}

function normalizeTokensFromDocuments(
  documents: readonly LoadedTokenDocument[],
  registry: ReadonlyMap<TokenPath, TokenDefinition>,
  categories: readonly TokenCategory[],
  colorScheme?: ColorScheme
): readonly NormalizedToken[] {
  return documents
    .filter(({ filePath, document }) => {
      if (!categories.includes(document.layer)) {
        return false;
      }
      if (document.layer !== "semantic" || colorScheme === undefined) {
        return true;
      }
      return filePath.endsWith(`/semantic/${colorScheme}.json`);
    })
    .flatMap(({ document }) =>
      Object.entries(document.tokens).map(([path, definition]) => ({
        path,
        definition: {
          path,
          category: document.layer,
          ...definition
        }
      }))
    )
    .map((definition) => ({
      path: definition.path,
      category: definition.definition.category,
      type: definition.definition.type,
      value: definition.definition.value,
      resolvedValue: resolveAuthoredValue(definition.definition.value, registry, []),
      description: definition.definition.description,
      stability: definition.definition.stability,
      deprecated: definition.definition.deprecated ?? false,
      ...(definition.definition.replacement === undefined
        ? {}
        : { replacement: definition.definition.replacement }),
      layer: definition.definition.category,
      ...(colorScheme === undefined ? {} : { colorScheme })
    }))
    .sort(compareNormalizedTokens);
}

function resolveAuthoredValue(
  value: TokenValue,
  registry: ReadonlyMap<TokenPath, TokenDefinition>,
  stack: readonly TokenPath[]
): string | number {
  if (typeof value === "number") {
    return value;
  }

  const referencedPath = getReferencedTokenPath(value);
  if (referencedPath === undefined) {
    return value;
  }
  if (stack.includes(referencedPath)) {
    throw new Error(
      `Circular token reference detected: ${[...stack, referencedPath].join(" -> ")}.`
    );
  }

  const referenced = registry.get(referencedPath);
  if (referenced === undefined) {
    throw new Error(`Unresolved token reference: ${referencedPath}.`);
  }

  return resolveAuthoredValue(referenced.value, registry, [...stack, referencedPath]);
}

function compareNormalizedTokens(left: NormalizedToken, right: NormalizedToken): number {
  return (
    left.path.localeCompare(right.path) ||
    (left.colorScheme ?? "").localeCompare(right.colorScheme ?? "") ||
    left.category.localeCompare(right.category)
  );
}

function countBy<const T extends string>(
  tokens: readonly NormalizedToken[],
  keys: readonly T[],
  select: (token: NormalizedToken) => T
): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const token of tokens) {
    counts[select(token)] += 1;
  }
  return counts;
}

async function digestDirectory(root: string): Promise<string> {
  const files = await listFiles(root);
  const hash = createHash("sha256");
  for (const file of files) {
    const relativePath = relative(root, file).split(sep).join("/");
    hash.update(relativePath);
    hash.update("\n");
    hash.update(await readFile(file));
    hash.update("\n");
  }
  return `sha256-${hash.digest("hex")}`;
}

async function listFiles(root: string): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".turbo") {
        continue;
      }
      files.push(...(await listFiles(path)));
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".json"))) {
      files.push(path);
    }
  }

  return files.sort();
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJson(child)])
    );
  }
  return value;
}
