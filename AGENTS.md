# AGENTS.md

This repository is the canonical source for reusable Orthodox Metrics packages under the `@om/*` namespace.

## Required Boundaries

- `@om/contracts` must not depend on other internal packages.
- `@om/tokens` must not depend on `@om/ui`.
- `@om/ui` may depend on `@om/contracts` and `@om/tokens`.
- No package may depend on `apps/storybook`.
- Internal package dependencies must use `workspace:*`.
- Circular package dependencies are not permitted.

## Prohibited Coupling

- Do not introduce Modernize or MUI coupling.
- Do not introduce direct database access from reusable packages.
- Do not create tenant-specific forks.
- Do not expose vendor-specific types as normal public contracts unless explicitly approved.
- Do not publish packages or deploy anything without explicit authorization.

## API Changes

- Future public API changes require tests and a Changeset.
- Bootstrap-only and Phase 1A experimental exports are not stable public APIs.
- Serialized public contracts must use explicit JSON-compatible fields and `extensions?: JsonObject` as the only general extensibility point.
- Do not use unrestricted `Record<string, unknown>` in serialized public contracts.
- Token source data is canonical JSON in `packages/tokens/tokens`.
- CSS generation, generated manifests, and final token export paths are Phase 1B build artifacts under `packages/tokens/dist/`.
- Generated token artifacts must not be edited as source or committed.
- Liturgical styling must not override error, warning, success, destructive, validation, focus, disabled-readability, or accessibility-critical tokens.
- Accessibility preferences must remain the highest-precedence theme layer.
- Generated CSS must preserve the cascade layer order `om.defaults, om.app, om.brand, om.liturgical, om.accessibility`.
- `@om/ui` owns public UI contracts.
- React Aria Components is an internal `@om/ui` implementation dependency.
- Consuming applications must not import React Aria Components directly when an `@om/ui` equivalent exists.
- Vendor prop types must not be extended or aliased as public OM props.
- OM components must use semantic or component tokens from `@om/tokens`.
- Production components require unit, Storybook, keyboard, and package-boundary tests.
- New component families require a scoped phase or reviewed work item.
- Standard text-entry components must be consumed through `@om/ui`.
- Applications must not import React Aria text-field primitives when an OM equivalent exists.
- Every field requires an accessible label; placeholder text is never a label.
- Public field callbacks expose values, not vendor or native event objects.
- Error and validation tokens cannot be replaced by liturgical overlays.
- Read-only and disabled behavior must remain semantically distinct.
- Public field props must not extend vendor interfaces.
- New field families require reviewed scope and tests.
- Form orchestration belongs in a later `@om/forms` package or reviewed layer, not inside these primitives.
- Selection controls must be consumed through `@om/ui`.
- Applications must not import React Aria checkbox, radio, or switch primitives when an OM equivalent exists.
- Public selection callbacks expose primitive booleans or strings, not native or vendor event objects.
- Selected state must not rely on color alone.
- Public selection component props must not extend vendor interfaces.
- Error and focus tokens cannot be replaced by liturgical overlays.
- Disabled and read-only selection behavior must remain distinct.
- `Radio` selection is owned by `RadioGroup`.
- `CheckboxGroup` remains deferred.
- Form orchestration belongs in a later `@om/forms` package or reviewed integration layer.
- Standard Select behavior must be consumed through `@om/ui`.
- Applications must not import React Aria Select, ListBox, Popover, or collection primitives when implementing a standard OM Select.
- OM Select values are strings or null; vendor `Key` and `Selection` types are prohibited in the public API.
- Select options require stable unique non-empty string values and non-empty labels.
- Select placeholder text is not an option and is never a label.
- Select selected state must not rely only on color.
- Public Select callbacks expose values, not native or vendor events.
- Read-only and disabled Select behavior must remain distinct.
- Validation and focus tokens cannot be replaced by liturgical overlays.
- Standalone ListBox and ComboBox require separately reviewed phases.
- Standard dialogs must be consumed through `@om/ui`.
- Applications must not directly import React Aria Dialog, Modal, ModalOverlay, or DialogTrigger primitives when an OM equivalent exists.
- Public dialog props must not extend vendor interfaces.
- Public dialog callbacks must not expose press, keyboard, pointer, or overlay events.
- Every Dialog requires a title.
- Every AlertDialog requires a title and consequence description.
- AlertDialog defaults focus to Cancel.
- Destructive confirmation must not receive initial focus by default.
- AlertDialog outside interaction must not dismiss.
- Pending confirmation blocks dismissal.
- Dialog focus must be trapped and restored correctly.
- Destructive, warning, validation, and focus behavior cannot be replaced by liturgical overlays.
- Standard action menus must be consumed through `@om/ui`.
- Applications must not import React Aria Menu, MenuItem, MenuTrigger, Popover, or collection primitives for standard OM action menus.
- Public Menu items use stable unique string IDs.
- Public Menu callbacks expose IDs, not events.
- Menu labels are strings in Phase 1H.
- Menu separators are noninteractive.
- Destructive Menu actions must not rely only on color.
- Vendor `Key`, `Selection`, collection, node, state, and event types are prohibited in the public Menu API.
- Generic Popover, ContextMenu, Menubar, submenu, router-adapter behavior, and Drawer require separately reviewed phases.
- Standard application tabs must be consumed through `@om/ui`.
- Applications must not import React Aria Tabs, TabList, Tab, or TabPanel primitives when an OM equivalent exists.
- Tab IDs must be stable unique non-empty strings.
- Public Tabs callbacks expose IDs, not selection objects or events.
- Public Tabs props must not extend vendor interfaces.
- Tab labels are strings in Phase 1I, and interactive content is prohibited inside tab labels.
- Tabs selected state must not rely only on color.
- Tabs focus and selected states must remain distinguishable.
- Router synchronization requires an application adapter or separately reviewed package contract.
- Closable, reorderable, nested, wizard, stepper, and overflow-menu tabs require separately reviewed phases.
- Standard supplemental Tooltips must be consumed through `@om/ui`.
- Applications must not import React Aria Tooltip or TooltipTrigger directly when an OM equivalent exists.
- Tooltip content supplements the trigger accessible name; it does not replace it.
- Icon-only Tooltip triggers require an independent accessible name.
- Tooltip content is string-only in Phase 1J.
- Tooltip must not contain interactive controls.
- Tooltip must not trap or receive focus.
- Public Tooltip callbacks expose boolean state, not events.
- Vendor trigger, placement, overlay, state, render-prop, and event types are prohibited in the public Tooltip API.
- Generic Popover, HoverCard, Coachmark, and interactive overlay behavior require separately reviewed phases.
- Liturgical overlays cannot replace Tooltip trigger focus or accessibility treatment.
- Standard semantic display tables must be consumed through `@om/ui`.
- Standard tables must use native semantic table markup.
- Applications must not use clickable rows for primary actions.
- Row actions must use explicit Button, Link, IconButton, or Menu controls.
- Table rows and columns require stable unique string IDs.
- Tables require an accessible caption or label.
- Body tables require one designated row-header column when rows are present.
- Table display must not expose MUI, AG Grid, TanStack, or React Aria Table contracts.
- Advanced data operations belong in a separately reviewed `@om/tables` phase.
- AG Grid workflows remain domain or admin-grid concerns.
- Liturgical overlays cannot replace Table accessibility, focus, status, or boundary treatment.

## Completion Reports

When changing this repository, report the branch, commit, validation commands, failures or warnings, package impact, and whether publishing or deployment occurred.
