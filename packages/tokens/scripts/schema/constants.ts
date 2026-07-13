import type {
  BrandOverrideToken,
  LiturgicalInfluence,
  ProhibitedLiturgicalInfluence,
  ThemeLayerId,
  TokenCategory,
  TokenValueType
} from "@om/contracts";

export const tokenCategories = [
  "primitive",
  "semantic",
  "component",
  "liturgical",
  "accessibility"
] as const satisfies readonly TokenCategory[];

export const tokenValueTypes = [
  "color",
  "dimension",
  "number",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "shadow",
  "string"
] as const satisfies readonly TokenValueType[];

export const themeLayerOrder = [
  "om-defaults",
  "application-defaults",
  "brand-pack",
  "liturgical-overlay",
  "accessibility-preferences"
] as const satisfies readonly ThemeLayerId[];

export const approvedBrandOverrideTokens = [
  "semantic.action.accent",
  "semantic.border.decorative",
  "component.header.accent",
  "component.footer.accent",
  "component.navigation.activeIndicator"
] as const satisfies readonly BrandOverrideToken[];

export const allowedLiturgicalOverrideTokens = [
  "liturgical.red.accent",
  "component.header.accent",
  "component.footer.accent",
  "component.navigation.activeIndicator",
  "semantic.action.accent",
  "semantic.border.decorative"
] as const;

export const prohibitedLiturgicalPathFragments = [
  ".error",
  ".warning",
  ".success",
  ".destructive",
  ".validation",
  ".focus",
  ".disabled",
  "accessibility."
] as const;

export const allowedLiturgicalInfluence = [
  "decorative-accent",
  "non-status-icon",
  "decorative-border",
  "header-accent",
  "footer-accent",
  "page-shell-ornament",
  "primary-action-if-contrast-safe"
] as const satisfies readonly LiturgicalInfluence[];

export const prohibitedLiturgicalInfluence = [
  "error",
  "warning",
  "success",
  "destructive",
  "validation",
  "focus",
  "disabled-readability",
  "accessibility-critical"
] as const satisfies readonly ProhibitedLiturgicalInfluence[];
