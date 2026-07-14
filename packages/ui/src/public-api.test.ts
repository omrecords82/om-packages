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
      "./alert-dialog",
      "./button",
      "./checkbox",
      "./css",
      "./dialog",
      "./field-error",
      "./icon-button",
      "./label",
      "./link",
      "./menu",
      "./radio",
      "./radio-group",
      "./select",
      "./switch",
      "./tabs",
      "./text-area",
      "./text-field",
      "./tooltip"
    ]);
  });

  it("does not expose React Aria types in source public contracts", async () => {
    const files = [
      "src/button/Button.tsx",
      "src/alert-dialog/AlertDialog.tsx",
      "src/checkbox/Checkbox.tsx",
      "src/dialog/Dialog.tsx",
      "src/field-error/FieldError.tsx",
      "src/link/Link.tsx",
      "src/menu/Menu.tsx",
      "src/icon-button/IconButton.tsx",
      "src/label/Label.tsx",
      "src/radio/Radio.tsx",
      "src/radio-group/RadioGroup.tsx",
      "src/select/Select.tsx",
      "src/switch/Switch.tsx",
      "src/tabs/Tabs.tsx",
      "src/tooltip/Tooltip.tsx",
      "src/text-area/TextArea.tsx",
      "src/text-field/TextField.tsx",
      "src/shared/field-types.ts",
      "src/shared/dialog-types.ts",
      "src/shared/menu-types.ts",
      "src/shared/select-types.ts",
      "src/shared/selection-types.ts",
      "src/shared/tabs-types.ts",
      "src/shared/tooltip-types.ts",
      "src/index.ts"
    ];
    const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
    for (const content of contents) {
      expect(content).not.toMatch(/extends .*react-aria-components/u);
      expect(content).not.toMatch(
        /PressEvent|RenderProps|ValidationResult|ToggleState|RadioGroupState|OverlayTriggerState|@react-types/u
      );
      expect(content).not.toMatch(/onValueChange\??:\s*\([^)]*(Event|event|ChangeEvent)/u);
      expect(content).not.toMatch(/onSelectionChange\??:\s*\([^)]*(Event|event|ChangeEvent)/u);
    }
  });

  it("keeps Menu contracts free of vendor collection, key, and event types", async () => {
    const contents = await Promise.all(
      ["src/shared/menu-types.ts"].map((file) => readFile(file, "utf8"))
    );

    for (const content of contents) {
      expect(content).not.toMatch(
        /react-aria-components|react-aria|react-stately|@react-types|Key|Selection|Collection|PressEvent|MenuTriggerProps|MenuItemProps|PopoverProps/u
      );
      expect(content).not.toMatch(/onAction\??:\s*\([^)]*(Event|event|PressEvent|Key)/u);
      expect(content).toMatch(/readonly id: string/u);
    }
  });

  it("keeps Select contracts free of vendor collection and key types", async () => {
    const content = await readFile("src/shared/select-types.ts", "utf8");

    expect(content).not.toMatch(
      /react-aria-components|react-aria|react-stately|@react-types|Key|Selection|Collection|ListBox/u
    );
    expect(content).toMatch(/readonly value: string/u);
    expect(content).toMatch(/onValueChange\?: \(value: string \| null\) => void/u);
  });

  it("keeps Tabs contracts free of vendor selection, collection, and event types", async () => {
    const content = await readFile("src/shared/tabs-types.ts", "utf8");

    expect(content).not.toMatch(
      /react-aria-components|react-aria|react-stately|@react-types|\bKey\b|\bSelection\b|\bCollection\b|\bNode\b|TabListProps|TabPanelProps/u
    );
    expect(content).toMatch(/readonly id: string/u);
    expect(content).toMatch(/onSelectionChange\?: \(id: string\) => void/u);
  });

  it("keeps Tooltip contracts free of vendor placement, overlay, state, and event types", async () => {
    const content = await readFile("src/shared/tooltip-types.ts", "utf8");

    expect(content).not.toMatch(
      /react-aria-components|react-aria|react-stately|@react-types|TooltipTriggerProps|OverlayArrowProps|\bPlacement\b|PressEvent|HoverEvent|OverlayTriggerState/u
    );
    expect(content).toMatch(/export type TooltipPlacement/u);
    expect(content).toMatch(/export type TooltipDelay/u);
    expect(content).toMatch(/onOpenChange\?: \(isOpen: boolean\) => void/u);
  });

  it("keeps dialog contracts free of vendor overlay types and events", async () => {
    const contents = await Promise.all(
      [
        "src/dialog/Dialog.tsx",
        "src/alert-dialog/AlertDialog.tsx",
        "src/shared/dialog-types.ts"
      ].map((file) => readFile(file, "utf8"))
    );

    for (const content of contents) {
      expect(content).not.toMatch(
        /DialogTriggerProps|ModalOverlayProps|ModalProps|PressEvent|OverlayTrigger|AriaDialogProps|AriaModalOverlayProps/u
      );
      expect(content).not.toMatch(/onOpenChange\??:\s*\([^)]*(Event|event|PressEvent)/u);
      expect(content).not.toMatch(/onConfirm\??:\s*\([^)]*(Event|event|PressEvent)/u);
      expect(content).not.toMatch(/onCancel\??:\s*\([^)]*(Event|event|PressEvent)/u);
    }
  });
});
