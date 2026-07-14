# Phase 1K Table Foundation

Classification: INTERNAL

## Scope

Phase 1K adds exactly one new public production component: `Table`.

Consumer-discovery evidence from the OM application found approximately 87 files using raw MUI `TableContainer`, no shared production table primitive, duplicated table implementations across admin, logs, record fallbacks, and development tools, AG Grid already serving the large production record-grid cases, and TanStack Table limited to demo routes. This phase establishes the reusable semantic table foundation only. It does not migrate OM application tables and it does not attempt to replace AG Grid or create a full data-table system.

## Public Contract

`Table` is exported from `@om/ui` and `@om/ui/table`.

Public row and column identities are OM-owned strings:

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

`TableProps` accepts rows, columns, an accessible caption or label, an optional description, density, optional striping, loading and empty-state messaging, and class-name escape hatches. The public ref resolves to the semantic `HTMLTableElement`.

## Native Semantic Decision

Phase 1K uses native `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` semantics. React Aria Table was not necessary for the accessible table foundation because the required behavior is representable with native HTML table semantics and explicit OM validation.

The package does not introduce spreadsheet behavior or grid keyboard patterns.

## Naming and Relationships

Every table requires either a visible caption or an accessible label. The caption is the preferred visible name; the accessible label is used when no visible caption is supplied.

Body rows require exactly one row-header column when rows are present. That column renders as `<th scope="row">` and the remaining body cells render as `<td>`.

## Cell Rendering

`renderCell(row)` receives the caller-owned row object only. It may return normal React content, including explicit interactive controls such as Button, Link, IconButton, or Menu. The package does not derive row identity from array position, does not stringify rows, and does not render nested table structure itself.

Consumers are responsible for formatting dates, statuses, and other row content appropriately.

## Empty and Loading States

When no rows are present, `Table` renders a semantic table shell with the header row and a single spanning empty-state row. The default message is `No data available`.

When `isLoading` is true, loading takes precedence over empty state and renders a single spanning status row. The default loading message is `Loading data`.

## Density, Striping, and Overflow

`TableDensity` supports `compact`, `comfortable`, and `spacious`. Density changes spacing only.

Striped rows are decorative and must not be the only row-boundary cue. Horizontal containment lives inside the table wrapper so the page does not gain unintended overflow.

## Focus, Forced Colors, and Large Text

The table itself is not keyboard interactive. Focus remains owned by controls inside cells. Row actions use explicit controls rather than clickable rows.

Forced-colors mode keeps the table boundary, header boundary, and row boundaries perceivable. Large text and browser zoom must not clip captions, headers, status rows, or interactive cell content.

## Token Usage

Table CSS lives in `@layer om.components` and consumes `@om/tokens` variables for surface, border, spacing, density, caption, description, striping, status rows, and container radius. The package keeps visual styling bootstrap-grade and not final.

## Package Export

`@om/ui/css` remains the single stylesheet export. `@om/ui/table` exports `Table` and the OM-owned public types only.

## Tests

Coverage includes unit tests for semantic structure, naming, row-header semantics, validation, empty and loading states, density, striping, class-name escape hatches, controlled rendering through caller-supplied data, SSR rendering, and package-boundary verification. Storybook adds semantic, dense, striped, loading, empty, interactive-cell, narrow-viewport, and theme previews. Playwright checks accessible naming, headers, row headers, empty/loading behavior, interactive controls inside cells, overflow containment, theme resolution, and focus behavior.

## Deferred

Deferred work includes sorting, filtering, pagination, selection, multi-selection, cell selection, expandable rows, nested rows, tree grids, grouped headers, column resizing, column reordering, column pinning, sticky columns, inline editing, drag-and-drop, virtualization, infinite scrolling, server-side data fetching, CSV export, spreadsheet behavior, responsive card conversion, row-click navigation, AG Grid adapters, router adapters, and the future `@om/tables` package boundary.

AG Grid record workflows remain domain or admin-grid concerns rather than shared semantic table behavior.

## Rollback

Rollback can remove the `@om/ui/table` export, Table source files, Table CSS, Storybook additions, Playwright additions, docs, and the related Changeset. No packages are published in this phase.
