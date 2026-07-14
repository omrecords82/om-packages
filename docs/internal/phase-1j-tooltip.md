# Phase 1J Tooltip

Classification: INTERNAL

## Scope

Phase 1J adds exactly one public production component: `Tooltip`.

Consumer-discovery evidence from the OM application found approximately 407 Tooltip instances across approximately 150 files, frequent icon-only control usage, approximately 220 files using IconButton compared with approximately 91 files containing `aria-label`, multiple likely cases where Tooltip text was treated as the only accessible label, dominant MUI Tooltip usage, and isolated Radix or shadcn-style Tooltip implementations. This phase creates the package-level contract only; it does not migrate application code.

## Public Contract

`Tooltip` is exported from `@om/ui` and `@om/ui/tooltip`.

Public content is string-only in Phase 1J. Content must be non-empty after trimming, is rendered as text, and is never interpreted as HTML or arbitrary JSX. Tooltip content is supplemental description and must not contain interactive controls or required instructions unavailable elsewhere.

Public placement and delay contracts are OM-owned:

```ts
type TooltipDelay = "immediate" | "standard";
type TooltipPlacement = "top" | "top-start" | "top-end" | "bottom" | "...";
```

`standard` maps to a 700ms opening delay. `immediate` maps to no intentional opening delay. Closing uses a package-owned 120ms delay.

## Accessible Names

Tooltip text does not replace the trigger accessible name and is not copied into `aria-label`.

Visible text triggers retain their visible accessible names. Icon-only triggers must provide an independent name through visible text, `aria-label`, `aria-labelledby`, or the OM `IconButton` `accessibleLabel` contract. Development validation warns for obvious unlabeled icon-only triggers, but static validation is not exhaustive.

## Trigger Policy

The trigger must be an interactive React element. OM `Button`, `IconButton`, `Link`, native buttons, native anchors with valid `href`, and ref-forwarding interactive elements are supported where they preserve focus and refs.

Plain strings are rejected by the runtime validation. Obvious noninteractive triggers warn in development. Tooltip does not create a focusable wrapper around noninteractive or disabled controls.

The public ref targets the trigger `HTMLElement`.

## State And Interaction

`Tooltip` supports controlled and uncontrolled open state through `isOpen`, `defaultOpen`, and `onOpenChange(isOpen)`. Public callbacks expose booleans only.

Hover opens after the selected delay. Pointer leave closes predictably. Keyboard focus opens the Tooltip, blur closes it, and Escape closes it without activating the trigger. The Tooltip bubble does not receive focus, trap focus, or interrupt normal trigger activation.

## Placement And Arrow

Placement is a preference and may adjust to remain within the viewport. Raw vendor placement, offset, and collision contracts are not public.

The decorative arrow is shown by default and may be hidden. It is not announced and is not required to understand the Tooltip relationship.

## Disabled Controls

`isDisabled` disables Tooltip behavior and requests closure when controlled open state is active. Native disabled controls often cannot receive focus or hover consistently, so Tooltip interaction around them is not guaranteed. Critical disabled-state explanations should be visible elsewhere or associated through normal descriptive content.

## React Aria Boundary

React Aria Components owns internal Tooltip trigger context, overlay positioning, hover/focus behavior, dismissal, and viewport handling. `@om/ui` does not re-export React Aria Components, Tooltip props, placement types, render props, overlay state, contexts, or event objects.

Public declaration verification fails if vendor Tooltip, trigger, overlay, placement, state, render-prop, focus, hover, press, pointer, keyboard, React Aria, React Stately, or `@react-types/*` types leak through root or subpath declarations.

## Styling And Tokens

Tooltip CSS lives in `@layer om.components` and consumes `@om/tokens` variables. Phase 1J adds experimental `component.tooltip.*` tokens for background, foreground, border, radius, shadow, padding, max width, z-index, arrow size, offset, standard delay, and close delay.

Tooltip styling must not replace trigger focus treatment. Enhanced-focus mode remains effective on the trigger. Liturgical overlays may not replace focus or accessibility treatment.

Forced-colors mode keeps the Tooltip boundary and text perceivable without relying only on box shadow. Reduced-motion preferences minimize Tooltip transitions.

## Tests

Coverage includes unit tests for trigger rendering, accessible-name separation, descriptive association, refs, controlled and uncontrolled state, hover, pointer leave, focus, blur, Escape, trigger activation, disabled behavior, native disabled-control policy, validation warnings, every placement, delay attributes, arrow behavior, class names, long content, SSR rendering, package exports, declaration boundaries, Storybook examples, and Playwright focus/hover/theme checks.

## Deferred

Deferred work includes Popover, HoverCard, Coachmark, tours, interactive tooltip content, arbitrary JSX content, HTML rendering from strings, global TooltipProvider, custom collision controls, application migration, and replacement of existing OM Tooltip call sites.

## Rollback

Rollback can remove the `@om/ui/tooltip` export, Tooltip source files, Tooltip CSS, Storybook story, Playwright additions, `component.tooltip.*` token additions, and related documentation and changesets. No packages are published in this phase.
