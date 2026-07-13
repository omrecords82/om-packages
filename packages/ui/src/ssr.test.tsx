import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FieldError } from "./field-error/index.js";
import { Label } from "./label/index.js";
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
      </>
    );

    expect(markup).toContain("Server label");
    expect(markup).toContain("Server error");
    expect(markup).toContain("Server text field");
    expect(markup).toContain("Server text area");
  });
});
