import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BootstrapNotice } from "./index.js";

describe("@om/ui bootstrap component", () => {
  it("renders the bootstrap contract marker", () => {
    const html = renderToStaticMarkup(<BootstrapNotice label="Bootstrap proof" />);

    expect(html).toContain("Bootstrap proof");
    expect(html).toContain('data-om-schema-version="1"');
    expect(html).toContain('data-om-token-source="json"');
    expect(html).toContain("@om/contracts + @om/tokens");
  });
});
