# @om/ui

Experimental Orthodox Metrics React UI package.

Phase 1E establishes the first selection-control component family alongside `Button`, `Link`, `IconButton`, and the text-entry components.
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
- `@om/ui/checkbox`
- `@om/ui/field-error`
- `@om/ui/link`
- `@om/ui/icon-button`
- `@om/ui/label`
- `@om/ui/radio`
- `@om/ui/radio-group`
- `@om/ui/switch`
- `@om/ui/text-area`
- `@om/ui/text-field`
- `@om/ui/css`

## Text Fields

`Label`, `FieldError`, `TextField`, and `TextArea` are experimental. `TextField` forwards refs to `HTMLInputElement`; `TextArea` forwards refs to `HTMLTextAreaElement`; `Label` forwards refs to `HTMLLabelElement`.

Text-entry components require labels. Use `labelVisibility="visually-hidden"` when a visual label is not desired. Placeholder text is not a label. Controlled and uncontrolled values are supported through `value`, `defaultValue`, and `onValueChange`, where callbacks receive only the next string value.

Validation supports native constraints and application-controlled invalid state through `isInvalid` plus `errorMessage`. Error styling uses validation tokens and must not be replaced by liturgical overlays. Disabled and read-only states remain semantically distinct.

## Selection Controls

`Checkbox`, `RadioGroup`, `Radio`, and `Switch` are experimental. `Checkbox` and `Switch` forward refs to the underlying native input. `Radio` forwards refs to its underlying native radio input. `RadioGroup` forwards refs to the radiogroup wrapper.

`Checkbox` and `Switch` support controlled and uncontrolled boolean state through `isSelected`, `defaultSelected`, and `onSelectionChange`. `RadioGroup` owns `Radio` selection and supports controlled and uncontrolled string values through `value`, `defaultValue`, and `onValueChange`.

`Checkbox` supports indeterminate state through `isIndeterminate`. `Radio` values must be non-empty and unique within a `RadioGroup`. Error messages render only when `isInvalid` is active. Selected state uses visible marks or thumb position in addition to color.

## API Status

The APIs are private and experimental. The appearance is not the final Orthodox Metrics visual language.

Do not expose React Aria, React Stately, or `@react-types/*` types in public OM props. Do not add additional component families without a scoped phase or reviewed work item.
