# Contributing

Use Node.js `24.18.0` with Corepack-managed `pnpm@11.10.0`.

Run the validation suite before requesting review:

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

Packages are private during bootstrap phases. Do not publish packages or deploy production services from this repository.

Token work must keep JSON under `packages/tokens/tokens/` as the canonical source. Generated artifacts belong under `packages/tokens/dist/`, are build output, and must not be edited as source or committed.

UI work must keep React Aria Components behind `@om/ui` and must not expose React Aria, React Stately, or `@react-types/*` contracts through normal public declarations.

Component CSS must consume `@om/tokens` variables and live in `@layer om.components`. Import `@om/tokens/css` before `@om/ui/css`.

Text-entry components must require accessible labels. Placeholder text is not a label. Public field callbacks should expose string values rather than native or vendor event objects. Disabled and read-only states must remain semantically distinct, and validation styling must use protected validation/error tokens.

Selection controls must be consumed through `@om/ui`. Public selection callbacks expose primitive booleans or strings, not native or vendor events. Selected state must not rely on color alone. `Radio` selection belongs to `RadioGroup`; `CheckboxGroup` and broader form orchestration remain deferred.

New production components require unit tests, Storybook coverage, keyboard/browser coverage, package-boundary verification, and a Changeset. New component families require a scoped phase or reviewed work item.
