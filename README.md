# Orthodox Metrics Packages

This repository is the canonical monorepo for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Phase 0 Status

Phase 0 establishes workspace tooling, validation, package boundaries, Storybook, and minimal bootstrap exports. The exports are intentionally small and marked bootstrap-only; they are not stable public APIs.

## Packages

- `@om/contracts`: shared TypeScript contracts with no internal package dependencies.
- `@om/tokens`: future canonical token source using CSS custom properties.
- `@om/ui`: React UI package that may consume `@om/contracts` and `@om/tokens`.

Dependency direction:

```text
@om/contracts
@om/tokens
@om/ui -> @om/contracts, @om/tokens
```

No package may depend on `apps/storybook`, and internal dependencies must use `workspace:*`.

## Setup

Use Node.js `24.18.0` and Corepack-managed `pnpm@11.10.0`.

```sh
corepack enable
corepack prepare pnpm@11.10.0 --activate
pnpm install
```

## Validation

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm storybook:build
pnpm test:e2e
pnpm pack:check
```

## Storybook

```sh
pnpm storybook
pnpm storybook:build
```

Storybook lives in `apps/storybook` and is for local package preview only.

## Publication Status

All initial packages are marked `private: true` to prevent accidental publication. Registry selection is deferred because the package scope is `@om` while the GitHub owner is `omrecords82`; this repository must not assume GitHub Packages can publish the `@om` scope.

No package should be published until registry ownership, package access, release workflow, and repository permissions are explicitly approved.

## Deployment

This repository must not directly deploy production services. It provides reusable package source, validation, and local preview tooling only.
