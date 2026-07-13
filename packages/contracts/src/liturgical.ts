import type { JsonObject } from "./json.js";
import type { TokenPath } from "./tokens.js";

export type LiturgicalColor = "white" | "gold" | "green" | "purple" | "red" | "blue" | "black";

export const LITURGICAL_COLORS = [
  "white",
  "gold",
  "green",
  "purple",
  "red",
  "blue",
  "black"
] as const satisfies readonly LiturgicalColor[];

export type LiturgicalThemeMode = "automatic" | "manual" | "disabled";

export type LiturgicalInfluence =
  | "decorative-accent"
  | "non-status-icon"
  | "decorative-border"
  | "header-accent"
  | "footer-accent"
  | "page-shell-ornament"
  | "primary-action-if-contrast-safe";

export type ProhibitedLiturgicalInfluence =
  | "error"
  | "warning"
  | "success"
  | "destructive"
  | "validation"
  | "focus"
  | "disabled-readability"
  | "accessibility-critical";

export const ALLOWED_LITURGICAL_INFLUENCE = [
  "decorative-accent",
  "non-status-icon",
  "decorative-border",
  "header-accent",
  "footer-accent",
  "page-shell-ornament",
  "primary-action-if-contrast-safe"
] as const satisfies readonly LiturgicalInfluence[];

export const PROHIBITED_LITURGICAL_INFLUENCE = [
  "error",
  "warning",
  "success",
  "destructive",
  "validation",
  "focus",
  "disabled-readability",
  "accessibility-critical"
] as const satisfies readonly ProhibitedLiturgicalInfluence[];

export type AutomaticLiturgicalResolution = {
  readonly mode: "automatic";
  readonly sourceId?: string;
  readonly resolvedColor?: LiturgicalColor;
  readonly resolvedAt?: string;
  readonly extensions?: JsonObject;
};

export type ManualLiturgicalSelection = {
  readonly mode: "manual";
  readonly color: LiturgicalColor;
  readonly extensions?: JsonObject;
};

export type DisabledLiturgicalSelection = {
  readonly mode: "disabled";
  readonly extensions?: JsonObject;
};

export type LiturgicalFallbackBehavior = {
  readonly invalidOrUnavailableAutomaticResolution: "no-overlay";
};

export type LiturgicalOverridePolicy = {
  readonly allowedInfluence: readonly LiturgicalInfluence[];
  readonly prohibitedInfluence: readonly ProhibitedLiturgicalInfluence[];
  readonly allowedTokenPaths: readonly TokenPath[];
  readonly prohibitedTokenPaths: readonly TokenPath[];
  readonly fallback: LiturgicalFallbackBehavior;
  readonly extensions?: JsonObject;
};
