import type {
  AccessibilityPreferences,
  BrandPack,
  ResolvedTokenMap,
  ThemeLayerId,
  ThemeResolutionWarning,
  TokenDefinition,
  TokenPath
} from "@om/contracts";

import { DEFAULT_ACCESSIBILITY_PREFERENCES, THEME_LAYER_ORDER } from "@om/contracts";

import {
  approvedBrandOverrideTokens,
  prohibitedLiturgicalPathFragments,
  themeLayerOrder
} from "./schema/constants.js";
import { getReferencedTokenPath } from "./schema/path-policy.js";

export type ExperimentalResolutionInput = {
  readonly registry: ReadonlyMap<TokenPath, TokenDefinition>;
  readonly brandPack?: BrandPack;
  readonly accessibility?: AccessibilityPreferences;
};

export type ExperimentalResolutionResult = {
  readonly appliedLayers: readonly ThemeLayerId[];
  readonly tokens: ResolvedTokenMap;
  readonly warnings: readonly ThemeResolutionWarning[];
};

export function resolveExperimentalTokens(
  input: ExperimentalResolutionInput
): ExperimentalResolutionResult {
  const resolved = new Map<TokenPath, string | number>();
  const warnings: ThemeResolutionWarning[] = [];

  for (const path of input.registry.keys()) {
    resolved.set(path, resolveToken(path, input.registry, []));
  }

  applyBrandPack(input.brandPack, resolved);
  applyAccessibility(input.accessibility ?? DEFAULT_ACCESSIBILITY_PREFERENCES, resolved, warnings);

  return {
    appliedLayers: [...THEME_LAYER_ORDER],
    tokens: Object.fromEntries(resolved),
    warnings
  };
}

export function assertThemeLayerOrder(order: readonly ThemeLayerId[]): void {
  if (order.join("|") !== themeLayerOrder.join("|")) {
    throw new Error(`Invalid theme layer order: ${order.join(" -> ")}`);
  }
}

export function assertNoCircularReferences(
  registry: ReadonlyMap<TokenPath, TokenDefinition>
): void {
  for (const path of registry.keys()) {
    resolveToken(path, registry, []);
  }
}

function resolveToken(
  path: TokenPath,
  registry: ReadonlyMap<TokenPath, TokenDefinition>,
  stack: readonly TokenPath[]
): string | number {
  if (stack.includes(path)) {
    throw new Error(`Circular token reference detected: ${[...stack, path].join(" -> ")}.`);
  }

  const definition = registry.get(path);
  if (definition === undefined) {
    throw new Error(`Unresolved token reference: ${path}.`);
  }

  if (typeof definition.value === "number") {
    return definition.value;
  }

  const referencedPath = getReferencedTokenPath(definition.value);
  if (referencedPath === undefined) {
    return definition.value;
  }

  return resolveToken(referencedPath, registry, [...stack, path]);
}

function applyBrandPack(
  brandPack: BrandPack | undefined,
  resolved: Map<TokenPath, string | number>
): void {
  for (const [path, reference] of Object.entries(brandPack?.tokenOverrides ?? {})) {
    if (
      !approvedBrandOverrideTokens.includes(path as (typeof approvedBrandOverrideTokens)[number])
    ) {
      throw new Error(`Brand pack attempted prohibited override: ${path}.`);
    }

    const referencedPath = getReferencedTokenPath(reference);
    if (referencedPath === undefined || !resolved.has(referencedPath)) {
      throw new Error(`Brand pack override ${path} references an unresolved token.`);
    }
    resolved.set(path, resolved.get(referencedPath)!);
  }
}

function applyAccessibility(
  preferences: AccessibilityPreferences,
  resolved: Map<TokenPath, string | number>,
  warnings: ThemeResolutionWarning[]
): void {
  if (
    preferences.focusVisibility === "enhanced" &&
    resolved.has("accessibility.focus.enhanced.width")
  ) {
    resolved.set("semantic.focus.width", resolved.get("accessibility.focus.enhanced.width")!);
    warnings.push({
      code: "accessibility-override-applied",
      message: "Enhanced focus visibility applied as final layer.",
      tokenPath: "semantic.focus.width"
    });
  }
}

export function assertLiturgicalOverrideAllowed(path: TokenPath): void {
  if (prohibitedLiturgicalPathFragments.some((fragment) => path.includes(fragment))) {
    throw new Error(`Liturgical overlay attempted prohibited override: ${path}.`);
  }
}
