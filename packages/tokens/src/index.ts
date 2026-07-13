/**
 * Source-only marker for the canonical JSON token-source architecture.
 * Public Phase 1B token APIs are generated into dist and exported from package subpaths.
 */
export const phase1bTokenSourceStatus = {
  canonicalSource: "json",
  cssGeneration: "generated-in-phase-1b",
  stability: "bootstrap"
} as const;
