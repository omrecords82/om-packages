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
- Generic Popover, Menu, Tooltip, and Drawer require separately reviewed phases.

## Completion Reports

When changing this repository, report the branch, commit, validation commands, failures or warnings, package impact, and whether publishing or deployment occurred.
