# @om/ui

Experimental Orthodox Metrics React UI package.

Phase 1C establishes the component architecture with `Button`, `Link`, and `IconButton`.
Orthodox Metrics owns the public component contracts. React Aria Components provides internal accessibility and interaction behavior and is not re-exported.

## Imports

Consumers must load token CSS before component CSS:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

## Exports

- `@om/ui`
- `@om/ui/button`
- `@om/ui/link`
- `@om/ui/icon-button`
- `@om/ui/css`

## API Status

The APIs are private and experimental. The appearance is not the final Orthodox Metrics visual language.

Do not expose React Aria, React Stately, or `@react-types/*` types in public OM props. Do not add additional component families without a scoped phase or reviewed work item.
