/* @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "../button/Button.js";
import { IconButton } from "../icon-button/IconButton.js";
import { Link } from "../link/Link.js";
import { Menu } from "../menu/Menu.js";
import type { MenuEntry } from "../shared/menu-types.js";
import type { TableColumn, TableRowData } from "../shared/table-types.js";
import { Table } from "./Table.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type RecordRow = TableRowData & {
  readonly name: string;
  readonly status: string;
  readonly owner: string;
  readonly details: string;
};

const rows = [
  {
    id: "alpha",
    name: "Alpha record",
    status: "Ready",
    owner: "Operations",
    details: "Primary record"
  },
  {
    id: "beta",
    name: "Beta record",
    status: "Pending",
    owner: "Review",
    details: "Secondary record"
  }
] as const satisfies readonly RecordRow[];

const baseColumns = [
  {
    id: "name",
    header: "Record",
    isRowHeader: true,
    renderCell: (row: RecordRow) => row.name
  },
  {
    id: "status",
    header: "Status",
    alignment: "center",
    renderCell: (row: RecordRow) => row.status
  },
  {
    id: "owner",
    header: "Owner",
    renderCell: (row: RecordRow) => row.owner
  }
] as const satisfies readonly TableColumn<RecordRow>[];

const interactiveColumns = [
  {
    id: "name",
    header: "Record",
    isRowHeader: true,
    renderCell: (row: RecordRow) => row.name
  },
  {
    id: "button",
    header: "Button",
    renderCell: (row: RecordRow) => <Button>Open {row.id}</Button>
  },
  {
    id: "icon",
    header: "Icon button",
    renderCell: (row: RecordRow) => (
      <IconButton icon={<span aria-hidden="true">i</span>} accessibleLabel={`${row.name} info`} />
    )
  },
  {
    id: "link",
    header: "Link",
    renderCell: (row: RecordRow) => (
      <Link href={`https://example.test/${row.id}`} target="_blank">
        {row.name} docs
      </Link>
    )
  },
  {
    id: "menu",
    header: "Menu",
    alignment: "end",
    renderCell: (row: RecordRow) => (
      <Menu
        trigger={
          <IconButton
            icon={<span aria-hidden="true">⋯</span>}
            accessibleLabel={`More ${row.name} actions`}
          />
        }
        items={menuItems(row)}
      />
    )
  }
] as const satisfies readonly TableColumn<RecordRow>[];

const wideColumns = [
  {
    id: "summary",
    header: "Extremely long summary header for administrative record contexts",
    isRowHeader: true,
    renderCell: (row: WideRow) => row.summary
  },
  {
    id: "value",
    header: "Long value header that should not clip by default",
    renderCell: (row: WideRow) => row.value
  },
  {
    id: "note",
    header: "Long note header with additional contextual detail",
    renderCell: (row: WideRow) => row.note
  },
  {
    id: "owner",
    header: "Owner and responsibility label",
    renderCell: (row: WideRow) => row.owner
  }
] as const satisfies readonly TableColumn<WideRow>[];

type WideRow = TableRowData & {
  readonly summary: string;
  readonly value: string;
  readonly note: string;
  readonly owner: string;
};

const wideRows = [
  {
    id: "wide-alpha",
    summary: "Alpha record with a long summary that should wrap in the narrow viewport.",
    value: "This cell contains enough text to force horizontal containment rather than clipping.",
    note: "A second long cell value keeps the table wider than the mobile wrapper.",
    owner: "Operations"
  },
  {
    id: "wide-beta",
    summary: "Beta record with another long summary for overflow testing.",
    value: "Support text remains reachable when the container scrolls horizontally.",
    note: "A final note value makes the container scrollable for browser zoom checks.",
    owner: "Review"
  }
] as const satisfies readonly WideRow[];

function menuItems(row: RecordRow): readonly MenuEntry[] {
  return [
    {
      type: "action",
      id: `${row.id}-view`,
      label: `View ${row.name}`
    },
    {
      type: "separator",
      id: `${row.id}-divider`
    },
    {
      type: "link",
      id: `${row.id}-help`,
      label: `Help for ${row.name}`,
      href: `https://example.test/help/${row.id}`,
      target: "_blank"
    }
  ];
}

describe("Table", () => {
  it("renders semantic table structure, naming, description, and ref targets", () => {
    const ref = createRef<HTMLTableElement>();

    render(
      <Table
        ref={ref}
        caption="Visible caption"
        description="Supporting description."
        columns={baseColumns}
        rows={rows}
      />
    );

    const table = screen.getByRole("table", { name: "Visible caption" });
    expect(ref.current).toBe(table);
    expect(table.tagName).toBe("TABLE");
    expect(screen.getByText("Visible caption")).toBeTruthy();
    expect(screen.getByText("Supporting description.")).toBeTruthy();
    expect(table.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("supports accessible-label-only naming and warns when no name is supplied", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(<Table accessibleLabel="Accessible label only" columns={baseColumns} rows={rows} />);
    expect(screen.getByRole("table", { name: "Accessible label only" })).toBeTruthy();

    render(<Table columns={baseColumns} rows={rows} />);
    expect(warn).toHaveBeenCalledWith(
      "Table requires either a visible caption or an accessible label."
    );
  });

  it("announces headers, row headers, and row order correctly", () => {
    render(<Table caption="Record table" columns={baseColumns} rows={rows} />);

    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Record",
      "Status",
      "Owner"
    ]);
    expect(screen.getAllByRole("rowheader").map((cell) => cell.textContent)).toEqual([
      "Alpha record",
      "Beta record"
    ]);
    const tableRows = screen.getAllByRole("row");
    expect(tableRows[1]?.textContent).toContain("Alpha recordReadyOperations");
    expect(tableRows[2]?.textContent).toContain("Beta recordPendingReview");
  });

  it("keeps interactive cell content semantic and keyboard reachable", async () => {
    const user = userEvent.setup();

    render(
      <>
        <Table caption="Interactive table" columns={interactiveColumns} rows={rows} />
        <Button>After table sentinel</Button>
      </>
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open alpha" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Alpha record info" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Alpha record docs" }));
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "More Alpha record actions" })
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open beta" }));
  });

  it("rejects invalid row and column definitions", () => {
    expect(() =>
      render(
        <Table
          caption="Duplicate row ids"
          columns={baseColumns}
          rows={[{ ...rows[0] }, { ...rows[0], details: "Duplicate row" }]}
        />
      )
    ).toThrow(/Table row ids must be unique/u);

    expect(() =>
      render(
        <Table
          caption="Duplicate column ids"
          columns={[
            baseColumns[0],
            {
              id: "name",
              header: "Duplicate",
              renderCell: (row: RecordRow) => row.details
            }
          ]}
          rows={rows}
        />
      )
    ).toThrow(/Table column ids must be unique/u);

    expect(() =>
      render(
        <Table
          caption="Empty column id"
          columns={[
            {
              id: " ",
              header: "Header",
              renderCell: (row: RecordRow) => row.name
            }
          ]}
          rows={rows}
        />
      )
    ).toThrow(/non-empty string ids/u);

    expect(() =>
      render(
        <Table
          caption="Empty column header"
          columns={[
            {
              id: "header",
              header: " ",
              renderCell: (row: RecordRow) => row.name
            }
          ]}
          rows={rows}
        />
      )
    ).toThrow(/non-empty headers/u);

    expect(() =>
      render(
        <Table
          caption="Invalid alignment"
          columns={[
            {
              id: "header",
              header: "Header",
              alignment: "middle" as never,
              renderCell: (row: RecordRow) => row.name
            }
          ]}
          rows={rows}
        />
      )
    ).toThrow(/Unsupported table cell alignment/u);
  });

  it("warns when the row-header policy is missing or duplicated", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Table
        caption="Missing row header"
        columns={[
          {
            id: "name",
            header: "Name",
            renderCell: (row: RecordRow) => row.name
          }
        ]}
        rows={rows}
      />
    );

    render(
      <Table
        caption="Duplicate row headers"
        columns={[
          {
            id: "name",
            header: "Name",
            isRowHeader: true,
            renderCell: (row: RecordRow) => row.name
          },
          {
            id: "owner",
            header: "Owner",
            isRowHeader: true,
            renderCell: (row: RecordRow) => row.owner
          }
        ]}
        rows={rows}
      />
    );

    expect(warn.mock.calls.flat()).toContain(
      "Table requires exactly one row-header column when rows are present."
    );
    expect(warn).toHaveBeenCalledWith(
      "Table requires exactly one row-header column; multiple were provided."
    );
  });

  it("does not require a row-header column when the table is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Table
        caption="Empty row-header policy"
        columns={[
          {
            id: "name",
            header: "Name",
            renderCell: (row: RecordRow) => row.name
          }
        ]}
        rows={[]}
      />
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it("renders empty and loading status rows with busy semantics and precedence", () => {
    render(
      <>
        <Table
          caption="Empty table"
          columns={baseColumns}
          emptyMessage="No records available"
          rows={[]}
        />
        <Table
          caption="Loading table"
          columns={baseColumns}
          emptyMessage="No records available"
          isLoading
          loadingMessage="Loading records"
          rows={[]}
        />
      </>
    );

    const emptyTable = screen.getByRole("table", { name: "Empty table" });
    const loadingTable = screen.getByRole("table", { name: "Loading table" });

    expect(emptyTable).toBeTruthy();
    expect(within(emptyTable).getByText("No records available")).toBeTruthy();
    expect(loadingTable.getAttribute("aria-busy")).toBe("true");
    expect(within(loadingTable).getByText("Loading records")).toBeTruthy();
    expect(within(loadingTable).queryByText("No records available")).toBeNull();
  });

  it("applies density, striped, and class-name escape hatches", () => {
    render(
      <Table
        caption="Dense table"
        className="container-class"
        captionClassName="caption-class"
        bodyClassName="body-class"
        columns={baseColumns}
        containerClassName="wrapper-class"
        density="compact"
        headerClassName="header-class"
        isStriped
        rows={rows}
        tableClassName="table-class"
      />
    );

    const container = screen.getByRole("table", { name: "Dense table" }).closest(".om-table");
    expect(container?.classList.contains("container-class")).toBe(true);
    expect(container?.classList.contains("wrapper-class")).toBe(true);
    expect(container?.getAttribute("data-om-density")).toBe("compact");
    expect(container?.getAttribute("data-om-striped")).toBe("true");
    expect(
      screen.getByRole("table", { name: "Dense table" }).classList.contains("table-class")
    ).toBe(true);
    expect(screen.getByText("Dense table").classList.contains("caption-class")).toBe(true);
    expect(screen.getAllByRole("rowgroup")[1]?.classList.contains("body-class")).toBe(true);
    expect(screen.getAllByRole("row")[2]?.getAttribute("data-om-striped-row")).toBe("true");
  });

  it("does not mutate callers' rows or columns", () => {
    const frozenRows = rows.map((row) => Object.freeze({ ...row }));
    const frozenColumns = baseColumns.map((column) => Object.freeze({ ...column }));

    render(<Table caption="Frozen table" columns={frozenColumns} rows={frozenRows} />);

    expect(frozenRows.map((row) => row.id)).toEqual(["alpha", "beta"]);
    expect(frozenColumns.map((column) => column.id)).toEqual(["name", "status", "owner"]);
  });

  it("renders without browser globals during SSR", () => {
    const markup = renderToString(
      <Table caption="Server table" columns={baseColumns} rows={rows} />
    );

    expect(markup).toContain("Server table");
    expect(markup).toContain("Alpha record");
    expect(markup).toContain("Beta record");
  });

  it("uses semantic table headers for wide content and responsive containment", () => {
    render(
      <div style={{ maxWidth: "20rem" }}>
        <Table
          caption="Wide table"
          columns={wideColumns}
          rows={wideRows}
          description="Horizontal overflow stays inside the table container."
        />
      </div>
    );

    expect(screen.getByRole("table", { name: "Wide table" })).toBeTruthy();
    expect(screen.getByText("Horizontal overflow stays inside the table container.")).toBeTruthy();
  });
});
