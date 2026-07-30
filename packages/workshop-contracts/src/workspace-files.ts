import { z } from "zod";

/** Relative POSIX path segments; host still re-validates containment. */
export const workspaceRelativePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(1024)
  .regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._@+-]+(?:\/[A-Za-z0-9._@+-]+)*$/);

export type WorkspaceRelativePath = z.infer<typeof workspaceRelativePathSchema>;

export const workspaceSourceErrorCodeSchema = z.enum([
  "WORKSPACE_NOT_FOUND",
  "REPOSITORY_NOT_ATTACHED",
  "WORKSPACE_READ_ONLY",
  "PATH_INVALID",
  "PATH_OUTSIDE_WORKSPACE",
  "PATH_PROTECTED",
  "SYMLINK_ESCAPE",
  "FILE_NOT_FOUND",
  "FILE_TYPE_NOT_ALLOWED",
  "FILE_TOO_LARGE",
  "BINARY_FILE",
  "SOURCE_CHANGED",
  "VALIDATION_FAILED",
  "FORMATTER_UNAVAILABLE",
  "DIAGNOSTIC_RUN_FAILED",
  "OPERATION_UNSUPPORTED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INTERNAL_ERROR"
]);

export type WorkspaceSourceErrorCode = z.infer<typeof workspaceSourceErrorCodeSchema>;

export const workspaceSourceErrorSchema = z.object({
  code: workspaceSourceErrorCodeSchema,
  message: z.string().trim().min(1),
  details: z.record(z.string(), z.unknown()).optional()
});

export type WorkspaceSourceError = z.infer<typeof workspaceSourceErrorSchema>;

export const workspaceFileLanguageSchema = z.enum([
  "typescript",
  "typescriptreact",
  "javascript",
  "javascriptreact",
  "css",
  "scss",
  "json",
  "markdown",
  "plaintext"
]);

export type WorkspaceFileLanguage = z.infer<typeof workspaceFileLanguageSchema>;

export const workspaceFileTreeEntrySchema = z.object({
  relativePath: z.string().trim().min(1),
  name: z.string().trim().min(1),
  kind: z.enum(["file", "directory"]),
  language: workspaceFileLanguageSchema.optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  modifiedAt: z.string().optional(),
  editable: z.boolean().optional()
});

export type WorkspaceFileTreeEntry = z.infer<typeof workspaceFileTreeEntrySchema>;

export const workspaceFileTreeSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  path: z.string().default(""),
  depth: z.number().int().positive().max(32),
  entries: z.array(workspaceFileTreeEntrySchema),
  truncated: z.boolean(),
  workspaceDirty: z.boolean()
});

export type WorkspaceFileTree = z.infer<typeof workspaceFileTreeSchema>;

export const workspaceFileContentSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  relativePath: z.string().trim().min(1),
  language: workspaceFileLanguageSchema,
  content: z.string(),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sizeBytes: z.number().int().nonnegative(),
  lineEnding: z.enum(["lf", "crlf", "mixed"]),
  modifiedAt: z.string(),
  readOnly: z.boolean(),
  workspaceDirty: z.boolean()
});

export type WorkspaceFileContent = z.infer<typeof workspaceFileContentSchema>;

export const saveWorkspaceFileRequestSchema = z.object({
  relativePath: workspaceRelativePathSchema,
  expectedOriginalSha256: z.string().regex(/^[a-f0-9]{64}$/),
  content: z.string()
});

export type SaveWorkspaceFileRequest = z.infer<typeof saveWorkspaceFileRequestSchema>;

export const saveWorkspaceFileResponseSchema = z.object({
  relativePath: z.string().trim().min(1),
  previousSha256: z.string().regex(/^[a-f0-9]{64}$/),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sizeBytes: z.number().int().nonnegative(),
  modifiedAt: z.string(),
  workspaceDirty: z.boolean()
});

export type SaveWorkspaceFileResponse = z.infer<typeof saveWorkspaceFileResponseSchema>;

export const revertWorkspaceFileRequestSchema = z.object({
  relativePath: workspaceRelativePathSchema,
  expectedOriginalSha256: z.string().regex(/^[a-f0-9]{64}$/),
  target: z.enum(["workspace_base", "repository_head"]).default("repository_head")
});

export type RevertWorkspaceFileRequest = z.infer<typeof revertWorkspaceFileRequestSchema>;

export const workspaceDiffSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  relativePath: z.string().optional(),
  scope: z.enum(["file", "repository"]),
  unifiedDiff: z.string(),
  truncated: z.boolean(),
  workspaceDirty: z.boolean()
});

export type WorkspaceDiff = z.infer<typeof workspaceDiffSchema>;

export const workspaceSearchRequestSchema = z.object({
  query: z.string().min(1).max(512),
  mode: z.enum(["literal", "regex"]).default("literal"),
  path: z.string().default(""),
  includeGlobs: z.array(z.string().max(128)).max(32).default([]),
  excludeGlobs: z.array(z.string().max(128)).max(32).default([]),
  maxResults: z.number().int().positive().max(1000).default(100)
});

export type WorkspaceSearchRequest = z.infer<typeof workspaceSearchRequestSchema>;

export const workspaceSearchHitSchema = z.object({
  relativePath: z.string().trim().min(1),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  preview: z.string()
});

export type WorkspaceSearchHit = z.infer<typeof workspaceSearchHitSchema>;

export const workspaceSearchResultSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  hits: z.array(workspaceSearchHitSchema),
  truncated: z.boolean()
});

export type WorkspaceSearchResult = z.infer<typeof workspaceSearchResultSchema>;

export const formatWorkspaceFileRequestSchema = z.object({
  relativePath: workspaceRelativePathSchema,
  expectedOriginalSha256: z.string().regex(/^[a-f0-9]{64}$/),
  apply: z.boolean().default(false)
});

export type FormatWorkspaceFileRequest = z.infer<typeof formatWorkspaceFileRequestSchema>;

export const formatWorkspaceFileResultSchema = z.object({
  relativePath: z.string().trim().min(1),
  content: z.string(),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  applied: z.boolean(),
  unchanged: z.boolean()
});

export type FormatWorkspaceFileResult = z.infer<typeof formatWorkspaceFileResultSchema>;

export const diagnosticsScopeSchema = z.enum(["file", "affected", "project"]);

export const startDiagnosticsRequestSchema = z.object({
  scope: diagnosticsScopeSchema.optional().default("file"),
  relativePath: workspaceRelativePathSchema.optional()
});

export type StartDiagnosticsRequest = z.infer<typeof startDiagnosticsRequestSchema>;

export const diagnosticItemSchema = z.object({
  relativePath: z.string().trim().min(1),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  severity: z.enum(["error", "warning", "info", "hint"]),
  message: z.string(),
  code: z.string().optional(),
  source: z.string().optional()
});

export type DiagnosticItem = z.infer<typeof diagnosticItemSchema>;

export const diagnosticsJobSchema = z.object({
  runId: z.string().trim().min(1),
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  scope: diagnosticsScopeSchema,
  status: z.enum(["queued", "running", "completed", "failed", "cancelled"]),
  diagnostics: z.array(diagnosticItemSchema).default([]),
  error: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional()
});

export type DiagnosticsJob = z.infer<typeof diagnosticsJobSchema>;
