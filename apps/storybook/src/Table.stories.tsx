import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import "@om/tokens/css";
import "@om/ui/css";
import { Button } from "@om/ui/button";
import { IconButton } from "@om/ui/icon-button";
import { Link } from "@om/ui/link";
import { Menu } from "@om/ui/menu";
import type { MenuEntry } from "@om/ui/menu";
import { Table } from "@om/ui/table";
import type { TableColumn, TableRowData } from "@om/ui/table";

type RecordRow = TableRowData & {
  readonly name: string;
  readonly status: string;
  readonly owner: string;
  readonly details: string;
};

type WideRow = TableRowData & {
  readonly summary: string;
  readonly value: string;
  readonly note: string;
  readonly owner: string;
};

const recordRows = [
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

const recordColumns = [
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
  },
  {
    id: "details",
    header: "Details",
    renderCell: (row: RecordRow) => row.details
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

const basicItems = [
  {
    type: "action",
    id: "edit",
    label: "Edit"
  },
  {
    type: "separator",
    id: "divider"
  },
  {
    type: "link",
    id: "help",
    label: "Open help",
    href: "https://example.test/help",
    target: "_blank"
  }
] as const satisfies readonly MenuEntry[];

const meta = {
  title: "UI/Table",
  parameters: {
    docs: {
      description: {
        component:
          "Experimental OM Table API. Native semantic table markup owns the structure, while @om/ui owns responsive overflow containment and cell composition. Styles consume @om/tokens. Appearance is not the final OM visual language. Advanced data operations, AG Grid replacement, and responsive card conversion remain deferred."
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Examples: Story = {
  render: () => <TableExamples />
};

export const Themes: Story = {
  render: () => (
    <div style={storyGridStyle}>
      <div data-om-theme="light" style={panelStyle}>
        <Table
          caption="Light mode table"
          columns={recordColumns}
          rows={recordRows}
          description="Light mode table description."
        />
      </div>
      <div data-om-theme="dark" style={panelStyle}>
        <Table caption="Dark mode table" columns={recordColumns} rows={recordRows} />
      </div>
      <div data-om-theme="light" data-om-liturgical-color="red" style={panelStyle}>
        <Table
          caption="Liturgical interactive table"
          columns={interactiveColumns}
          rows={recordRows}
        />
        <p style={noteStyle}>Liturgical accents do not replace focus or status treatment.</p>
      </div>
      <div data-om-theme="light" data-om-contrast="high" style={panelStyle}>
        <Table caption="High contrast table" columns={recordColumns} rows={recordRows} />
      </div>
      <div data-om-theme="light" data-om-focus-visibility="enhanced" style={panelStyle}>
        <Table caption="Enhanced focus table" columns={interactiveColumns} rows={recordRows} />
      </div>
      <div data-om-theme="light" data-om-contrast="forced" style={panelStyle}>
        <Table caption="Forced colors table" columns={recordColumns} rows={recordRows} />
        <p style={noteStyle}>Forced colors preserve table boundaries and row readability.</p>
      </div>
      <div data-om-theme="light" data-om-text-scale="large" style={panelStyle}>
        <Table caption="Large text table" columns={wideColumns} rows={wideRows} />
      </div>
    </div>
  )
};

function TableExamples(): ReactElement {
  return (
    <div data-om-theme="light" style={storyGridStyle}>
      <p style={noteStyle}>
        Tables use native semantic markup with a required accessible name, one row-header column,
        and explicit controls inside cells. APIs are experimental and not final OM screen designs.
      </p>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Basic table</h3>
        <Table
          caption="Records table"
          description="Visible caption and supporting description."
          columns={recordColumns}
          rows={recordRows}
        />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Accessible label only</h3>
        <Table
          accessibleLabel="Accessible label only table"
          columns={recordColumns}
          rows={recordRows}
          description="The accessible label is used when no visible caption is supplied."
        />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Density</h3>
        <Table
          caption="Compact table"
          columns={recordColumns}
          density="compact"
          rows={recordRows}
        />
        <Table
          caption="Comfortable table"
          columns={recordColumns}
          density="comfortable"
          rows={recordRows}
        />
        <Table
          caption="Spacious table"
          columns={recordColumns}
          density="spacious"
          rows={recordRows}
        />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Striped rows</h3>
        <Table caption="Striped table" columns={recordColumns} isStriped rows={recordRows} />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Loading and empty</h3>
        <Table
          caption="Loading table"
          columns={recordColumns}
          isLoading
          loadingMessage="Loading records"
          rows={recordRows}
        />
        <Table
          caption="Empty table"
          columns={recordColumns}
          emptyMessage="No records available"
          rows={[]}
        />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Long content</h3>
        <div style={narrowStyle}>
          <Table
            caption="Narrow overflow table"
            columns={wideColumns}
            rows={wideRows}
            description="Horizontal overflow stays inside the table container."
          />
        </div>
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Interactive cells</h3>
        <Table caption="Interactive cells table" columns={interactiveColumns} rows={recordRows} />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Actions cell</h3>
        <Table
          caption="Actions table"
          columns={[
            {
              id: "name",
              header: "Record",
              isRowHeader: true,
              renderCell: (row: RecordRow) => row.name
            },
            {
              id: "status",
              header: "Status",
              renderCell: (row: RecordRow) => row.status
            },
            {
              id: "actions",
              header: "Actions",
              alignment: "end",
              renderCell: (row: RecordRow) => (
                <Menu
                  trigger={
                    <IconButton
                      icon={<span aria-hidden="true">⋯</span>}
                      accessibleLabel={`More ${row.name} actions`}
                    />
                  }
                  items={basicItems}
                />
              )
            }
          ]}
          rows={recordRows}
        />
      </section>
      <section style={sectionStyle}>
        <h3 style={headingStyle}>Narrow viewport</h3>
        <div style={narrowViewportStyle}>
          <Table caption="Narrow viewport table" columns={wideColumns} rows={wideRows} />
        </div>
      </section>
    </div>
  );
}

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

const storyGridStyle = {
  display: "grid",
  gap: "1rem",
  maxWidth: "64rem"
};

const sectionStyle = {
  display: "grid",
  gap: "0.75rem"
};

const headingStyle = {
  margin: 0
};

const panelStyle = {
  background: "var(--om-semantic-background-canvas)",
  color: "var(--om-semantic-text-primary)",
  display: "grid",
  gap: "var(--om-primitive-space-4)",
  padding: "var(--om-primitive-space-4)"
};

const narrowStyle = {
  maxWidth: "20rem"
};

const narrowViewportStyle = {
  border: "var(--om-primitive-border-width-1) solid var(--om-semantic-border-decorative)",
  maxWidth: "18rem",
  padding: "var(--om-primitive-space-4)"
};

const noteStyle = {
  margin: 0
};
