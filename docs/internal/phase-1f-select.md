# Phase 1F Select

Classification: INTERNAL

## Scope

Phase 1F adds one accessible single-selection component to `@om/ui`: `Select`.

No public `ListBox`, `ListBoxItem`, `Popover`, option component, overlay primitive, collection primitive, `ComboBox`, autocomplete, search, multi-select, async option loading, grouped options, custom option rendering, or form orchestration is included.

## Public Contracts

Orthodox Metrics owns `SelectProps` and `SelectOption`. React Aria Components is used internally for select, hidden form control, listbox, option, popover, keyboard, overlay, and accessibility behavior.

`SelectOption` is readonly data:

```ts
interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
}
```

Labels and descriptions remain strings in Phase 1F. JSX option content, icons, nested controls, and raw HTML are not supported.

## Value Model

Public values are `string | null`. `null` means no selection. Empty strings, numbers, symbols, objects, vendor `Key`, vendor `Selection`, collection nodes, and native events are not public values.

Option values and labels must be non-empty after trimming. Values must be unique within one Select. Invalid or duplicate option data fails in development and tests rather than being silently rewritten. Unknown controlled values warn, render no selected option, and do not mutate the supplied value. Unknown default values are rejected.

## Controlled And Uncontrolled Behavior

Controlled usage passes `value` and `onValueChange`. Uncontrolled usage passes `defaultValue`. The component does not convert between modes internally. Explicit `null` is preserved. `onValueChange` receives only `string | null`.

## Label And Placeholder Rules

`label` is mandatory. `labelVisibility="visually-hidden"` is supported and still provides an accessible name. Placeholder text is not a label, not an option, and not submitted as a fabricated value.

## Form Integration

`name`, `form`, and required validation are passed through React Aria's hidden form control behavior. Selected string values submit through the hidden control. No value is submitted when the Select has no known selected value. The public ref targets the visible trigger button, not the hidden form control.

## Read-Only And Disabled Policy

Disabled Selects cannot open, change, or submit according to disabled form-control behavior.

Read-only Selects remain focusable, display their current value, do not open, do not change, and may submit the current selected value. Read-only is not implemented by disabling the entire Select because that would change focus and form behavior.

## Empty Options

When `options.length === 0`, the trigger remains rendered and an explanatory `No options available` message is shown. The Select cannot open an empty interactive list, does not fabricate an option, and does not fabricate a value.

## Keyboard And Overlay Behavior

React Aria Components owns keyboard and overlay behavior. Pointer, Enter, Space, ArrowDown, ArrowUp, Home, End, Escape, Tab, outside interaction, option selection, disabled options, and focus return are covered by unit and browser tests at the OM boundary.

The popover is an internal implementation detail. It aligns to the trigger, uses component overlay tokens, supports scrolling for long lists, closes on dismissal, and is not exported as a general-purpose OM Popover.

## Styling And Tokens

Select CSS is plain CSS in `@layer om.components`. Consumers import token CSS before component CSS:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

Phase 1F adds minimal experimental canonical tokens for Select trigger, placeholder, border, focus ring, popover, option, selected option, disabled option, spacing, sizing, radius, shadow, and z-index references. These are not final Orthodox Metrics design values.

Focus uses protected focus tokens. Invalid styling uses validation/error tokens. Liturgical overlays must not replace validation or focus treatment. Forced-color rules keep trigger, popover, focus, disabled, and selected option states perceivable.

## Package Export

`@om/ui/select` exports only `Select`, `SelectProps`, and `SelectOption`. The root `@om/ui` export includes the same OM-owned API. `@om/ui/css` remains the only component stylesheet export.

Public declarations must not import or mention React Aria Components, React Aria, React Stately, `@react-types/*`, vendor `Key`, vendor `Selection`, collection types, render props, state objects, contexts, or vendor event objects.

## Testing

Coverage includes unit tests, SSR rendering, Storybook examples, Playwright keyboard/browser tests, public declaration verification, token validation, deterministic token generation, build validation, export resolution, package dry runs, and diff review.

## Deferred Work

Grouped options, multi-select, searchable Select, async loading, virtualized options, custom option rendering, ListBox, Popover, ComboBox, consumer migration, final visual design, and broader form orchestration remain deferred.

## Rollback

Rollback is limited to reverting this monorepo PR. No consuming application, package registry, production service, publication, deployment, or GitHub repository setting is changed by Phase 1F.
