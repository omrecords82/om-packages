# Phase 1C UI Foundation

Classification: INTERNAL

Phase 1C establishes the permanent architecture for `@om/ui`.

## Vendor Boundary

Orthodox Metrics owns public component contracts. React Aria Components is an internal runtime dependency used for low-level accessibility, keyboard, pointer, touch, disabled, focus-visible, and interaction behavior.

Consuming applications must import `@om/ui` components instead of React Aria Components directly when an OM equivalent exists. This keeps vendor prop types, render-prop state objects, and vendor contexts out of normal Orthodox Metrics application APIs.

## Component Scope

Phase 1C includes only:

- `Button`
- `Link`
- `IconButton`

Forms, dialogs, menus, popovers, tooltips, inputs, tables, layout systems, icons, and application adapters are deferred.

## Public API Rules

Public props are OM-owned types. They do not extend React Aria Components interfaces and do not expose React Aria, React Stately, or `@react-types/*` declarations.

The package verifies generated declarations with `packages/ui/scripts/verify-public-api.ts`.

## Token Consumption

Component CSS is plain CSS under `@layer om.components`. It consumes `@om/tokens` custom properties and does not redefine theme precedence.

Consumers import CSS in this order:

```ts
import "@om/tokens/css";
import "@om/ui/css";
```

## Focus And Accessibility

Focus-visible styling uses token-controlled focus variables. Focus outlines must not be removed without replacement. Liturgical and brand styling must not become the only focus indicator.

`Button` and `IconButton` expose disabled and pending states. Pending state blocks action and exposes status text while preserving the button name. `Link` remains anchor-based and does not behave as a button.

## Package Exports

`@om/ui` exposes root exports plus `./button`, `./link`, `./icon-button`, and `./css` subpaths.

## Testing Requirements

Production components require unit tests, Storybook stories, keyboard/browser Playwright coverage, package dry-run verification, and public declaration verification.

## Future Replacement Strategy

React Aria Components can be replaced internally later if needed. The OM-owned public props and package exports are the boundary that shields application repositories from vendor churn.
