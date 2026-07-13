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
  /\bLinkRenderProps\b/u
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
  for (const exportName of ["Button", "IconButton", "Link"]) {
    if (entry[exportName] === undefined || entry[exportName] === null) {
      throw new Error(`Missing public export: ${exportName}`);
    }
  }
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await verifyPublicApi();
}
