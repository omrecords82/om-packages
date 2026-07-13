import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BootstrapNotice } from "./index.js";

describe("@om/ui bootstrap component", () => {
  it("renders the bootstrap contract marker", () => {
    const html = renderToStaticMarkup(<BootstrapNotice label="Bootstrap proof" />);

    expect(html).toContain("Bootstrap proof");
    expect(html).toContain('data-om-phase="phase-0"');
    expect(html).toContain("@om/contracts");
  });
});
