# INTERNAL: Phase 1G Dialog Foundation

This document describes the Phase 1G overlay work for `@om/ui`. It is internal architecture documentation and is not a public API stability guarantee.

## Consumer Discovery Evidence

A read-only audit of the OM application found 181 dialog instances across 121 files, 36 `window.confirm` calls across 25 files, multiple separate confirmation-dialog implementations, MUI Dialog as the dominant current implementation, additional native, custom, and Radix dialog implementations, and at least one confirmed dialog-label association defect. `Dialog` and `AlertDialog` are therefore the highest-priority missing package components.

## Scope

Phase 1G adds exactly two public production components:

- `Dialog`
- `AlertDialog`

It does not add public Modal, Overlay, Portal, DialogTrigger, header/body/footer subcomponents, Popover, Menu, Tooltip, Drawer, Sheet, Toast, Snackbar, command dialog, or application-specific confirmation flows. It does not migrate `window.confirm` or existing OM application dialogs.

## Public Contracts

`DialogProps` requires `title` and `children`, supports optional `description`, optional `footer`, optional React element `trigger`, controlled or uncontrolled open state, size, dismissable and keyboard-dismiss policies, close-button controls, class-name escape hatches, and a public ref to the dialog surface `HTMLDivElement`.

`AlertDialogProps` requires `title`, `description`, `confirmLabel`, and `onConfirm`. It supports optional children, optional trigger, controlled or uncontrolled open state, intent, initial-focus policy, confirmation close behavior, cancel callback, pending confirmation, disabled confirmation, class-name escape hatches, and a public ref to the alert-dialog surface `HTMLDivElement`.

Public callbacks expose booleans or no-argument callbacks only. Press, pointer, keyboard, overlay, and React Aria state objects are not exposed.

## React Aria Boundary

React Aria Components owns internal modal, focus, dismissal, and accessibility behavior. `@om/ui` imports DialogTrigger, ModalOverlay, Modal, Dialog, Heading, and Text internally. None are re-exported. Public declarations are verified to reject React Aria, React Stately, `@react-types/*`, overlay state, vendor dialog props, render props, and press-event leakage.

## Behavior

`Dialog` supports optional triggers, controlled and uncontrolled open state, Escape dismissal when enabled, outside interaction dismissal when enabled, a visible close button by default, focus trapping, focus restoration, long-content internal scrolling, and responsive maximum widths.

`AlertDialog` renders alert-dialog semantics, requires a consequence description, always renders cancel and confirm actions, defaults focus to Cancel, allows explicit confirm focus only through `initialFocus="confirm"`, does not dismiss on outside interaction, treats Escape as cancel unless confirmation is pending, and blocks cancel, confirm, and Escape while pending.

`confirmBehavior="close"` requests close after synchronous `onConfirm`. `confirmBehavior="manual"` leaves closure to the caller. Phase 1G does not infer Promise success or failure and does not implement async error handling, toast, or snackbar behavior.

## Tokens and CSS

Phase 1G adds experimental canonical dialog tokens for overlay backdrop, surface background, foreground, border, shadow, radius, padding, gaps, footer border, maximum height, responsive widths, z-index, close size, alert action gap, and alert intent accents.

Component CSS remains plain CSS in `@layer om.components`. It consumes `@om/tokens` variables and does not redefine token cascade precedence. Liturgical styling must not replace destructive, warning, validation, or focus treatment.

## Focus, Forced Colors, and Motion

Dialog focus is trapped while open and restored after close. AlertDialog defaults initial focus to Cancel so destructive confirmation is not focused by default. Enhanced focus must remain visible. Forced-colors mode keeps surface boundaries, text, close controls, and actions perceivable. Reduced motion minimizes transition treatment and does not delay focus.

## Testing

Phase 1G adds unit tests for open state, callbacks, title/description association, close and Escape behavior, keyboard-dismiss policy, focus trapping and restoration, pending confirmation, manual confirmation, class-name escape hatches, ref targets, development validation, and SSR import/render safety.

Storybook includes experimental Dialog and AlertDialog examples for controlled usage, sizes, dismissal policies, long content, light/dark themes, one liturgical accent demonstration, high contrast, enhanced focus, reduced motion, and large text.

Playwright covers keyboard opening, focus movement, close behavior, Escape policy, nondismissable policy, focus restoration, long-content scrolling, AlertDialog default focus, confirmation, manual close, pending behavior, and earlier story compatibility.

## Future Migration Guidance

Future OM application migration should replace ad-hoc MUI/custom/native confirmation patterns with `AlertDialog` where the workflow is a decision with consequence. `Dialog` should be used for general modal content that is not a forced confirmation. Application migration must happen in a separately reviewed phase.

## Deferred Work

- Application dialog migration.
- `window.confirm` replacement sweep.
- Public Popover, Menu, Tooltip, Drawer, Sheet, Toast, Snackbar, Modal, Overlay, Portal, and DialogTrigger APIs.
- Async confirmation error management.
- Command dialog patterns.
- Final Orthodox Metrics visual language.

## Rollback

The Phase 1G changes are isolated to private package source, tests, Storybook previews, token source data, and documentation. Rolling back the PR removes the new package APIs without altering consuming applications, production services, publication settings, or deployments.
