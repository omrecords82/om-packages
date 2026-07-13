# Phase 1H Menu

Classification: INTERNAL

## Scope

Phase 1H adds one public production component: `Menu`.

The OM consumer audit found MUI Menu usage across the admin application, separate Radix dropdown implementations in the portal and OCR Studio, profile/header/action/overflow-menu use cases, and duplicated interaction and styling patterns. This phase establishes reusable package APIs only. It does not migrate application code.

## Public Contract

`Menu` accepts an interactive trigger and a readonly `MenuEntry[]`.

Entries are OM-owned serializable data:

- `MenuActionItem`: invokes `onAction(id)`.
- `MenuLinkItem`: renders a semantic anchor.
- `MenuSeparator`: noninteractive separator.

Entry IDs must be stable, unique, non-empty strings. Labels are strings in Phase 1H. Descriptions are strings. Icons, badges, avatars, shortcuts, sections, submenus, checkbox/radio items, and arbitrary custom rendering are deferred.

## Action And Link Behavior

Action items close the menu after activation and call `onAction` with only the action ID. Disabled action items do not activate. Destructive actions use protected component and semantic tokens and must not rely only on color.

Link items preserve `href` and normal anchor semantics. Unsafe executable schemes are rejected. `_blank` links receive `noopener noreferrer` unless the caller supplies an equally safe `rel`. Disabled links do not activate.

Separators cannot receive focus and are not actionable. Empty menus and separator-only menus keep the trigger rendered but do not open an empty interactive collection.

## Trigger And Ref Policy

The trigger is a React element representing an interactive control. Existing OM `Button` and `IconButton` triggers are supported.

The public ref targets the trigger `HTMLButtonElement`; it does not target the popover or collection. Calling `.focus()` on the ref focuses the trigger.

## Controlled State

`Menu` supports controlled and uncontrolled open state through `isOpen`, `defaultOpen`, and `onOpenChange`. Open-change callbacks receive only booleans. Action callbacks receive only string IDs. No native, React Aria, collection, key, state, focus, pointer, keyboard, or press event objects are exposed.

## React Aria Boundary

React Aria Components provides internal menu trigger, popover, menu, item, separator, keyboard, typeahead, overlay, and focus behavior. `@om/ui` does not re-export React Aria Components or expose vendor prop interfaces, render props, contexts, keys, selections, collection nodes, state objects, or event objects.

Applications must consume `@om/ui/menu` for standard OM action menus rather than importing React Aria Menu, MenuItem, MenuTrigger, Popover, or collection primitives.

## Keyboard And Overlay Behavior

The menu supports pointer opening, Enter and Space opening, ArrowDown and ArrowUp opening/navigation, Home and End navigation, typeahead by item label, Enter/Space activation, Escape dismissal, Tab dismissal, outside-interaction dismissal, disabled-item skipping, separator skipping, and focus restoration to the trigger where supported by the platform.

The popover aligns with the trigger, supports approved placements, remains viewport-aware, supports long-menu scrolling, and uses component overlay/z-index tokens. Generic Popover is not public in this phase.

## Tokens And CSS

Phase 1H adds experimental canonical JSON tokens under `component.menu.*` for popover surface, border, radius, shadow, min width, max height, z-index, item foreground/background states, descriptions, separators, and destructive treatment.

Component CSS remains plain CSS under `@layer om.components`. It consumes `@om/tokens` custom properties and does not define theme precedence. Liturgical overlays must not replace destructive or focus treatment.

## Forced Color And Motion

Forced-color rules preserve popover boundaries, focused items, disabled items, destructive intent, and separators without suppressing system colors. Reduced-motion rules remove transition duration; menu behavior does not depend on animation.

## Tests

Phase 1H adds unit coverage for item validation, controlled/uncontrolled open state, action callbacks, keyboard opening/navigation/typeahead, disabled items, links, safe rel handling, empty-menu behavior, class names, placement, refs, and SSR rendering.

Storybook adds `UI/Menu` with action, link, destructive, disabled, separator, empty, placement, scrolling, profile-style, theme, accessibility, reduced-motion, large-text, and narrow-viewport previews.

Playwright covers Storybook keyboard behavior, typeahead, destructive state, safe links, scrolling, outside dismissal, focus treatment, and existing-story continuity.

## Deferred Work

Deferred work includes icons, shortcuts, badges, avatars, sections, nested menus, submenu support, checkbox/radio menu items, ContextMenu, Menubar, router adapters, virtualized menus, async loading, generic Popover, Tooltip, Drawer, and consuming-application migration.

## Rollback

The phase is isolated to package source, tests, Storybook, docs, and private package metadata. Rollback removes the `Menu` export, menu tokens, CSS, tests, stories, docs, and Changesets without altering consuming applications, publishing packages, or deploying services.
