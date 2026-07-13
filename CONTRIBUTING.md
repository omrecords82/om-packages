# Contributing

Use Node.js `24.18.0` with Corepack-managed `pnpm@11.10.0`.

Run the validation suite before requesting review:

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

Packages are private during Phase 0. Do not publish packages or deploy production services from this repository.

Phase 1A token work must keep JSON as the canonical token source and must not introduce CSS generation, final design values, production UI primitives, or tenant-specific brand packs.
