import type { TableCellAlignment, TableColumn, TableRowData } from "../shared/table-types.js";

const alignments = new Set<TableCellAlignment>(["start", "center", "end"]);

export function validateTableConfiguration<TRow extends TableRowData>({
  accessibleLabel,
  caption,
  columns,
  rows
}: {
  readonly accessibleLabel?: string;
  readonly caption?: string;
  readonly columns: readonly TableColumn<TRow>[];
  readonly rows: readonly TRow[];
}): {
  readonly rowHeaderIndex: number | null;
} {
  validateTableName(caption, accessibleLabel);
  validateTableColumns(columns);
  validateTableRows(rows);

  const rowHeaderIndex = resolveRowHeaderIndex(columns);

  if (rows.length > 0 && rowHeaderIndex === null) {
    warnDevelopment("Table requires exactly one row-header column when rows are present.");
  }

  return {
    rowHeaderIndex
  };
}

export function validateTableColumns<TRow extends TableRowData>(
  columns: readonly TableColumn<TRow>[]
): void {
  if (columns.length === 0) {
    throw new Error("Tables require at least one column.");
  }

  const ids = new Set<string>();
  let rowHeaderCount = 0;

  for (const column of columns) {
    if (column.id.trim().length === 0) {
      throw new Error("Table columns require non-empty string ids.");
    }

    if (ids.has(column.id)) {
      throw new Error(`Table column ids must be unique: ${column.id}`);
    }
    ids.add(column.id);

    if (column.header.trim().length === 0) {
      throw new Error("Table columns require non-empty headers.");
    }

    if (column.alignment !== undefined && !alignments.has(column.alignment)) {
      throw new Error(`Unsupported table cell alignment: ${column.alignment}`);
    }

    if (column.isRowHeader === true) {
      rowHeaderCount += 1;
    }
  }

  if (rowHeaderCount > 1) {
    warnDevelopment("Table requires exactly one row-header column; multiple were provided.");
  }
}

export function validateTableRows(rows: readonly TableRowData[]): void {
  const ids = new Set<string>();
  for (const row of rows) {
    if (row.id.trim().length === 0) {
      throw new Error("Table rows require non-empty string ids.");
    }

    if (ids.has(row.id)) {
      throw new Error(`Table row ids must be unique: ${row.id}`);
    }
    ids.add(row.id);
  }
}

export function resolveRowHeaderIndex<TRow extends TableRowData>(
  columns: readonly TableColumn<TRow>[]
): number | null {
  const rowHeaderIndices = columns.flatMap((column, index) =>
    column.isRowHeader === true ? [index] : []
  );

  if (rowHeaderIndices.length !== 1) {
    return null;
  }

  return rowHeaderIndices[0] ?? null;
}

function validateTableName(caption: string | undefined, accessibleLabel: string | undefined): void {
  const hasCaption = typeof caption === "string" && caption.trim().length > 0;
  const hasAccessibleLabel =
    typeof accessibleLabel === "string" && accessibleLabel.trim().length > 0;

  if (!hasCaption && !hasAccessibleLabel) {
    warnDevelopment("Table requires either a visible caption or an accessible label.");
  }
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
