/**
 * Bootstrap-only tokens used to prove TypeScript and CSS output.
 * Not a stable public API or final design direction.
 */
export const bootstrapTokens = {
  colorSurface: "var(--om-bootstrap-surface)",
  colorText: "var(--om-bootstrap-text)",
  spaceInline: "var(--om-bootstrap-space-inline)"
} as const;

export type BootstrapTokenName = keyof typeof bootstrapTokens;
