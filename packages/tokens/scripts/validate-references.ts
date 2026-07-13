import { buildTokenRegistry, loadTokenDocuments } from "./load-token-sources.js";
import { assertNoCircularReferences } from "./resolve-tokens.js";
import { getReferencedTokenPath, isTokenReference } from "./schema/path-policy.js";

export async function validateReferences(): Promise<void> {
  const registry = buildTokenRegistry(await loadTokenDocuments());

  for (const definition of registry.values()) {
    if (typeof definition.value !== "string") {
      continue;
    }
    if (definition.value.includes("{") || definition.value.includes("}")) {
      const referencedPath = getReferencedTokenPath(definition.value);
      if (referencedPath === undefined || !isTokenReference(definition.value)) {
        throw new Error(`Malformed token reference at ${definition.path}.`);
      }
      if (!registry.has(referencedPath)) {
        throw new Error(`Unresolved token reference at ${definition.path}: ${referencedPath}.`);
      }
    }
  }

  assertNoCircularReferences(registry);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await validateReferences();
}
