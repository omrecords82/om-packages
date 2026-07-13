# Orthodox Metrics Packages

This repository is the canonical monorepo for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Phase 1D Status

Phase 1D extends the permanent `@om/ui` pattern with the first text-entry component family. Orthodox Metrics owns public component APIs, React Aria Components remains an internal behavior dependency, and `@om/tokens` owns styling values. Experimental production component families now include `Button`, `Link`, `IconButton`, `Label`, `FieldError`, `TextField`, and `TextArea`.

The exported contracts, token source files, generated token APIs, manifest, metadata, CSS, and UI components remain experimental bootstrap architecture, not final Orthodox Metrics visual design values.

Canonical JSON token sources remain the only authored source of truth. Generated artifacts are written to `packages/tokens/dist/` during build and are not committed.

## Packages

- `@om/contracts`: shared framework-independent TypeScript contracts with no internal package dependencies.
- `@om/tokens`: canonical JSON token-source data plus validation, experimental resolution tooling, and deterministic generated artifacts.
- `@om/ui`: React UI package that consumes `@om/tokens` and owns OM public component contracts.

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

Generated CSS custom properties use the deterministic `--om-` prefix and lowercase kebab-case token paths:

```text
component.pageShell.background -> --om-component-page-shell-background
```

References remain CSS `var(...)` references in generated CSS so cascade layers can resolve application, brand, liturgical, and accessibility overrides at runtime.

## Generated Token Artifacts

`@om/tokens` generates these private package artifacts:

```text
dist/index.js
dist/index.d.ts
dist/tokens.js
dist/tokens.d.ts
dist/manifest.json
dist/metadata.json
dist/css/om-tokens.css
dist/css/om-primitives.css
dist/css/om-tokens.light.css
dist/css/om-tokens.dark.css
dist/css/om-liturgical.css
dist/css/om-accessibility.css
```

Package exports expose `@om/tokens`, `@om/tokens/tokens`, `@om/tokens/manifest`, `@om/tokens/metadata`, and CSS subpaths under `@om/tokens/css`.

## UI Components

`@om/ui` currently exposes:

- `@om/ui`
- `@om/ui/button`
- `@om/ui/field-error`
- `@om/ui/icon-button`
- `@om/ui/label`
- `@om/ui/link`
- `@om/ui/text-area`
- `@om/ui/text-field`
- `@om/ui/css`

Consumers must import token CSS before component CSS:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

React Aria Components provides internal accessibility and interaction behavior. Application repositories should consume `@om/ui` rather than importing React Aria Components directly when an OM equivalent exists.

Text-entry components require labels. Placeholder text is not a label. `TextField` and `TextArea` support controlled and uncontrolled string values, native constraints, application-controlled invalid state, descriptions, errors, disabled and read-only states, and refs to the underlying native input or textarea.

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

Generated CSS declares this cascade order:

```css
@layer om.defaults, om.app, om.brand, om.liturgical, om.accessibility;
```

Generated selectors include `[data-om-theme="light"]`, `[data-om-theme="dark"]`, seven `[data-om-liturgical-color="..."]` selectors, and accessibility selectors for contrast, motion, text scale, focus visibility, and color-independent status presentation.

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
pnpm generate:tokens
pnpm check:tokens
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

Storybook includes controlled generated-token and UI component previews. They demonstrate bootstrap behavior only and must not be treated as production portal designs.

## Publication Status

All initial packages are marked `private: true` to prevent accidental publication. Registry selection is deferred because the package scope is `@om` while the GitHub owner is `omrecords82`; this repository must not assume GitHub Packages can publish the `@om` scope.

No package should be published until registry ownership, package access, release workflow, and repository permissions are explicitly approved.

## Deployment

This repository must not directly deploy production services. It provides reusable package source, validation, and local preview tooling only.
