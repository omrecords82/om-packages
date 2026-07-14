# @om/ui

Experimental Orthodox Metrics React UI package.

Phase 1L establishes the first modal drawer component alongside `Button`, `Link`, `IconButton`, text-entry components, selection controls, `Select`, `Dialog`, `AlertDialog`, `Menu`, `Tabs`, `Tooltip`, and `Table`.
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
- `@om/ui/drawer`
- `@om/ui/field-error`
- `@om/ui/link`
- `@om/ui/icon-button`
- `@om/ui/label`
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

Public generic Modal, Overlay, Portal, DialogTrigger, Popover, Tooltip, command dialog, toast, snackbar, and application-specific confirmation workflows remain deferred.

## Drawer

`Drawer` is experimental. It exposes OM-owned placement and size contracts:

```ts
type DrawerPlacement = "start" | "end" | "top" | "bottom";
type DrawerSize = "sm" | "md" | "lg" | "xl";
```

`Drawer` is modal only and uses React Aria Components internally for focus containment, dismissal, overlay, and accessibility behavior. It requires a `title`, supports optional `description`, controlled and uncontrolled open state, optional triggers, dismissable and keyboard-dismiss policies, long-content scrolling, and a public ref to the drawer surface `HTMLDivElement`.

`start` and `end` are logical edge placements. `top` and `bottom` are physical block placements. Permanent sidebars, application shells, swipe gestures, nested drawers, route-driven state, and other persistent layout behavior remain deferred.

## Menu

`Menu` is experimental. It exposes OM-owned serializable item contracts:

```ts
type MenuEntry = MenuActionItem | MenuLinkItem | MenuSeparator;
```

Action and link items require stable unique non-empty string IDs and non-empty labels. Link items require non-empty safe `href` values, and `_blank` links receive `noopener noreferrer` unless the caller supplied an equally safe `rel`.

`Menu` supports controlled and uncontrolled open state through `isOpen`, `defaultOpen`, and `onOpenChange`, where callbacks receive only booleans. Action activation calls `onAction(id)` with the item ID only. Disabled items do not activate, separators are noninteractive, and empty or separator-only menus do not open an empty collection.

The public ref targets the trigger `HTMLButtonElement`. Existing OM `Button` and `IconButton` triggers are supported. Standalone `MenuItem`, `MenuTrigger`, `Popover`, `ContextMenu`, `Menubar`, nested menus, checkbox or radio menu items, icons, custom item rendering, virtualized menus, and router adapters are deferred.

## Tabs

`Tabs` is experimental. It exposes an OM-owned `TabItem` contract:

```ts
interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly content: React.ReactNode;
  readonly isDisabled?: boolean;
}
```

Tab IDs must be stable unique non-empty strings. Labels are strings in Phase 1I and should be non-empty; duplicate labels warn because they can make keyboard navigation ambiguous.

`Tabs` supports controlled and uncontrolled selection through `selectedId`, `defaultSelectedId`, and `onSelectionChange`, where callbacks receive only the selected string ID. When selection is omitted, the first enabled tab is selected. Unknown controlled IDs warn and render no active panel; unknown defaults are rejected.

Horizontal orientation uses Left and Right Arrow navigation; vertical orientation uses Up and Down Arrow navigation. Home and End move to the first and last enabled tabs. Automatic activation selects on focus, while manual activation changes focus first and selects on Enter or Space. `panelMounting="active"` renders only the active panel; `panelMounting="all"` preserves inactive panel content in an inert hidden state. The public ref targets the root `HTMLDivElement`.

Router synchronization, URL state, nested tabs, closable tabs, reorderable tabs, icons, badges, counters, overflow menus, wizard behavior, stepper behavior, and application migration remain deferred.

## Tooltip

`Tooltip` is experimental. It exposes OM-owned placement and delay contracts:

```ts
type TooltipDelay = "immediate" | "standard";
type TooltipPlacement = "top" | "bottom" | "left" | "right" | "...-start" | "...-end";
```

Tooltip content is a non-empty string and is supplemental descriptive content. It is not copied into `aria-label` and is not a substitute for the trigger accessible name. Icon-only triggers must provide an independent accessible name, such as the OM `IconButton` `accessibleLabel`.

`Tooltip` supports controlled and uncontrolled open state through `isOpen`, `defaultOpen`, and `onOpenChange`, where callbacks receive only booleans. `delay="standard"` uses a package-owned 700ms opening delay and a 120ms close delay; `delay="immediate"` opens without an intentional wait. Preferred placement may adjust to stay within the viewport. The decorative arrow is shown by default and may be hidden with `showArrow={false}`.

The public ref targets the trigger `HTMLElement`. Tooltip does not receive or trap focus. Native disabled controls are not wrapped in a new focusable element, so Tooltip interaction for natively disabled controls is not guaranteed. Put critical disabled-state explanations in visible or normally described content.

Public `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, Popover, HoverCard, interactive content, arbitrary JSX content, HTML rendering, and application migration remain deferred.

## Table

`Table` is experimental. It uses native semantic table markup with an OM-owned `TableRowData` and `TableColumn` contract:

```ts
type TableRowData = {
  readonly id: string;
};

type TableColumn<TRow extends TableRowData = TableRowData> = {
  readonly id: string;
  readonly header: string;
  readonly renderCell: (row: TRow) => React.ReactNode;
  readonly isRowHeader?: boolean;
  readonly alignment?: "start" | "center" | "end";
};
```

Every table requires an accessible caption or label and one row-header column when rows are present. `Table` supports controlled data only through the caller-supplied row and column arrays, empty and loading states, density variants, optional striped rows, responsive horizontal containment, and a public ref to the semantic `HTMLTableElement`.

Row actions belong inside cells and must use explicit Button, Link, IconButton, or Menu controls. Sorting, filtering, pagination, spreadsheet behavior, row-click navigation, responsive card conversion, AG Grid replacement, and future data-table orchestration remain deferred.

## API Status

The APIs are private and experimental. The appearance is not the final Orthodox Metrics visual language.

Do not expose React Aria, React Stately, or `@react-types/*` types in public OM props. Do not add additional component families without a scoped phase or reviewed work item.
