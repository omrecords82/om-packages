# Phase 1D Text Field Foundation

Classification: INTERNAL

## Scope

Phase 1D adds the first Orthodox Metrics text-entry component family to `@om/ui`: `Label`, `FieldError`, `TextField`, and `TextArea`.

It does not add form orchestration, schema validation, React Hook Form integration, Formik, select controls, checkboxes, radio groups, switches, date fields, number fields, search fields, masked inputs, rich text, autocomplete, or production application migrations.

## Public Contracts

The public contracts are OM-owned. They do not extend React Aria Components props and do not expose React Aria, React Stately, `@react-types/*`, validation-result objects, render-prop contracts, or native event objects.

`TextField` and `TextArea` require `label`. Visually hidden labels are supported with `labelVisibility="visually-hidden"`. Placeholder text is never a label.

`onValueChange` receives the next string value. Refs target the native control: `HTMLInputElement` for `TextField`, `HTMLTextAreaElement` for `TextArea`, and `HTMLLabelElement` for `Label`.

## Composition

React Aria Components provides internal field behavior, label association, description handling, validation semantics, disabled/read-only semantics, and keyboard accessibility. Consuming applications should import the OM components rather than React Aria text-field primitives when an OM equivalent exists.

## Validation

The components support native constraints such as `required`, `minLength`, `maxLength`, and `pattern` where applicable. Application-controlled invalid state uses `isInvalid` and `errorMessage`. `errorMessage` by itself does not make a field invalid.

Invalid controls expose invalid semantics, and error text is associated through the React Aria field context. Error styling uses validation/error tokens and is not replaced by liturgical styling.

## Description And Error Association

Descriptions render only when supplied and remain available in disabled and read-only states. Error messages render only when `isInvalid` is true and an error message is supplied.

## Disabled And Read-Only

Disabled fields are not editable. Read-only fields remain focusable and selectable where native semantics permit. The states are represented separately in DOM attributes and component data attributes.

## Token And CSS Policy

Component CSS remains plain CSS in `@layer om.components`. Consumers import `@om/tokens/css` before `@om/ui/css`.

Phase 1D adds minimal experimental field/input token paths under canonical JSON sources. These tokens are not final OM design values. Focus uses accessibility-capable focus tokens. Forced-color support preserves border and focus visibility without disabling system colors.

## Testing

Coverage includes unit tests for labels, errors, controlled/uncontrolled values, native attributes, disabled/read-only behavior, ref targets, server rendering, package boundaries, Storybook previews, Playwright browser behavior, and package dry-run checks.

## Deferred Work

Deferred work includes form orchestration, domain validation, schema adapters, React Hook Form integration, additional input families, finalized visual design, and consumer migration automation.

## Rollback

Rollback is reverting the Phase 1D PR. The change is isolated to package source, tests, docs, token source data, and Storybook previews; it does not modify consuming applications or production services.
