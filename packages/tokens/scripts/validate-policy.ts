import { THEME_LAYER_ORDER } from "@om/contracts";

import { buildTokenRegistry, loadTokenDocuments } from "./load-token-sources.js";
import { assertLiturgicalOverrideAllowed, assertThemeLayerOrder } from "./resolve-tokens.js";

export async function validatePolicy(): Promise<void> {
  const documents = await loadTokenDocuments();
  const registry = buildTokenRegistry(documents);

  assertThemeLayerOrder(THEME_LAYER_ORDER);

  for (const token of registry.values()) {
    if (token.category === "liturgical") {
      assertLiturgicalOverrideAllowed(token.path);
    }
    if (token.stability === "deprecated" && token.replacement === undefined) {
      throw new Error(`Deprecated token ${token.path} is missing replacement metadata.`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await validatePolicy();
}
