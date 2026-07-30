# Mantis extraction (T0–T2)

Executed from `om-workshop/templates/mantis-template` (CodedThemes Mantis React TS 4.2.0).

| Tier | Package | Status |
|------|---------|--------|
| T0 shared | `@om/mantis-shared` | done — config, types, color utils, ConfigProvider |
| T0 theme | `@om/mantis-theme` | done — themes + ThemeCustomization |
| T1 extended | `@om/mantis-extended` | done — `@extended` atoms except Breadcrumbs/Snackbar |
| T2 card | `@om/mantis-card` | done — MainCard (Highlighter stripped) + SubCard |
| T3 adapters | — | deferred (on demand) |
| T4 domain cards | — | deferred (cherry-pick later) |
| T5 shells/demos | — | remain in template |

## Build

```bash
pnpm --filter @om/mantis-shared build
pnpm --filter @om/mantis-theme build
pnpm --filter @om/mantis-extended build
pnpm --filter @om/mantis-card build
```

MUI palette / `customShadows` augmentations are copied into each package that
compiles against `theme.vars` so declaration emit stays portable.

Promote further work through Package Studio / normal om-packages PR flow.
Do not commit the raw `mantis-template` tree or template ZIPs into om-workshop.
