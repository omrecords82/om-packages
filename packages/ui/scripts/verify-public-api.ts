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
  /\bValidationResult\b/u,
  /\bAria[A-Z][A-Za-z]+Props\b/u,
  /extends\s+[A-Za-z]*Props/u,
  /onValueChange\??:\s*\([^)]*(Event|event|ChangeEvent|FormEvent)/u
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
    "FieldError",
    "IconButton",
    "Label",
    "Link",
    "TextArea",
    "TextField"
  ]) {
    if (entry[exportName] === undefined || entry[exportName] === null) {
      throw new Error(`Missing public export: ${exportName}`);
    }
  }

  const expectedSubpaths = [
    ["button", "Button"],
    ["field-error", "FieldError"],
    ["icon-button", "IconButton"],
    ["label", "Label"],
    ["link", "Link"],
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
