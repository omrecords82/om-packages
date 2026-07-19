# @om/contracts

Framework-independent Orthodox Metrics contracts for shared package boundaries.

Phase 1A contracts are experimental and private. They must not expose React, DOM, MUI, Modernize, Storybook, CSS-in-JS, or vendor-specific public types.

The package defines explicit integer serialized schema versions, theme layer ordering, liturgical color policy, accessibility preferences, brand-pack contracts, token contracts, resolved-theme result types, and canonical sacramental record schemas (baptism, marriage, funeral) aligned with OM REST field names.

Sacramental schemas use [Zod](https://zod.dev) for runtime validation of create/update/list payloads consumed by Wave H editors and shared clients.
