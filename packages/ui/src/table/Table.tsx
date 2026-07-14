import type { ForwardedRef, ReactElement, RefAttributes } from "react";
import type { TableProps, TableRowData } from "../shared/table-types.js";

import { forwardRef, useId } from "react";

import { joinClassNames } from "../shared/class-names.js";
import { validateTableConfiguration } from "./table-validation.js";

const defaultEmptyMessage = "No data available";
const defaultLoadingMessage = "Loading data";

export const Table = forwardRef(function Table<TRow extends TableRowData>(
  {
    columns,
    rows,
    caption,
    accessibleLabel,
    description,
    density = "comfortable",
    isStriped = false,
    isLoading = false,
    loadingMessage = defaultLoadingMessage,
    emptyMessage = defaultEmptyMessage,
    className,
    containerClassName,
    tableClassName,
    captionClassName,
    headerClassName,
    bodyClassName
  }: TableProps<TRow>,
  ref: ForwardedRef<HTMLTableElement>
) {
  const { rowHeaderIndex } = validateTableConfiguration({
    ...(accessibleLabel !== undefined ? { accessibleLabel } : {}),
    ...(caption !== undefined ? { caption } : {}),
    columns,
    rows
  });
  const descriptionId = useId();
  const hasCaption = isPresentText(caption);
  const hasAccessibleLabel = isPresentText(accessibleLabel);
  const hasDescription = isPresentText(description);
  const loadingText = normalizeText(loadingMessage, defaultLoadingMessage);
  const emptyText = normalizeText(emptyMessage, defaultEmptyMessage);
  const shouldShowLoading = isLoading;
  const shouldShowEmpty = !shouldShowLoading && rows.length === 0;
  const describedBy = hasDescription ? descriptionId : undefined;
  const tableNameProps = hasCaption
    ? {}
    : hasAccessibleLabel
      ? { "aria-label": accessibleLabel?.trim() }
      : {};

  return (
    <div
      className={joinClassNames("om-table", className, containerClassName) ?? "om-table"}
      data-om-component="table"
      data-om-density={density}
      data-om-empty={shouldShowEmpty || undefined}
      data-om-loading={shouldShowLoading || undefined}
      data-om-striped={isStriped || undefined}
    >
      {hasDescription ? (
        <p className="om-table__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <div className="om-table__container">
        <table
          ref={ref}
          aria-busy={shouldShowLoading || undefined}
          aria-describedby={describedBy}
          {...tableNameProps}
          className={joinClassNames("om-table__table", tableClassName) ?? "om-table__table"}
        >
          {hasCaption ? (
            <caption className={joinClassNames("om-table__caption", captionClassName)}>
              {caption}
            </caption>
          ) : null}
          <thead className={joinClassNames("om-table__head", headerClassName) ?? "om-table__head"}>
            <tr className="om-table__row">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="om-table__header-cell"
                  data-om-alignment={column.alignment ?? undefined}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={joinClassNames("om-table__body", bodyClassName) ?? "om-table__body"}>
            {shouldShowLoading ? (
              <tr className="om-table__status-row" data-om-loading="true">
                <td className="om-table__status-cell" colSpan={columns.length}>
                  <span aria-atomic="true" aria-live="polite" role="status">
                    {loadingText}
                  </span>
                </td>
              </tr>
            ) : shouldShowEmpty ? (
              <tr className="om-table__status-row" data-om-empty="true">
                <td className="om-table__status-cell" colSpan={columns.length}>
                  <span aria-atomic="true" aria-live="polite" role="status">
                    {emptyText}
                  </span>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="om-table__row"
                  data-om-striped-row={isStriped && rowIndex % 2 === 1 ? true : undefined}
                >
                  {columns.map((column, columnIndex) => {
                    const content = column.renderCell(row);
                    const alignment = column.alignment ?? undefined;
                    const isSemanticRowHeader =
                      rowHeaderIndex !== null && columnIndex === rowHeaderIndex;
                    const cellProps = {
                      className: isSemanticRowHeader ? "om-table__row-header" : "om-table__cell",
                      "data-om-alignment": alignment,
                      "data-om-row-header": isSemanticRowHeader ? true : undefined
                    } as const;

                    if (isSemanticRowHeader) {
                      return (
                        <th key={column.id} {...cellProps} scope="row">
                          {content}
                        </th>
                      );
                    }

                    return (
                      <td key={column.id} {...cellProps}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}) as <TRow extends TableRowData = TableRowData>(
  props: TableProps<TRow> & RefAttributes<HTMLTableElement>
) => ReactElement;

function normalizeText(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim().length === 0) {
    return fallback;
  }

  return value;
}

function isPresentText(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}
