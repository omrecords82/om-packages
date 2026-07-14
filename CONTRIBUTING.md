# Contributing

Use Node.js `24.18.0` with Corepack-managed `pnpm@11.10.0`.

Run the validation suite before requesting review:

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

Packages are private during bootstrap phases. Do not publish packages or deploy production services from this repository.

Token work must keep JSON under `packages/tokens/tokens/` as the canonical source. Generated artifacts belong under `packages/tokens/dist/`, are build output, and must not be edited as source or committed.

UI work must keep React Aria Components behind `@om/ui` and must not expose React Aria, React Stately, or `@react-types/*` contracts through normal public declarations.

Component CSS must consume `@om/tokens` variables and live in `@layer om.components`. Import `@om/tokens/css` before `@om/ui/css`.

Text-entry components must require accessible labels. Placeholder text is not a label. Public field callbacks should expose string values rather than native or vendor event objects. Disabled and read-only states must remain semantically distinct, and validation styling must use protected validation/error tokens.

Selection controls must be consumed through `@om/ui`. Public selection callbacks expose primitive booleans or strings, not native or vendor events. Selected state must not rely on color alone. `Radio` selection belongs to `RadioGroup`; `CheckboxGroup` and broader form orchestration remain deferred.

Standard Select behavior must be consumed through `@om/ui/select`. Public Select values are `string | null`; options require stable unique non-empty string values and non-empty labels. Placeholder text is not an option or a label. Do not expose React Aria `Key`, `Selection`, collection, ListBox, Popover, or Select prop types in public declarations.

Standard dialogs must be consumed through `@om/ui/dialog` and `@om/ui/alert-dialog`. Public dialog callbacks expose booleans or no-argument callbacks, never press, keyboard, pointer, or overlay events. Dialogs require titles. AlertDialogs require titles and consequence descriptions, default focus to Cancel, do not dismiss through outside interaction, and block dismissal while confirmation is pending. Do not expose React Aria Dialog, Modal, ModalOverlay, DialogTrigger, overlay state, or press-event types in public declarations.

Standard Drawers must be consumed through `@om/ui/drawer`. Drawers are modal overlay panels with logical or physical edge placement, require titles, support controlled and uncontrolled open state, and expose only boolean open-state callbacks. Do not use Drawers as permanent navigation rails, application shells, or bottom-sheet gestures. Do not expose React Aria Dialog, Modal, ModalOverlay, DialogTrigger, placement, overlay state, or press-event types in public declarations.

Standard action menus must be consumed through `@om/ui/menu`. Public Menu entries are OM-owned serializable action, link, and separator definitions with stable unique string IDs. Public callbacks expose IDs and booleans, never vendor keys, collection objects, state, or events. Destructive action styling must not rely only on color. Generic Popover, ContextMenu, Menubar, submenu support, and router adapters remain deferred.

Standard application tabs must be consumed through `@om/ui/tabs`. Public `TabItem` entries use stable unique non-empty string IDs and string labels. Public callbacks expose selected IDs only, never vendor keys, selection objects, focus events, or keyboard events. Selected and focused states must remain distinguishable and must not rely only on color. Router synchronization, nested tabs, closable or reorderable tabs, wizard or stepper behavior, and overflow menus remain deferred.

Standard supplemental Tooltips must be consumed through `@om/ui/tooltip`. Tooltip content supplements the trigger accessible name and must not replace it. Icon-only triggers require an independent accessible name. Tooltip content is string-only in Phase 1J, must not contain interactive controls, and must not receive or trap focus. Public callbacks expose boolean open state only, never vendor trigger, placement, overlay, state, render-prop, focus, hover, pointer, press, or keyboard events. Generic Popover, HoverCard, Coachmark, interactive overlay behavior, and Tooltip-based application migration remain deferred.

Standard semantic display tables must be consumed through `@om/ui/table`. Tables use native semantic table markup, require an accessible caption or label, and require one designated row-header column when rows are present. Public row and column contracts use stable unique string IDs, and row actions must use explicit Button, Link, IconButton, or Menu controls inside cells. Sorting, filtering, pagination, row-click navigation, spreadsheet behavior, and AG Grid/TanStack/MUI table contracts remain deferred.

New production components require unit tests, Storybook coverage, keyboard/browser coverage, package-boundary verification, and a Changeset. New component families require a scoped phase or reviewed work item.
