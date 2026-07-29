# `@om/workshop-contracts`

Public contract surface for OM Workshop modules and host integration.

## Compatibility policy

- Module IDs use reverse-DNS style identifiers (`@scope/name` or `vendor.module`).
- Semantic versions follow SemVer 2.0 (`major.minor.patch` with optional prerelease).
- Host compatibility ranges use npm-style caret/tilde/comparator ranges over host API versions.
- Serialized manifests must pass `parseWorkshopModuleManifest` / `defineWorkshopModule` before host registration.
- This package never imports OM Workshop application code and never connects to databases.

## Public surface

- `WorkshopModuleManifest` and related DTOs
- Host status / capabilities DTOs
- Actor context, source identity, normalized errors, correlation IDs
- Runtime Zod validation and `defineWorkshopModule()`
