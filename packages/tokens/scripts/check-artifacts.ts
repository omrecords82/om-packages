import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { emitArtifacts } from "./artifacts/emit.js";
import { createArtifactModel, generatedArtifactPaths } from "./artifacts/model.js";

export async function checkTokenArtifactDeterminism(): Promise<void> {
  const firstDirectory = await mkdtemp(join(tmpdir(), "om-tokens-check-a-"));
  const secondDirectory = await mkdtemp(join(tmpdir(), "om-tokens-check-b-"));

  try {
    await writeArtifacts(firstDirectory);
    await writeArtifacts(secondDirectory);

    for (const artifactPath of generatedArtifactPaths) {
      const first = await readFile(join(firstDirectory, artifactPath), "utf8");
      const second = await readFile(join(secondDirectory, artifactPath), "utf8");
      if (first !== second) {
        throw new Error(`Generated artifact is not deterministic: ${artifactPath}.`);
      }
    }
  } finally {
    await rm(firstDirectory, { recursive: true, force: true });
    await rm(secondDirectory, { recursive: true, force: true });
  }
}

async function writeArtifacts(directory: string): Promise<void> {
  const artifacts = emitArtifacts(await createArtifactModel());

  for (const artifactPath of generatedArtifactPaths) {
    const outputPath = join(directory, artifactPath);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, artifacts[artifactPath], "utf8");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await checkTokenArtifactDeterminism();
}
