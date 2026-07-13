import { pathToFileURL } from "node:url";

import { access, readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

import { assertLiturgicalOverrideAllowed } from "./resolve-tokens.js";
import {
  assertCssNameCollisions,
  createArtifactModel,
  generatedArtifactPaths,
  tokenPathToCssCustomProperty
} from "./artifacts/model.js";

const layerDeclaration = "@layer om.defaults, om.app, om.brand, om.liturgical, om.accessibility;";
const machineSpecificPatterns = [
  /\/var\/www\//u,
  /\/home\//u,
  /[A-Z]:\\/u,
  /\b20\d{2}-\d{2}-\d{2}T/u,
  /\bhostname\b/iu
] as const;

export async function validateGeneratedArtifacts(
  distRoot = join(process.cwd(), "dist")
): Promise<void> {
  const actualFiles = await listFiles(distRoot);
  const expectedFiles = [...generatedArtifactPaths].sort();
  if (actualFiles.join("|") !== expectedFiles.join("|")) {
    throw new Error(
      `Unexpected generated artifacts. Expected ${expectedFiles.join(", ")} but found ${actualFiles.join(", ")}.`
    );
  }

  for (const artifactPath of expectedFiles) {
    await access(join(distRoot, artifactPath));
    const content = await readFile(join(distRoot, artifactPath), "utf8");
    if (!content.endsWith("\n")) {
      throw new Error(`${artifactPath} must end with a normalized final newline.`);
    }
    for (const pattern of machineSpecificPatterns) {
      if (pattern.test(content)) {
        throw new Error(`${artifactPath} contains machine-specific content.`);
      }
    }
  }

  const manifest = JSON.parse(await readFile(join(distRoot, "manifest.json"), "utf8")) as {
    readonly tokens: readonly { readonly path: string; readonly value: string | number }[];
    readonly tokenPaths: readonly string[];
  };
  const metadata = JSON.parse(await readFile(join(distRoot, "metadata.json"), "utf8")) as {
    readonly generatedArtifacts: readonly string[];
    readonly tokenCountsByCategory: Readonly<Record<string, number>>;
  };
  const model = await createArtifactModel();

  assertCssNameCollisions(manifest.tokens);
  if ([...metadata.generatedArtifacts].sort().join("|") !== expectedFiles.join("|")) {
    throw new Error("Metadata generated artifact list does not match actual output.");
  }
  if (manifest.tokens.length !== model.manifest.tokens.length) {
    throw new Error("Manifest token count does not match source registry count.");
  }
  if (metadata.tokenCountsByCategory.primitive !== model.metadata.tokenCountsByCategory.primitive) {
    throw new Error("Metadata category counts do not match source registry counts.");
  }

  const tokensModule = (await import(pathToFileURL(join(distRoot, "tokens.js")).href)) as {
    readonly tokenPathToCssCustomProperty?: unknown;
  };
  if (typeof tokensModule.tokenPathToCssCustomProperty !== "function") {
    throw new Error("Generated ESM token module did not import successfully.");
  }

  const combinedCss = await readFile(join(distRoot, "css/om-tokens.css"), "utf8");
  if (!combinedCss.startsWith(layerDeclaration)) {
    throw new Error("Combined CSS does not start with the required layer declaration.");
  }
  if (
    combinedCss.indexOf("@layer om.accessibility") < combinedCss.indexOf("@layer om.liturgical")
  ) {
    throw new Error("Accessibility CSS must remain after liturgical CSS.");
  }

  validateCssReferences(combinedCss, manifest.tokenPaths);
  validateLiturgicalCss(await readFile(join(distRoot, "css/om-liturgical.css"), "utf8"));
}

function validateCssReferences(css: string, tokenPaths: readonly string[]): void {
  const emittedProperties = new Set(tokenPaths.map(tokenPathToCssCustomProperty));
  const references = css.matchAll(/var\((--om-[^)]+)\)/gu);
  for (const [, property] of references) {
    if (property === undefined || !emittedProperties.has(property)) {
      throw new Error(`CSS variable reference ${property ?? "<missing>"} is unresolved.`);
    }
  }
}

function validateLiturgicalCss(css: string): void {
  for (const match of css.matchAll(/(--om-[a-z0-9-]+):/gu)) {
    const property = match[1];
    if (property === undefined) {
      continue;
    }
    const path = property.replace(/^--om-/u, "").replace(/-/gu, ".");
    assertLiturgicalOverrideAllowed(path);
  }
}

async function listFiles(root: string, base = root): Promise<readonly string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path, base)));
    } else if (entry.isFile()) {
      files.push(relative(base, path).split(sep).join("/"));
    }
  }
  return files.sort();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await validateGeneratedArtifacts();
}
