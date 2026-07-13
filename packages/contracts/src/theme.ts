export type ThemeMode = "light" | "dark" | "system";

export type ColorScheme = "light" | "dark";

export type LayoutDensity = "compact" | "comfortable" | "spacious";

export type ThemeLayerId =
  | "om-defaults"
  | "application-defaults"
  | "brand-pack"
  | "liturgical-overlay"
  | "accessibility-preferences";

export const THEME_LAYER_ORDER = [
  "om-defaults",
  "application-defaults",
  "brand-pack",
  "liturgical-overlay",
  "accessibility-preferences"
] as const satisfies readonly ThemeLayerId[];
