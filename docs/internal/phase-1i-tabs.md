# Phase 1I Tabs

Classification: INTERNAL

## Scope

Phase 1I adds the first OM-owned tab family: `Tabs`.

Consumer-discovery evidence from the OM application found MUI Tabs in approximately 36 instances across 32 files, multiple local `TabPanel` implementations with inconsistent ARIA associations, a portal Radix Tabs implementation without confirmed consumers, and no canonical OM-owned tab component. This phase creates the package-level contract only; it does not migrate application code.

## Public Contract

`Tabs` is the only new public production component. It is exported from `@om/ui` and `@om/ui/tabs`.

Public data uses OM-owned string identities:

```ts
interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly content: React.ReactNode;
  readonly isDisabled?: boolean;
}
```

`TabsProps` accepts an `accessibleLabel`, `items`, optional controlled `selectedId`, optional uncontrolled `defaultSelectedId`, `onSelectionChange(id)`, orientation, activation mode, panel mounting mode, disabled state, and class-name escape hatches. Public callbacks expose selected IDs only.

Public rendered components named `Tab`, `TabList`, `TabPanel`, indicators, collections, or router adapters are not exported.

## React Aria Boundary

React Aria Components owns internal tab, tab-list, tab-panel, keyboard, focus, selection, and ARIA behavior. `@om/ui` does not re-export React Aria Components, props, render props, collection types, `Key`, `Selection`, state objects, or event objects.

Public declaration verification fails if vendor types leak through root or subpath declarations.

## Selection

Tab IDs must be stable unique non-empty strings. Empty and duplicate IDs are rejected. Empty labels are rejected. Duplicate labels warn because they create ambiguous navigation.

When selection is omitted, `Tabs` selects the first enabled tab. Controlled unknown IDs warn and render no active panel without mutating caller state. Unknown default IDs are rejected.

When `items` is empty, `Tabs` renders a stable root and labeled tab list without fabricated tabs or panels and warns in development. When all items are disabled, all tabs render disabled and no panel is active.

## Orientation And Activation

Horizontal orientation is the default. Left and Right Arrow navigate enabled tabs. Vertical orientation uses Up and Down Arrow. Home and End move to the first and last enabled tabs.

Automatic activation is the default and selects as focus moves. Manual activation moves focus with arrow keys and selects only on Enter or Space, keeping focused and selected states visually distinct.

## Panel Mounting

`panelMounting="active"` renders only the active panel. This does not preserve panel-local state.

`panelMounting="all"` renders all panels and relies on React Aria inert treatment for inactive panels so state is preserved without leaving inactive content reachable through normal keyboard navigation.

No asynchronous preloading, keep-alive cache, or animation-dependent mounting is included.

## Styling And Tokens

Tabs CSS lives in `@layer om.components` and consumes `@om/tokens` variables. New experimental component tokens under `component.tabs.*` cover list border and gap, tab foreground and selected/disabled states, hover/focus backgrounds, padding, minimum height, radius, selected indicator, panel foreground, panel padding, and panel gap.

The selected state uses a structural indicator and foreground treatment rather than color alone. Focus treatment uses protected focus tokens and remains distinct from selected state. Liturgical overlays may influence approved accents only and must not replace focus, disabled readability, or selected-state clarity.

## Responsive And Accessibility

Horizontal tab lists may scroll horizontally on narrow viewports. Vertical orientation avoids fixed application-navigation assumptions. Large-text mode must not clip labels or indicators.

Forced-colors support keeps tab-list boundaries, focus, selected indicators, and disabled tabs perceivable without suppressing system colors.

## Ref Target

The public ref targets the root `HTMLDivElement`. Individual tab refs are not public in Phase 1I.

## Tests

Coverage includes unit tests for semantics, selection, validation, orientation, activation modes, panel mounting, disabled and empty states, class names, ref forwarding, SSR rendering, public export resolution, public declaration boundaries, Storybook examples, and Playwright keyboard/theme checks.

## Deferred

Deferred work includes router synchronization, URL state, nested tabs, closable tabs, reorderable tabs, draggable tabs, editable labels, icons, badges, counters, overflow menus, scrolling arrow buttons, wizard or stepper behavior, lazy remote loading, asynchronous item definitions, custom tab rendering, and application migration.

## Rollback

Rollback can remove the `@om/ui/tabs` export, `Tabs` source files, Storybook story, Playwright additions, `component.tabs.*` token source file, and related documentation and changesets. No packages are published in this phase.
