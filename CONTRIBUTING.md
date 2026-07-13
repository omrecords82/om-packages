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

Phase 1B artifact work must not introduce final design values, production UI primitives, tenant-specific brand packs, publishing configuration, or deployment behavior.
