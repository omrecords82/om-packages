---
classification: INTERNAL
---

# Phase 1L: Drawer Foundation

## Consumer Discovery

The OM application audit found Drawer usage in temporary mobile navigation drawers, record-edit drawers, settings and customization panels, and operational detail and evidence drawers. The same audit also found a separate `vaul` Sheet implementation in OCR Studio and inconsistent focus, dismissal, sizing, and responsive behavior.

## Scope

Phase 1L adds one public production component: `Drawer`.

`Drawer` is a modal overlay panel that enters from a logical or physical viewport edge. It is not a permanent navigation rail, page shell, or layout framework.

## Public Contracts

`Drawer` exposes these OM-owned contracts:

- `DrawerProps`
- `DrawerPlacement`
- `DrawerSize`

The ref targets the drawer surface `HTMLDivElement`.

## Modal-Only Policy

`Drawer` is modal only. It traps focus, blocks background interaction, restores focus on close, and closes through the configured dismissal paths. Permanent sidebars and desktop application shells remain application concerns.

Bottom placement is a viewport-edge overlay pattern, not a swipe-driven sheet.

## Trigger Policy

`trigger` is optional but, when provided, must be an interactive React element. Existing OM `Button` and `IconButton` triggers are supported. Trigger content and accessible naming remain the caller's responsibility.

`Drawer` may also be controlled without a trigger when `isOpen` is supplied or when `defaultOpen` is `true`.

## Placement and Size

`start` and `end` are logical placements. In left-to-right mode, `start` enters from the left and `end` enters from the right. In right-to-left mode, those edges reverse.

`top` and `bottom` are physical block-axis placements.

Size controls the modal extent, not a raw pixel contract. Start/end sizes control width. Top/bottom sizes control height.

## Focus Entry and Restoration

On open, focus moves into the Drawer. Close control focus is preferred when present. Focus returns to the trigger or previously focused element after close.

## Dismissal Behavior

By default, outside interaction closes the Drawer, Escape closes it, and the close control closes it.

If every dismissal path is disabled or hidden, development validation warns that the Drawer may become impossible to exit.

## Scroll-Lock and Long Content

The overlay blocks background interaction and prevents scroll leakage. The body becomes the scrolling region, while the header and footer remain usable.

Long content is expected to scroll inside the Drawer rather than pushing the page itself.

## Responsive Behavior

The Drawer must remain usable on narrow viewports and under browser zoom. Start/end Drawers can occupy most of the viewport width while still obeying safe viewport boundaries. Top/bottom Drawers use viewport-safe height limits.

## Forced Colors and Motion

Forced colors must keep the surface boundary, controls, title, and description perceivable.

Drawer motion uses CSS transitions only. Reduced-motion preferences minimize or remove the translation treatment and must not affect functional behavior or focus restoration.

## Token Usage

`Drawer` reuses the dialog overlay, surface, spacing, focus, and close-control tokens. Phase 1L adds only the minimum Drawer-specific size tokens for width and height.

## Testing Strategy

Coverage includes:

- unit tests for controlled and uncontrolled behavior, focus, dismissal, sizing, and validation
- Storybook examples for placement, size, focus, motion, contrast, and content depth
- Playwright checks for keyboard traversal, outside interaction, RTL placement, viewport containment, scroll behavior, and theme resolution
- public declaration verification for vendor-type leakage
- package dry-run validation for distribution boundaries

## Deferred Work

Deferred items include:

- persistent sidebars
- nested drawers
- route-driven drawer state
- resizable drawers
- gesture-driven bottom sheets
- swipe-to-close behavior
- application migration

## Rollback

If Drawer needs to be withdrawn, revert the Drawer commits and remove the Drawer token file and package export additions together so the public API and generated artifacts stay aligned.
