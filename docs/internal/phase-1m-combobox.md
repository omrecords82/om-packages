---
classification: INTERNAL
---

# Phase 1M: ComboBox Foundation

## Consumer Discovery

The OM consumer audit found MUI Autocomplete usage across several application areas, especially records and administrative forms. The same audit found divergent manual search, Select, and Autocomplete implementations. Phase 1M fills the editable, locally filtered, single-selection lookup gap.

## Scope

Phase 1M adds one public production component: `ComboBox`.

`ComboBox` combines a text input with static local options, single-option selection, local filtering, and accessible listbox behavior. Remote fetching, custom values, grouped options, and multi-select remain deferred.

## Public Contracts

`ComboBox` exposes these OM-owned contracts:

- `ComboBoxProps`
- `ComboBoxOption`
- `ComboBoxFilterMode`

The ref targets the text input `HTMLInputElement`.

## Select Versus ComboBox

`Select` remains the fixed-choice picker. `ComboBox` is the editable lookup control for static option sets. Typed text is not automatically committed as a selection.

## Option Contract

`ComboBoxOption` reuses the reviewed `SelectOption` shape.

Public option values are stable non-empty strings. Labels are strings only. Descriptions remain strings. Arbitrary JSX labels, custom values, grouped options, and value rewriting are not part of Phase 1M.

## Selection and Input State

Selection and input are distinct public states:

- `selectedValue` / `defaultSelectedValue` use `string | null`
- `inputValue` / `defaultInputValue` use `string`

Selecting an option commits its value and synchronizes the input text to the option label. Editing text clears the committed value. Unmatched text remains text and is not submitted as the selected value.

## Filtering

Filtering is local, deterministic, and label-based. It supports `contains` and `starts-with`. Matching is case-insensitive and Unicode-aware using NFKD normalization with combining-mark removal where the platform supports it. Option order is preserved. Descriptions are not searched.

## Controlled and Uncontrolled Behavior

ComboBox supports controlled and uncontrolled selection, and controlled and uncontrolled input text, in all supported combinations.

Controlled props request changes through callback props. Uncontrolled props initialize state only.

## Form Integration

Only the committed selected value participates in form submission. Typed unmatched input is not fabricated into a submitted value. Read-only ComboBox may submit its committed selected value. Disabled ComboBox follows native disabled form behavior.

## Disabled and Read-Only Policy

Disabled ComboBox cannot open or edit. Read-only ComboBox remains focusable, displays the current committed label, and does not allow edits or opening. Disabled and read-only treatment remain visually distinct.

## Empty Results and Empty Options

When no option matches, ComboBox renders a noninteractive no-results message. When the option set is empty, the input remains available and no fake option is fabricated.

## Keyboard and Overlay Behavior

Arrow, Home, End, Enter, Escape, and Tab behavior is delegated to React Aria internals while OM owns the public contract and local filtering. The listbox popover is viewport-aware, scrollable, and closes on outside interaction.

## Focus and Forced Colors

Focus remains on the input while listbox interaction is active. Enhanced-focus, high-contrast, and forced-colors modes must preserve focus visibility, boundaries, and selected-state clarity.

## Token Usage

ComboBox reuses the field, select, and overlay tokens already established in earlier phases. Phase 1M adds no new canonical tokens.

## Testing Strategy

Coverage includes:

- unit tests for state combinations, filtering, validation, form submission, and SSR
- Storybook examples for selection, filtering, empty states, disabled/read-only behavior, and theme variants
- Playwright coverage for keyboard interaction, filtering, submission, empty/no-results behavior, viewport containment, and theme handling
- public declaration verification for vendor-type leakage
- package dry-run validation for distribution boundaries

## Deferred Work

Deferred items include:

- remote fetching
- asynchronous loading
- fuzzy matching
- custom values
- grouped options
- multi-select
- standalone SearchField
- recent or saved searches

## Rollback

If ComboBox needs to be withdrawn, revert the ComboBox commits and remove the package export and docs updates together so the generated public API remains consistent.
