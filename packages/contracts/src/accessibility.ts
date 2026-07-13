export type ContrastPreference = "standard" | "high" | "forced";

export type MotionPreference = "standard" | "reduced";

export type TextScalePreference = "standard" | "large" | "larger";

export type FocusVisibilityPreference = "standard" | "enhanced";

export type AccessibilityPreferences = {
  readonly contrast: ContrastPreference;
  readonly motion: MotionPreference;
  readonly textScale: TextScalePreference;
  readonly focusVisibility: FocusVisibilityPreference;
  readonly colorIndependentStatus: boolean;
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
  contrast: "standard",
  motion: "standard",
  textScale: "standard",
  focusVisibility: "standard",
  colorIndependentStatus: true
} as const satisfies AccessibilityPreferences;
