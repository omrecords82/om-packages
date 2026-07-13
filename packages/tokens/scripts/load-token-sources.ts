import type { TokenDefinition, TokenPath, TokenSourceDocument } from "@om/contracts";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { tokenSourceDocumentSchema } from "./schema/schemas.js";

export type LoadedTokenDocument = {
  readonly filePath: string;
  readonly document: TokenSourceDocument;
};

export type TokenRegistry = ReadonlyMap<TokenPath, TokenDefinition>;

const tokenDirectories = ["primitives", "semantic", "components", "overlays"] as const;

export async function loadTokenDocuments(
  root = join(process.cwd(), "tokens")
): Promise<readonly LoadedTokenDocument[]> {
  const documents: LoadedTokenDocument[] = [];

  for (const directory of tokenDirectories) {
    const directoryPath = join(root, directory);
    const entries = await readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }

      const filePath = join(directoryPath, entry.name);
      const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
      documents.push({ filePath, document: tokenSourceDocumentSchema.parse(raw) });
    }
  }

  return documents;
}

export function buildTokenRegistry(
  documents: readonly LoadedTokenDocument[],
  options: { readonly colorScheme?: "light" | "dark" } = {}
): TokenRegistry {
  const registry = new Map<TokenPath, TokenDefinition>();
  const colorScheme = options.colorScheme ?? "light";

  for (const { filePath, document } of documents) {
    if (filePath.includes("/tokens/semantic/") && !filePath.endsWith(`${colorScheme}.json`)) {
      continue;
    }

    for (const [path, definition] of Object.entries(document.tokens)) {
      if (registry.has(path)) {
        if (document.layer !== "liturgical" && document.layer !== "accessibility") {
          throw new Error(`Duplicate token path "${path}" in ${filePath}.`);
        }
      }

      registry.set(path, {
        path,
        category: document.layer,
        ...definition
      });
    }
  }

  return registry;
}
