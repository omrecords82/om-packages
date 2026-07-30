import { describe, expect, it } from "vitest";

import {
  saveWorkspaceFileRequestSchema,
  workspaceFileContentSchema,
  workspaceRelativePathSchema,
  workspaceSearchRequestSchema,
  workspaceSourceErrorCodeSchema
} from "./workspace-files.js";

describe("workspace file contracts", () => {
  it("accepts safe relative paths", () => {
    expect(workspaceRelativePathSchema.parse("src/pages/source.tsx")).toBe("src/pages/source.tsx");
  });

  it("rejects traversal and absolute paths", () => {
    for (const bad of ["../secret", "/etc/passwd", "foo/../bar", "C:\\Windows", ""]) {
      expect(() => workspaceRelativePathSchema.parse(bad)).toThrow();
    }
  });

  it("parses save request and content DTO", () => {
    const sha = "a".repeat(64);
    const save = saveWorkspaceFileRequestSchema.parse({
      relativePath: "src/a.tsx",
      expectedOriginalSha256: sha,
      content: "export const x = 1;\n"
    });
    expect(save.relativePath).toBe("src/a.tsx");
    const content = workspaceFileContentSchema.parse({
      workspaceId: "1",
      repositoryId: "2",
      relativePath: "src/a.tsx",
      language: "typescriptreact",
      content: "export const x = 1;\n",
      contentSha256: sha,
      sizeBytes: 20,
      lineEnding: "lf",
      modifiedAt: "2026-07-30T00:00:00.000Z",
      readOnly: false,
      workspaceDirty: true
    });
    expect(content.language).toBe("typescriptreact");
  });

  it("includes SOURCE_CHANGED in source error codes", () => {
    expect(workspaceSourceErrorCodeSchema.parse("SOURCE_CHANGED")).toBe("SOURCE_CHANGED");
  });

  it("parses search request defaults", () => {
    const req = workspaceSearchRequestSchema.parse({ query: "hello" });
    expect(req.mode).toBe("literal");
    expect(req.maxResults).toBe(100);
  });
});
