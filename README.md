# Orthodox Metrics Packages

This repository is the canonical monorepo for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Phase 1L Status

Phase 1M extends the permanent `@om/ui` pattern with the first editable lookup component: `ComboBox`. Orthodox Metrics owns public component APIs, React Aria Components remains an internal behavior dependency where appropriate, and `@om/tokens` owns styling values. Experimental production component families now include `Button`, `Link`, `IconButton`, `Label`, `FieldError`, `TextField`, `TextArea`, `Checkbox`, `RadioGroup`, `Radio`, `Switch`, `Select`, `ComboBox`, `Dialog`, `AlertDialog`, `Menu`, `Tabs`, `Tooltip`, `Table`, and `Drawer`.

The exported contracts, token source files, generated token APIs, manifest, metadata, CSS, and UI components remain experimental bootstrap architecture, not final Orthodox Metrics visual design values.

Canonical JSON token sources remain the only authored source of truth. Generated artifacts are written to `packages/tokens/dist/` during build and are not committed.

## Packages

- `@om/contracts`: shared framework-independent TypeScript contracts with no internal package dependencies.
- `@om/tokens`: canonical JSON token-source data plus validation, experimental resolution tooling, and deterministic generated artifacts.
- `@om/ui`: React UI package that consumes `@om/tokens` and owns OM public component contracts.

Dependency direction:

```text
@om/contracts
@om/tokens
@om/ui -> @om/contracts, @om/tokens
```

No package may depend on `apps/storybook`, and internal dependencies must use `workspace:*`.

## Token Source

JSON is the canonical token authoring source. Token paths use dot notation:

```text
primitive.color.neutral.0
semantic.background.canvas
component.button.primary.background
liturgical.red.accent
accessibility.focus.enhanced.width
```

Token references wrap canonical token paths in braces:

```text
{semantic.text.primary}
```

References must not use CSS custom-property syntax, whitespace, vendor names, or tenant-specific identifiers.

Generated CSS custom properties use the deterministic `--om-` prefix and lowercase kebab-case token paths:

```text
component.pageShell.background -> --om-component-page-shell-background
```

References remain CSS `var(...)` references in generated CSS so cascade layers can resolve application, brand, liturgical, and accessibility overrides at runtime.

## Generated Token Artifacts

`@om/tokens` generates these private package artifacts:

```text
dist/index.js
dist/index.d.ts
dist/tokens.js
dist/tokens.d.ts
dist/manifest.json
dist/metadata.json
dist/css/om-tokens.css
dist/css/om-primitives.css
dist/css/om-tokens.light.css
dist/css/om-tokens.dark.css
dist/css/om-liturgical.css
dist/css/om-accessibility.css
```

Package exports expose `@om/tokens`, `@om/tokens/tokens`, `@om/tokens/manifest`, `@om/tokens/metadata`, and CSS subpaths under `@om/tokens/css`.

## UI Components

`@om/ui` currently exposes:

- `@om/ui`
- `@om/ui/button`
- `@om/ui/checkbox`
- `@om/ui/combo-box`
- `@om/ui/dialog`
- `@om/ui/alert-dialog`
- `@om/ui/drawer`
- `@om/ui/field-error`
- `@om/ui/icon-button`
- `@om/ui/label`
- `@om/ui/link`
- `@om/ui/menu`
- `@om/ui/radio`
- `@om/ui/radio-group`
- `@om/ui/select`
- `@om/ui/table`
- `@om/ui/switch`
- `@om/ui/tabs`
- `@om/ui/text-area`
- `@om/ui/text-field`
- `@om/ui/tooltip`
- `@om/ui/css`

Consumers must import token CSS before component CSS:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

React Aria Components provides internal accessibility and interaction behavior. Application repositories should consume `@om/ui` rather than importing React Aria Components directly when an OM equivalent exists.

Text-entry components require labels. Placeholder text is not a label. `TextField` and `TextArea` support controlled and uncontrolled string values, native constraints, application-controlled invalid state, descriptions, errors, disabled and read-only states, and refs to the underlying native input or textarea.

Selection controls require accessible labels through visible child content or a group label. `Checkbox` and `Switch` support controlled and uncontrolled boolean state. `RadioGroup` owns `Radio` selection and exposes string values through `onValueChange`. Error messages render only when invalid state is active. Selected, disabled, read-only, invalid, and focused states are represented without exposing React Aria contracts.

`Select` exposes an OM-owned `SelectOption` data contract and `string | null` value model. Option values and labels must be non-empty strings, values must be unique, and `null` represents no selection. Placeholder text is not an option or a label. `Select` supports controlled and uncontrolled values, hidden form integration for selected string values, read-only behavior that remains focusable but does not open or change, disabled options, empty-options behavior, descriptions, errors, and a ref to the visible trigger `HTMLButtonElement`. Standalone `ListBox`, `Popover`, grouped options, multi-select, searchable Select, async loading, custom option rendering, and other richer lookup patterns remain deferred.

`ComboBox` is an experimental editable lookup control. It reuses the reviewed `SelectOption` shape as `ComboBoxOption`, exposes selected values as `string | null`, exposes input text as `string`, and filters static local options with deterministic contains or starts-with matching on labels. Typed text is not a committed value, arbitrary custom values remain deferred, and remote fetching stays application-owned. The public ref targets the text input `HTMLInputElement`. Read-only and disabled behavior remain distinct, and form submission includes only the committed selected value.

`Dialog` and `AlertDialog` are experimental modal overlays. `Dialog` requires a title, supports optional descriptions, controlled and uncontrolled open state, optional triggers, dismissable and keyboard-dismiss policies, a visible close button by default, internal focus trapping, focus restoration, long-content scrolling, and a public ref to the dialog surface `HTMLDivElement`. `AlertDialog` requires a title and consequence description, defaults focus to Cancel, does not dismiss on outside interaction, blocks dismissal while confirmation is pending, exposes no event objects from confirm or cancel callbacks, and is intended to support future replacement of ad-hoc confirmation patterns.

`Menu` is an experimental action-menu component using OM-owned serializable item contracts. `MenuEntry` supports action items, link items, and separators with stable unique string IDs. `onAction` receives only the selected action ID. Link items render semantic anchors and `_blank` links receive safe `rel` behavior. The public ref targets the trigger `HTMLButtonElement`. Empty menus and separator-only menus do not open an empty interactive collection. Public generic Popover, MenuItem, MenuTrigger, ContextMenu, Menubar, nested menus, router adapters, and application migration remain deferred.

`Tabs` is an experimental tab component using OM-owned `TabItem` data with stable unique string IDs and string labels. `onSelectionChange` receives only the selected tab ID. Tabs support controlled and uncontrolled selection, horizontal and vertical orientation, automatic and manual activation, active-only or all-panel mounting, empty and all-disabled behavior, and a public ref to the root `HTMLDivElement`. Public `Tab`, `TabList`, `TabPanel`, router synchronization, closable/reorderable tabs, nested tabs, wizards, steppers, overflow menus, icons, and badges remain deferred.

`Tooltip` is an experimental supplemental-description component using string-only content. Tooltip text does not replace the trigger's accessible name; icon-only triggers must provide an independent accessible name. `Tooltip` supports controlled and uncontrolled open state, package-owned immediate and standard delays, preferred placements, optional decorative arrow rendering, hover and focus opening, Escape dismissal, and a public ref to the trigger `HTMLElement`. Public `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, Popover, HoverCard, interactive tooltip content, arbitrary JSX content, and application migration remain deferred.

`Table` is an experimental semantic display table using native `<table>` markup. It exposes OM-owned `TableRowData` and `TableColumn` contracts with stable string IDs, requires an accessible caption or label, and requires exactly one row-header column when rows are present. `Table` supports empty and loading states, density variants, optional striped rows, responsive horizontal containment, interactive controls inside cells, and a public ref to the semantic `HTMLTableElement`. Sorting, filtering, pagination, row-click navigation, spreadsheet behavior, responsive card conversion, AG Grid replacement, and future data-table orchestration remain deferred.

`Drawer` is an experimental modal overlay panel that enters from a logical or physical viewport edge. It exposes OM-owned placement and size contracts, requires a title, supports optional descriptions, controlled and uncontrolled open state, optional triggers, focus trapping and restoration, dismissable and keyboard-dismiss policies, long-content scrolling, and a public ref to the drawer surface `HTMLDivElement`. Permanent sidebars, application shells, bottom-sheet gestures, nested drawers, route-driven drawer state, and other persistent layout behaviors remain deferred.

## Theme Precedence

Theme layers resolve in this permanent order:

```text
om-defaults
application-defaults
brand-pack
liturgical-overlay
accessibility-preferences
```

Accessibility preferences are always the final layer. Liturgical styling must not override status, validation, destructive, focus, disabled-readability, or accessibility-critical tokens.

Brand packs may only override approved decorative or accent token roles and must use token references, not raw arbitrary colors.

Generated CSS declares this cascade order:

```css
@layer om.defaults, om.app, om.brand, om.liturgical, om.accessibility;
```

Generated selectors include `[data-om-theme="light"]`, `[data-om-theme="dark"]`, seven `[data-om-liturgical-color="..."]` selectors, and accessibility selectors for contrast, motion, text scale, focus visibility, and color-independent status presentation.

## Schema Versioning

Serialized theme and brand data use the explicit integer schema version exported by `@om/contracts`.

Package versions continue to use semantic versioning. Increment the serialized schema version only when stored theme or brand configuration requires migration.

## Setup

Use Node.js `24.18.0` and Corepack-managed `pnpm@11.10.0`.

```sh
corepack enable
corepack prepare pnpm@11.10.0 --activate
pnpm install
```

## Validation

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:tokens
pnpm generate:tokens
pnpm check:tokens
pnpm build
pnpm storybook:build
pnpm test:e2e
pnpm pack:check
```

## Storybook

```sh
pnpm storybook
pnpm storybook:build
```

Storybook lives in `apps/storybook` and is for local package preview only.

Storybook includes controlled generated-token and UI component previews. They demonstrate bootstrap behavior only and must not be treated as production portal designs.

## Publication Status

All initial packages are marked `private: true` to prevent accidental publication. Registry selection is deferred because the package scope is `@om` while the GitHub owner is `omrecords82`; this repository must not assume GitHub Packages can publish the `@om` scope.

No package should be published until registry ownership, package access, release workflow, and repository permissions are explicitly approved.

## Deployment

This repository must not directly deploy production services. It provides reusable package source, validation, and local preview tooling only.
