# Phase 1A Token Contract Architecture

Classification: INTERNAL

## Scope

Phase 1A establishes framework-independent contracts and canonical JSON token-source data for Orthodox Metrics packages. It does not implement CSS generation, generated token manifests, production UI primitives, or consuming-application migration.

## Contracts

`@om/contracts` defines:

- explicit integer serialized theme schema version
- JSON value contracts
- theme modes, color schemes, layout density, and fixed layer order
- seven liturgical color identifiers and liturgical override policy concepts
- accessibility preferences and defaults
- brand identity, asset references, brand packs, and application defaults
- token definitions, references, categories, value types, and stability
- typed theme configuration and resolved-theme results

The contracts do not expose React, DOM, MUI, Modernize, Storybook, CSS-in-JS, or vendor-specific public types.

## Canonical Token Source

JSON under `packages/tokens/tokens` is the canonical authoring source. Each token source file contains:

- `schemaVersion`
- `layer`
- `tokens`
- optional `extensions`

Token paths use dot notation. Token references use `{token.path}` syntax. CSS custom-property naming is deferred to Phase 1B.

## Validation Rules

`@om/tokens` contains build-time validation scripts using Zod. Zod is not a public dependency of `@om/contracts`.

Validation covers:

- schema versions
- token paths
- token references
- unresolved references
- circular references
- duplicate token paths in a resolution context
- prohibited liturgical overrides
- prohibited brand overrides
- duplicate brand color schemes
- unsafe asset URLs
- invalid manual liturgical preference combinations
- deprecated tokens without replacement metadata

## Resolution

The experimental resolver loads canonical JSON source files, builds a token registry, resolves token references, detects cycles, applies brand-pack overrides, and applies accessibility preferences as the final layer.

Layer order:

```text
om-defaults
application-defaults
brand-pack
liturgical-overlay
accessibility-preferences
```

## Compatibility Policy

Package versions use semantic versioning. Serialized theme and brand data use explicit positive integer schema versions. Future migrations must not silently reinterpret older schema versions.

Bootstrap token values are not final Orthodox Metrics design values.

## Deferred Phase 1B Work

- generated TypeScript token exports
- generated JSON manifests
- generated CSS custom properties
- cascade-layer CSS
- Storybook token previews
- final generated package export paths
