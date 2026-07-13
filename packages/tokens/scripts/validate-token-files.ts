import { buildTokenRegistry, loadTokenDocuments } from "./load-token-sources.js";
import { isCanonicalTokenPath } from "./schema/path-policy.js";

export async function validateTokenFiles(): Promise<void> {
  const documents = await loadTokenDocuments();
  const registry = buildTokenRegistry(documents);

  for (const path of registry.keys()) {
    if (!isCanonicalTokenPath(path)) {
      throw new Error(`Invalid token path: ${path}.`);
    }
  }
}

const entrypoint = process.argv[1];

if (entrypoint !== undefined && import.meta.url === `file://${entrypoint}`) {
  await validateTokenFiles();
}
