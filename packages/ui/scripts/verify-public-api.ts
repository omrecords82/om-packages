import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const prohibitedPatterns = [
  /from ["']react-aria-components["']/u,
  /from ["']react-aria["']/u,
  /from ["']react-stately["']/u,
  /from ["']@react-types\//u,
  /\bPressEvent\b/u,
  /\bButtonRenderProps\b/u,
  /\bLinkRenderProps\b/u,
  /\bTextFieldRenderProps\b/u,
  /\bFieldErrorRenderProps\b/u,
  /\bCheckboxRenderProps\b/u,
  /\bDialogRenderProps\b/u,
  /\bRadioGroupRenderProps\b/u,
  /\bRadioRenderProps\b/u,
  /\bSelectRenderProps\b/u,
  /\bSelectValueRenderProps\b/u,
  /\bSwitchRenderProps\b/u,
  /\bMenuRenderProps\b/u,
  /\bMenuItemRenderProps\b/u,
  /\bTabsRenderProps\b/u,
  /\bTabListRenderProps\b/u,
  /\bTabRenderProps\b/u,
  /\bTabPanelRenderProps\b/u,
  /\bTooltipTriggerProps\b/u,
  /\bTooltipProps\b.*from ["']react-aria-components["']/u,
  /\bOverlayArrowProps\b/u,
  /\bPlacement\b/u,
  /\bHoverEvent\b/u,
  /\bTooltipTriggerState\b/u,
  /\bTooltipRenderProps\b/u,
  /\bOverlayArrowRenderProps\b/u,
  /\bValidationResult\b/u,
  /\bToggleState\b/u,
  /\bRadioGroupState\b/u,
  /\bSelectState\b/u,
  /\bKey\b/u,
  /\bSelection\b/u,
  /\bCollection\b/u,
  /\bNode\b/u,
  /\bListBoxProps\b/u,
  /\bListBoxItemProps\b/u,
  /\bMenuItemProps\b/u,
  /\bMenuTriggerProps\b/u,
  /\bMenuProps\b.*from ["']react-aria-components["']/u,
  /\bTabsProps\b.*from ["']react-aria-components["']/u,
  /\bTabListProps\b/u,
  /\bTabProps\b/u,
  /\bTabPanelProps\b/u,
  /\bSelectionManager\b/u,
  /\bPopoverProps\b/u,
  /\bFocusEvent\b/u,
  /\bKeyboardEvent\b/u,
  /\bDialogTriggerProps\b/u,
  /\bModalOverlayProps\b/u,
  /\bModalProps\b/u,
  /\bOverlayTriggerState\b/u,
  /\bOverlayTriggerProps\b/u,
  /\bPressResponderProps\b/u,
  /\bAria[A-Z][A-Za-z]+Props\b/u,
  /extends\s+[A-Za-z]*Props/u,
  /onOpenChange\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent|PressEvent)/u,
  /onConfirm\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent|PressEvent)/u,
  /onCancel\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent|PressEvent)/u,
  /onAction\??:\s*\([^)]*(Event|event|PressEvent|Key|Selection|Collection)/u,
  /onValueChange\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent)/u,
  /onSelectionChange\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent)/u
] as const;

export async function verifyPublicApi(distRoot = join(process.cwd(), "dist")): Promise<void> {
  const declarationFiles = await listFiles(distRoot, ".d.ts");
  for (const file of declarationFiles) {
    const content = await readFile(file, "utf8");
    for (const pattern of prohibitedPatterns) {
      if (pattern.test(content)) {
        throw new Error(`Public declaration leaks prohibited vendor API: ${file}`);
      }
    }
  }

  const entry = (await import(pathToFileURL(join(distRoot, "index.js")).href)) as Record<
    string,
    unknown
  >;
  for (const exportName of [
    "Button",
    "Dialog",
    "Checkbox",
    "FieldError",
    "IconButton",
    "AlertDialog",
    "Label",
    "Link",
    "Menu",
    "Radio",
    "RadioGroup",
    "Select",
    "Switch",
    "Tabs",
    "Tooltip",
    "TextArea",
    "TextField"
  ]) {
    if (entry[exportName] === undefined || entry[exportName] === null) {
      throw new Error(`Missing public export: ${exportName}`);
    }
  }

  const expectedSubpaths = [
    ["button", "Button"],
    ["dialog", "Dialog"],
    ["checkbox", "Checkbox"],
    ["field-error", "FieldError"],
    ["icon-button", "IconButton"],
    ["alert-dialog", "AlertDialog"],
    ["label", "Label"],
    ["link", "Link"],
    ["menu", "Menu"],
    ["radio", "Radio"],
    ["radio-group", "RadioGroup"],
    ["select", "Select"],
    ["switch", "Switch"],
    ["tabs", "Tabs"],
    ["tooltip", "Tooltip"],
    ["text-area", "TextArea"],
    ["text-field", "TextField"]
  ] as const;

  for (const [subpath, exportName] of expectedSubpaths) {
    const module = (await import(
      pathToFileURL(join(distRoot, subpath, "index.js")).href
    )) as Record<string, unknown>;
    if (module[exportName] === undefined || module[exportName] === null) {
      throw new Error(`Missing public subpath export: ${subpath}/${exportName}`);
    }
  }

  await verifyDeclarationContains(distRoot, "text-field/TextField.d.ts", [
    "ForwardRefExoticComponent",
    "RefAttributes<HTMLInputElement>",
    "CommonTextFieldProps"
  ]);
  await verifyDeclarationContains(distRoot, "text-area/TextArea.d.ts", [
    "RefAttributes<HTMLTextAreaElement>",
    "CommonTextFieldProps"
  ]);
  await verifyDeclarationContains(distRoot, "label/Label.d.ts", [
    "RefAttributes<HTMLLabelElement>"
  ]);
  await verifyDeclarationContains(distRoot, "checkbox/Checkbox.d.ts", [
    "RefAttributes<HTMLInputElement>",
    "onSelectionChange?: (isSelected: boolean) => void"
  ]);
  await verifyDeclarationContains(distRoot, "radio/Radio.d.ts", [
    "RefAttributes<HTMLInputElement>"
  ]);
  await verifyDeclarationContains(distRoot, "radio-group/RadioGroup.d.ts", [
    "RefAttributes<HTMLDivElement>",
    "onValueChange?: (value: string) => void"
  ]);
  await verifyDeclarationContains(distRoot, "select/Select.d.ts", [
    "RefAttributes<HTMLButtonElement>"
  ]);
  await verifyDeclarationContains(distRoot, "dialog/Dialog.d.ts", [
    "RefAttributes<HTMLDivElement>",
    "onOpenChange?: (isOpen: boolean) => void",
    "trigger?: ReactElement"
  ]);
  await verifyDeclarationContains(distRoot, "alert-dialog/AlertDialog.d.ts", [
    "RefAttributes<HTMLDivElement>",
    "onConfirm: () => void",
    "onCancel?: () => void"
  ]);
  await verifyDeclarationContains(distRoot, "shared/dialog-types.d.ts", [
    "export type DialogSize",
    "export type AlertDialogIntent",
    "export type AlertDialogInitialFocus",
    "export type AlertDialogConfirmBehavior"
  ]);
  await verifyDeclarationContains(distRoot, "menu/Menu.d.ts", ["RefAttributes<HTMLButtonElement>"]);
  await verifyDeclarationContains(distRoot, "shared/menu-types.d.ts", [
    "export type MenuEntry",
    "readonly id: string",
    "onAction?: (id: string) => void",
    "onOpenChange?: (isOpen: boolean) => void"
  ]);
  await verifyDeclarationContains(distRoot, "shared/select-types.d.ts", [
    "readonly value: string",
    "onValueChange?: (value: string | null) => void"
  ]);
  await verifyDeclarationContains(distRoot, "switch/Switch.d.ts", [
    "RefAttributes<HTMLInputElement>",
    "onSelectionChange?: (isSelected: boolean) => void"
  ]);
  await verifyDeclarationContains(distRoot, "tabs/Tabs.d.ts", ["RefAttributes<HTMLDivElement>"]);
  await verifyDeclarationContains(distRoot, "shared/tabs-types.d.ts", [
    "export type TabItem",
    "readonly id: string",
    "onSelectionChange?: (id: string) => void"
  ]);
  await verifyDeclarationContains(distRoot, "tooltip/Tooltip.d.ts", ["RefAttributes<HTMLElement>"]);
  await verifyDeclarationContains(distRoot, "shared/tooltip-types.d.ts", [
    "export type TooltipPlacement",
    "export type TooltipDelay",
    "onOpenChange?: (isOpen: boolean) => void",
    "trigger: TooltipElement"
  ]);
}

async function listFiles(root: string, suffix: string): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, suffix)));
    } else if (entry.isFile() && entry.name.endsWith(suffix)) {
      files.push(path);
    }
  }
  return files.sort();
}

async function verifyDeclarationContains(
  distRoot: string,
  relativePath: string,
  expectedSnippets: readonly string[]
): Promise<void> {
  const content = await readFile(join(distRoot, relativePath), "utf8");
  for (const snippet of expectedSnippets) {
    if (!content.includes(snippet)) {
      throw new Error(`Missing expected declaration snippet in ${relativePath}: ${snippet}`);
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await verifyPublicApi();
}
