import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { emitArtifacts } from "./artifacts/emit.js";
import { createArtifactModel, generatedArtifactPaths } from "./artifacts/model.js";
import { validateGeneratedArtifacts } from "./validate-artifacts.js";

export async function generateTokenArtifacts(
  distRoot = join(process.cwd(), "dist")
): Promise<void> {
  const model = await createArtifactModel();
  const artifacts = emitArtifacts(model);

  await rm(distRoot, { recursive: true, force: true });
  for (const artifactPath of generatedArtifactPaths) {
    const outputPath = join(distRoot, artifactPath);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, artifacts[artifactPath], "utf8");
  }

  await validateGeneratedArtifacts(distRoot);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await generateTokenArtifacts();
}
