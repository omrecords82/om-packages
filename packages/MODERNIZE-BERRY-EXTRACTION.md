# Modernize + Berry extraction

Executed from `om-workshop/templates/{modernize,berry}-template`.

## Modernize

| Tier | Package | Status |
|------|---------|--------|
| T0 shared | `@om/modernize-shared` | done |
| T0 theme | `@om/modernize-theme` | done |
| T1 form | `@om/modernize-form` | done |
| T2 card | `@om/modernize-card` | done (no CodeDialog) |
| T3–T5 | — | deferred / template |

## Berry

| Tier | Package | Status |
|------|---------|--------|
| T0 shared | `@om/berry-shared` | done |
| T0 theme | `@om/berry-theme` | done |
| T1b form | `@om/berry-form` | done |
| T1 atoms / T2 cards | — | deferred (prefer `@om/mantis-*`) |
| T3–T5 | — | deferred / template |

Do not commit template trees or Berry `.env*` into om-workshop.
