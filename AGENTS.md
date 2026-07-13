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
- Bootstrap-only exports in Phase 0 are not stable public APIs.

## Completion Reports

When changing this repository, report the branch, commit, validation commands, failures or warnings, package impact, and whether publishing or deployment occurred.
