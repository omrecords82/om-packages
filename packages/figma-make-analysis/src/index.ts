export type CandidateClassification =
  | "REUSE_EXISTING"
  | "ADD_VARIANT"
  | "CREATE_NEW_COMPONENT"
  | "COMPOSE_FROM_EXISTING"
  | "REFERENCE_ONLY"
  | "REJECT"
  | "NEEDS_REVIEW";

export type ZipInventoryItem = {
  readonly path: string;
  readonly size: number;
  readonly rejected?: string;
};

export type FigmaMakeInventory = {
  readonly files: ZipInventoryItem[];
  readonly candidates: Array<{
    readonly path: string;
    readonly classification: CandidateClassification;
    readonly reason: string;
  }>;
};

const MAX_FILES = 5000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Pure inventory helper — host performs extraction/sandboxing. */
export function classifyInventory(
  entries: ReadonlyArray<{ path: string; size: number; isSymlink?: boolean }>
): FigmaMakeInventory {
  const files: ZipInventoryItem[] = [];
  const candidates: FigmaMakeInventory["candidates"] = [];
  if (entries.length > MAX_FILES) {
    return {
      files: [{ path: ".", size: 0, rejected: "too many files" }],
      candidates: [
        { path: ".", classification: "REJECT", reason: "archive exceeds file count limit" }
      ]
    };
  }
  for (const entry of entries) {
    if (entry.path.includes("..") || entry.path.startsWith("/")) {
      files.push({ path: entry.path, size: entry.size, rejected: "path traversal" });
      continue;
    }
    if (entry.isSymlink) {
      files.push({ path: entry.path, size: entry.size, rejected: "symlink blocked" });
      continue;
    }
    if (entry.size > MAX_FILE_BYTES) {
      files.push({ path: entry.path, size: entry.size, rejected: "file too large" });
      continue;
    }
    files.push({ path: entry.path, size: entry.size });
    if (/\.(tsx|jsx)$/.test(entry.path) && /components?\//i.test(entry.path)) {
      candidates.push({
        path: entry.path,
        classification: "NEEDS_REVIEW",
        reason: "React component candidate from Figma Make export"
      });
    }
  }
  return { files, candidates };
}
