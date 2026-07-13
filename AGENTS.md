# AGENTS.md

This repository is the canonical source for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Required Boundaries

- `@om/contracts` must not depend on other internal packages.
- `@om/tokens` must not depend on `@om/ui`.
- `@om/ui` may depend on `@om/contracts` and `@om/tokens`.
- No package may depend on `apps/storybook`.
- Internal package dependencies must use `workspace:*`.
- Circular package dependencies are not permitted.

## Prohibited Coupling

- Do not introduce Modernize or MUI coupling.
- Do not introduce direct database access from reusable packages.
- Do not create tenant-specific forks.
- Do not expose vendor-specific types as normal public contracts unless explicitly approved.
- Do not publish packages or deploy anything without explicit authorization.

## API Changes

- Future public API changes require tests and a Changeset.
- Bootstrap-only and Phase 1A experimental exports are not stable public APIs.
- Serialized public contracts must use explicit JSON-compatible fields and `extensions?: JsonObject` as the only general extensibility point.
- Do not use unrestricted `Record<string, unknown>` in serialized public contracts.
- Token source data is canonical JSON in `packages/tokens/tokens`.
- CSS generation, generated manifests, and final token export paths are Phase 1B build artifacts under `packages/tokens/dist/`.
- Generated token artifacts must not be edited as source or committed.
- Liturgical styling must not override error, warning, success, destructive, validation, focus, disabled-readability, or accessibility-critical tokens.
- Accessibility preferences must remain the highest-precedence theme layer.
- Generated CSS must preserve the cascade layer order `om.defaults, om.app, om.brand, om.liturgical, om.accessibility`.

## Completion Reports

When changing this repository, report the branch, commit, validation commands, failures or warnings, package impact, and whether publishing or deployment occurred.
