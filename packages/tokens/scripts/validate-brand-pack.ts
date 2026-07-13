import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { brandPackSchema } from "./schema/schemas.js";

export async function validateBrandPack(
  filePath = join(process.cwd(), "tokens/fixtures/example-parish.brand.json")
): Promise<void> {
  const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
  brandPackSchema.parse(raw);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await validateBrandPack();
}
