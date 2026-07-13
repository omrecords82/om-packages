import type { AccessibilityPreferences } from "./accessibility.js";
import type { JsonObject } from "./json.js";
import type { LiturgicalColor, LiturgicalThemeMode } from "./liturgical.js";
import type { ThemeMode } from "./theme.js";

export type ThemePreferences = {
  readonly themeMode: ThemeMode;
  readonly liturgicalMode: LiturgicalThemeMode;
  readonly manualLiturgicalColor?: LiturgicalColor;
  readonly accessibility: AccessibilityPreferences;
  readonly extensions?: JsonObject;
};
