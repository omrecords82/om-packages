# @om/tokens

Canonical Orthodox Metrics token source data, validation tooling, and deterministic generated token artifacts.

JSON under `tokens/` is the canonical authoring format. Generated artifacts are written to `dist/` and must not be edited as source or committed.

Phase 1B generates experimental ESM token exports, TypeScript declarations, normalized manifest JSON, deterministic metadata, and CSS custom-property bundles.

Phase 1C adds minimal experimental component-state tokens for the initial `@om/ui` Button and Link styling. These values prove the token pipeline and are not final design decisions.

Phase 1D adds minimal experimental field and input tokens for `Label`, `FieldError`, `TextField`, and `TextArea`. These tokens prove component styling, validation treatment, and focus behavior only; they are not final Orthodox Metrics design values.

Phase 1E adds minimal experimental selection-control tokens for `Checkbox`, `RadioGroup`, `Radio`, and `Switch`. These tokens prove selected-state marks, validation treatment, disabled/read-only styling, and focus behavior only; they are not final Orthodox Metrics design values.

Phase 1F adds minimal experimental Select tokens for trigger, placeholder, option, popover, disabled/read-only, and selected-state styling. These tokens prove accessible single-selection styling and overlay behavior only; they are not final Orthodox Metrics design values.

Package exports:

- `@om/tokens`
- `@om/tokens/tokens`
- `@om/tokens/manifest`
- `@om/tokens/metadata`
- `@om/tokens/css`
- `@om/tokens/css/primitives`
- `@om/tokens/css/light`
- `@om/tokens/css/dark`
- `@om/tokens/css/liturgical`
- `@om/tokens/css/accessibility`

Validation scripts cover token source documents, brand-pack fixtures, references, circular references, layer policy, liturgical override restrictions, accessibility precedence, generated artifact shape, CSS variable references, and deterministic output.

Run:

```sh
pnpm validate:phase1a
pnpm generate:artifacts
pnpm check:artifacts
```
