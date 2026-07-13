import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import packageJson from "../package.json" with { type: "json" };

describe("@om/ui package boundaries", () => {
  it("keeps React and React DOM as peers while React Aria Components is internal", () => {
    expect(packageJson.peerDependencies.react).toBe(">=18.3.0 <20");
    expect(packageJson.peerDependencies["react-dom"]).toBe(">=18.3.0 <20");
    expect(packageJson.dependencies["react-aria-components"]).toBe("1.19.0");
    expect(packageJson.devDependencies["@testing-library/react"]).toBe("16.3.2");
    expect(packageJson.devDependencies["@testing-library/user-event"]).toBe("14.6.1");
    expect(packageJson.devDependencies.jsdom).toBe("29.1.1");
    expect(packageJson.devDependencies.tsx).toBe("4.20.6");
    expect(packageJson.dependencies["@testing-library/react"]).toBeUndefined();
    expect(packageJson.dependencies.zod).toBeUndefined();
  });

  it("declares public export paths", () => {
    expect(Object.keys(packageJson.exports).sort()).toEqual([
      ".",
      "./button",
      "./css",
      "./field-error",
      "./icon-button",
      "./label",
      "./link",
      "./text-area",
      "./text-field"
    ]);
  });

  it("does not expose React Aria types in source public contracts", async () => {
    const files = [
      "src/button/Button.tsx",
      "src/field-error/FieldError.tsx",
      "src/link/Link.tsx",
      "src/icon-button/IconButton.tsx",
      "src/label/Label.tsx",
      "src/text-area/TextArea.tsx",
      "src/text-field/TextField.tsx",
      "src/shared/field-types.ts",
      "src/index.ts"
    ];
    const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
    for (const content of contents) {
      expect(content).not.toMatch(/extends .*react-aria-components/u);
      expect(content).not.toMatch(/PressEvent|RenderProps|ValidationResult|@react-types/u);
      expect(content).not.toMatch(/onValueChange\??:\s*\([^)]*(Event|event|ChangeEvent)/u);
    }
  });
});
