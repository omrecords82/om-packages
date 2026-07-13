# Phase 1E Selection Controls

Classification: INTERNAL

## Scope

Phase 1E adds the first Orthodox Metrics selection-control family to `@om/ui`: `Checkbox`, `RadioGroup`, `Radio`, and `Switch`.

No `CheckboxGroup`, `Select`, `ComboBox`, `ListBox`, `SearchField`, `NumberField`, `DateField`, `Slider`, `ToggleButton`, `Form`, domain validation, or consuming-application migration is included.

## Public Contracts

Orthodox Metrics owns all public props and types. React Aria Components is used internally for low-level accessibility and interaction behavior. Public declarations must not expose React Aria, React Stately, `@react-types/*`, vendor render props, vendor state objects, vendor contexts, or vendor/native event objects.

`Checkbox` and `Switch` expose boolean selection through `isSelected`, `defaultSelected`, and `onSelectionChange`. `RadioGroup` owns `Radio` selection and exposes string values through `value`, `defaultValue`, and `onValueChange`. `Radio` has no independent selected-state public contract.

## Behavior

`Checkbox` supports indeterminate state through `isIndeterminate`. The indeterminate state is represented with native semantics and a visible non-color mark.

`RadioGroup` requires a group label. Radio values must be non-empty and unique within a group. Keyboard navigation follows the native radio pattern, with arrow keys moving selection inside the group.

`Switch` renders accessible switch semantics through React Aria. Selected state is represented through track/thumb position and shape, not color alone.

Disabled and read-only states remain distinct. Disabled controls do not change. Read-only controls remain represented separately and do not call OM callbacks.

## Validation

Application-controlled invalid state uses `isInvalid` plus `errorMessage`. Error content renders only when invalid state is active. Error and validation styling uses protected tokens and must not be replaced by liturgical overlays.

## Styling

Selection CSS is plain CSS in `@layer om.components`. Consumers import token CSS before component CSS:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

The stylesheet uses stable OM classes and `data-om-*` attributes. It may consume documented React Aria state attributes internally, but those are not public OM API contracts.

## Tokens

Phase 1E adds minimal experimental component tokens for selection-control labels, descriptions, errors, indicator border/background/selected state, focus ring, disabled treatment, switch track, and switch thumb values. These are not final Orthodox Metrics visual design decisions.

## Focus And Forced Colors

Focus styles use protected focus tokens. Enhanced focus remains capable of overriding normal focus treatment. Forced-color media queries preserve visible borders, selection marks, and focus outlines without suppressing system colors.

## Testing

Coverage includes unit tests, SSR render tests, Storybook stories, Playwright keyboard/browser tests, package export checks, public declaration verification, token validation, deterministic token generation, build validation, and package dry runs.

## Deferred Work

Checkbox groups, broader form orchestration, React Hook Form integration, domain validation, production application migration, and final visual design decisions remain deferred to later reviewed phases.

## Rollback

Rollback is limited to reverting this monorepo PR. No consuming application, package registry, production service, publication, or deployment is changed by Phase 1E.
