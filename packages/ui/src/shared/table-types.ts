import type { ReactNode } from "react";

export type TableRowData = {
  readonly id: string;
};

export type TableDensity = "compact" | "comfortable" | "spacious";

export type TableCellAlignment = "start" | "center" | "end";

export type TableColumn<TRow extends TableRowData = TableRowData> = {
  readonly id: string;
  readonly header: string;
  readonly renderCell: (row: TRow) => ReactNode;
  readonly isRowHeader?: boolean;
  readonly alignment?: TableCellAlignment;
};

export type TableProps<TRow extends TableRowData = TableRowData> = {
  readonly columns: readonly TableColumn<TRow>[];
  readonly rows: readonly TRow[];
  readonly caption?: string;
  readonly accessibleLabel?: string;
  readonly description?: string;
  readonly density?: TableDensity;
  readonly isStriped?: boolean;
  readonly isLoading?: boolean;
  readonly loadingMessage?: string;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly tableClassName?: string;
  readonly captionClassName?: string;
  readonly headerClassName?: string;
  readonly bodyClassName?: string;
};
