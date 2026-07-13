# @om/ui

Experimental Orthodox Metrics React UI package.

Phase 1D establishes the text-entry component family alongside `Button`, `Link`, and `IconButton`.
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
- `@om/ui/field-error`
- `@om/ui/link`
- `@om/ui/icon-button`
- `@om/ui/label`
- `@om/ui/text-area`
- `@om/ui/text-field`
- `@om/ui/css`

## Text Fields

`Label`, `FieldError`, `TextField`, and `TextArea` are experimental. `TextField` forwards refs to `HTMLInputElement`; `TextArea` forwards refs to `HTMLTextAreaElement`; `Label` forwards refs to `HTMLLabelElement`.

Text-entry components require labels. Use `labelVisibility="visually-hidden"` when a visual label is not desired. Placeholder text is not a label. Controlled and uncontrolled values are supported through `value`, `defaultValue`, and `onValueChange`, where callbacks receive only the next string value.

Validation supports native constraints and application-controlled invalid state through `isInvalid` plus `errorMessage`. Error styling uses validation tokens and must not be replaced by liturgical overlays. Disabled and read-only states remain semantically distinct.

## API Status

The APIs are private and experimental. The appearance is not the final Orthodox Metrics visual language.

Do not expose React Aria, React Stately, or `@react-types/*` types in public OM props. Do not add additional component families without a scoped phase or reviewed work item.
