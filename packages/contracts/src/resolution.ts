import type { AccessibilityPreferences } from "./accessibility.js";
import type { ApplicationThemeDefaults, BrandPack } from "./branding.js";
import type { JsonObject } from "./json.js";
import type { LiturgicalColor } from "./liturgical.js";
import type { ThemePreferences } from "./preferences.js";
import type { ThemeSchemaVersion } from "./schema-version.js";
import type { ColorScheme, ThemeLayerId } from "./theme.js";
import type { ResolvedTokenMap } from "./tokens.js";

export type ThemeResolutionWarningCode =
  | "invalid-liturgical-resolution"
  | "manual-liturgical-color-ignored"
  | "unsupported-color-scheme"
  | "token-reference-fallback"
  | "accessibility-override-applied";

export type ThemeResolutionWarning = {
  readonly code: ThemeResolutionWarningCode;
  readonly message: string;
  readonly tokenPath?: string;
};

export type ThemeConfiguration = {
  readonly schemaVersion: ThemeSchemaVersion;
  readonly omDefaultsVersion: string;
  readonly applicationDefaults?: ApplicationThemeDefaults;
  readonly brandPack?: BrandPack;
  readonly userPreferences: ThemePreferences;
  readonly extensions?: JsonObject;
};

export type ResolutionMetadata = {
  readonly accessibility: AccessibilityPreferences;
  readonly sourceTokenCount: number;
  readonly resolvedTokenCount: number;
  readonly extensions?: JsonObject;
};

export type ResolvedTheme = {
  readonly schemaVersion: ThemeSchemaVersion;
  readonly colorScheme: ColorScheme;
  readonly liturgicalColor?: LiturgicalColor;
  readonly appliedLayers: readonly ThemeLayerId[];
  readonly tokens: ResolvedTokenMap;
  readonly warnings: readonly ThemeResolutionWarning[];
  readonly metadata: ResolutionMetadata;
};
