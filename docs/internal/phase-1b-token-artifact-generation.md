# Phase 1B Token Artifact Generation

Classification: INTERNAL

Phase 1B adds deterministic generated artifacts for `@om/tokens`. JSON files under `packages/tokens/tokens/` remain the only canonical authored token source.

## Artifact Contract

The generator writes only these package artifacts under `packages/tokens/dist/`:

```text
index.js
index.d.ts
tokens.js
tokens.d.ts
manifest.json
metadata.json
css/om-tokens.css
css/om-primitives.css
css/om-tokens.light.css
css/om-tokens.dark.css
css/om-liturgical.css
css/om-accessibility.css
```

Generated artifacts are build output. They are intentionally ignored by Git and must not be edited directly.

## Determinism

Generation loads canonical JSON, validates schema and policy, normalizes token order, detects CSS custom-property collisions, and emits stable JSON, ESM, declaration, and CSS files. `pnpm check:tokens` generates artifacts repeatedly in temporary directories and compares byte-for-byte output.

Generated metadata includes content digests based on normalized repository inputs. It does not include timestamps, hostnames, absolute paths, Git hashes, or filesystem metadata.

## CSS Naming

CSS variables use `--om-` plus lowercase kebab-case token paths:

```text
primitive.color.neutral.0 -> --om-primitive-color-neutral-0
component.pageShell.background -> --om-component-page-shell-background
```

Authored token references become CSS `var(...)` references so runtime cascade layers can resolve application, brand, liturgical, and accessibility overrides.

## Cascade Layers

Generated CSS declares:

```css
@layer om.defaults, om.app, om.brand, om.liturgical, om.accessibility;
```

`om.defaults` contains primitives, light/dark semantic defaults, and component defaults. `om.app` and `om.brand` are reserved. `om.liturgical` contains approved overlay output. `om.accessibility` remains last.

## Selectors

Generated selectors include:

- `:root`
- `[data-om-theme="light"]`
- `[data-om-theme="dark"]`
- seven `[data-om-liturgical-color="..."]` selectors
- `[data-om-contrast="high"]`
- `[data-om-contrast="forced"]`
- `[data-om-motion="reduced"]`
- `[data-om-text-scale="large"]`
- `[data-om-text-scale="larger"]`
- `[data-om-focus-visibility="enhanced"]`
- `[data-om-color-independence="true"]`
- `@media (prefers-reduced-motion: reduce)`
- `@media (prefers-contrast: more)`
- `@media (forced-colors: active)`

System theme mode is not emitted. Consuming runtimes must resolve system preference to light or dark.

## Package Exports

`@om/tokens` exposes generated ESM/declaration exports at `.` and `./tokens`, JSON artifacts at `./manifest` and `./metadata`, and CSS artifacts under `./css`.

Internal loaders, Zod schemas, source validators, and resolver scripts are not public API.

## Future OMWorkshop Consumption

OMWorkshop should read canonical JSON, `manifest.json`, and `metadata.json` to understand editable token fields, supported schemes, liturgical identifiers, schema versions, digests, and governance metadata. It should propose changes through branches and pull requests, not mutate package files in production.

## Deferred Work

Phase 1B does not implement OMWorkshop editing, production UI primitives, final visual values, brand-pack CSS generation, publishing, registry configuration, or consuming application migration.
