# Orthodox Metrics Packages

This repository is the canonical monorepo for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Phase 1A Status

Phase 1A establishes framework-independent theme contracts and canonical JSON token-source data. The exported contracts and token source files are experimental bootstrap architecture, not final production APIs or final Orthodox Metrics visual design values.

CSS custom property generation, generated token manifests, cascade-layer CSS, Storybook token previews, and final generated package export paths are deferred to Phase 1B.

## Packages

- `@om/contracts`: shared framework-independent TypeScript contracts with no internal package dependencies.
- `@om/tokens`: canonical JSON token-source data plus Phase 1A validation and experimental resolution tooling.
- `@om/ui`: React UI package that may consume `@om/contracts` and `@om/tokens`.

Dependency direction:

```text
@om/contracts
@om/tokens
@om/ui -> @om/contracts, @om/tokens
```

No package may depend on `apps/storybook`, and internal dependencies must use `workspace:*`.

## Token Source

JSON is the canonical token authoring source. Token paths use dot notation:

```text
primitive.color.neutral.0
semantic.background.canvas
component.button.primary.background
liturgical.red.accent
accessibility.focus.enhanced.width
```

Token references wrap canonical token paths in braces:

```text
{semantic.text.primary}
```

References must not use CSS custom-property syntax, whitespace, vendor names, or tenant-specific identifiers.

## Theme Precedence

Theme layers resolve in this permanent order:

```text
om-defaults
application-defaults
brand-pack
liturgical-overlay
accessibility-preferences
```

Accessibility preferences are always the final layer. Liturgical styling must not override status, validation, destructive, focus, disabled-readability, or accessibility-critical tokens.

Brand packs may only override approved decorative or accent token roles and must use token references, not raw arbitrary colors.

## Schema Versioning

Serialized theme and brand data use the explicit integer schema version exported by `@om/contracts`.

Package versions continue to use semantic versioning. Increment the serialized schema version only when stored theme or brand configuration requires migration.

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
pnpm validate:tokens
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
