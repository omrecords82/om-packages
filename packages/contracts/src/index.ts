/**
 * Bootstrap-only contract used to prove declaration generation.
 * Not a stable public API.
 */
export type BootstrapContract = {
  readonly packageName: "@om/contracts";
  readonly phase: "phase-0";
};

export const bootstrapContract: BootstrapContract = {
  packageName: "@om/contracts",
  phase: "phase-0"
};
