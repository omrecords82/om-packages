import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Checkbox } from "./checkbox/index.js";
import { FieldError } from "./field-error/index.js";
import { Label } from "./label/index.js";
import { Radio } from "./radio/index.js";
import { RadioGroup } from "./radio-group/index.js";
import { Select } from "./select/index.js";
import { Switch } from "./switch/index.js";
import { TextArea } from "./text-area/index.js";
import { TextField } from "./text-field/index.js";

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
  });
});
