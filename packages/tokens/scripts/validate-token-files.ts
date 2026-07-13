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

if (import.meta.url === `file://${process.argv[1]}`) {
  await validateTokenFiles();
}
