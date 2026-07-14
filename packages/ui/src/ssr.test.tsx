import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox/index.js";
import { Dialog } from "./dialog/index.js";
import { AlertDialog } from "./alert-dialog/index.js";
import { FieldError } from "./field-error/index.js";
import { Label } from "./label/index.js";
import { Radio } from "./radio/index.js";
import { RadioGroup } from "./radio-group/index.js";
import { Select } from "./select/index.js";
import { Table } from "./table/index.js";
import { Switch } from "./switch/index.js";
import { Tabs } from "./tabs/index.js";
import { TextArea } from "./text-area/index.js";
import { TextField } from "./text-field/index.js";
import { Tooltip } from "./tooltip/index.js";

describe("@om/ui SSR", () => {
  it("imports and renders field components without browser globals", () => {
    const markup = renderToString(
      <>
        <Label>Server label</Label>
        <FieldError>Server error</FieldError>
        <TextField label="Server text field" />
        <TextArea label="Server text area" />
        <Checkbox>Server checkbox</Checkbox>
        <RadioGroup label="Server radio group">
          <Radio value="server-radio">Server radio</Radio>
        </RadioGroup>
        <Select
          label="Server select"
          options={[
            {
              value: "server-option",
              label: "Server option"
            }
          ]}
        />
        <Switch>Server switch</Switch>
        <Dialog title="Server dialog" trigger={<button type="button">Open server dialog</button>}>
          Server dialog body
        </Dialog>
        <AlertDialog
          title="Server alert"
          description="Server alert description."
          confirmLabel="Confirm"
          onConfirm={() => undefined}
          trigger={<button type="button">Open server alert</button>}
        />
        <Tabs
          accessibleLabel="Server tabs"
          items={[
            {
              id: "server-tab",
              label: "Server tab",
              content: "Server panel"
            }
          ]}
        />
        <Table
          caption="Server table"
          description="Server table description."
          columns={[
            {
              id: "server-name",
              header: "Server name",
              isRowHeader: true,
              renderCell: (row: { readonly id: string; readonly name: string }) => row.name
            }
          ]}
          rows={[{ id: "server-row", name: "Server row" }]}
        />
        <Tooltip
          trigger={<button type="button">Server tooltip trigger</button>}
          content="Server tooltip"
        />
      </>
    );

    expect(markup).toContain("Server label");
    expect(markup).toContain("Server error");
    expect(markup).toContain("Server text field");
    expect(markup).toContain("Server text area");
    expect(markup).toContain("Server checkbox");
    expect(markup).toContain("Server radio group");
    expect(markup).toContain("Server radio");
    expect(markup).toContain("Server select");
    expect(markup).toContain("Server switch");
    expect(markup).toContain("Server tabs");
    expect(markup).toContain("Server tab");
    expect(markup).toContain("Server panel");
    expect(markup).toContain("Server table");
    expect(markup).toContain("Server table description");
    expect(markup).toContain("Server row");
    expect(markup).toContain("Server tooltip trigger");
    expect(markup).not.toContain("Server tooltip</");
    expect(markup).toContain("Open server dialog");
    expect(markup).toContain("Open server alert");
  });
});
