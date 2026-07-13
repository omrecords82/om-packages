# @om/ui

Experimental Orthodox Metrics React UI package.

Phase 1G establishes the first overlay family alongside `Button`, `Link`, `IconButton`, text-entry components, selection controls, and `Select`.
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
- `@om/ui/dialog`
- `@om/ui/alert-dialog`
- `@om/ui/field-error`
- `@om/ui/link`
- `@om/ui/icon-button`
- `@om/ui/label`
- `@om/ui/radio`
- `@om/ui/radio-group`
- `@om/ui/select`
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

## Select

`Select` is experimental. It exposes an OM-owned `SelectOption` data contract:

```ts
interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
}
```

Values are `string | null`; `null` represents no selection. Option values and labels must be non-empty strings, and values must be unique within one Select. Placeholder text is not an option and is not a label.

`Select` supports controlled and uncontrolled values through `value`, `defaultValue`, and `onValueChange`, where callbacks receive only `string | null`. The public ref targets the visible trigger `HTMLButtonElement`. Hidden form integration submits selected string values and does not submit the placeholder as a value.

Read-only Selects remain focusable, display the current value, and do not open or change. Disabled Selects are unavailable for interaction. Error messages render only when `isInvalid` is active. Standalone ListBox, Popover, grouped options, custom option rendering, searchable Select, multi-select, async loading, and ComboBox are deferred.

## Dialogs

`Dialog` and `AlertDialog` are experimental. Both use React Aria Components internally for modal behavior, focus management, dismissal, and accessibility while exposing only OM-owned props.

`Dialog` requires `title`, supports optional `description`, controlled and uncontrolled open state, optional triggers, dismissable and keyboard-dismiss policies, a visible close button by default, long-content scrolling, and a public ref to the dialog surface `HTMLDivElement`.

`AlertDialog` requires `title`, `description`, `confirmLabel`, and `onConfirm`. It defaults focus to Cancel, always renders a cancel action, does not dismiss through outside interaction, blocks cancel, confirm, and Escape dismissal while pending, and supports `confirmBehavior="close"` or `"manual"`. Destructive confirmations use the OM destructive Button variant but never receive focus by default.

Public generic Modal, Overlay, Portal, DialogTrigger, Popover, Menu, Tooltip, Drawer, command dialog, toast, snackbar, and application-specific confirmation workflows remain deferred.

## API Status

The APIs are private and experimental. The appearance is not the final Orthodox Metrics visual language.

Do not expose React Aria, React Stately, or `@react-types/*` types in public OM props. Do not add additional component families without a scoped phase or reviewed work item.
