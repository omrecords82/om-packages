import { z } from "zod";

export const runtimePrepareResultSchema = z.object({
  ok: z.boolean(),
  workspaceKey: z.string().optional(),
  worktreePath: z.string().optional(),
  sourceCommit: z.string().optional(),
  workspaceId: z.string().nullable().optional(),
  repositoryId: z.string().nullable().optional(),
  routeDefault: z.string().optional(),
  runtimeProfile: z.string().optional(),
  previewProxyPrefix: z.string().optional(),
  hmr: z.boolean().optional(),
  productionTouched: z.boolean().optional(),
  error: z.string().optional(),
  hint: z.string().optional(),
  message: z.string().optional()
});

export type RuntimePrepareResult = z.infer<typeof runtimePrepareResultSchema>;

export const runtimeStartRequestSchema = z.object({
  workspaceKey: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
  mode: z.enum(["mock", "live"]).optional()
});

export type RuntimeStartRequest = z.infer<typeof runtimeStartRequestSchema>;

export const runtimeStatusSchema = z
  .object({
    ok: z.boolean(),
    running: z.boolean().optional(),
    runtimeRunning: z.boolean().optional(),
    healthy: z.boolean().optional(),
    workspaceKey: z.string().nullable().optional(),
    worktreePath: z.string().optional(),
    sourceCommit: z.string().nullable().optional(),
    previewUrl: z.string().nullable().optional(),
    route: z.string().nullable().optional(),
    mode: z.string().nullable().optional(),
    port: z.number().nullable().optional(),
    hmr: z.boolean().optional(),
    productionReferenceReadOnly: z.boolean().optional(),
    error: z.string().nullable().optional(),
    workspaceId: z.string().nullable().optional(),
    repositoryId: z.string().nullable().optional(),
    routeDefault: z.string().optional()
  })
  .passthrough();

export type RuntimeStatus = z.infer<typeof runtimeStatusSchema>;

export const runtimeLogsSchema = z.object({
  ok: z.boolean(),
  workspaceKey: z.string().nullable().optional(),
  logs: z.string(),
  truncated: z.boolean(),
  running: z.boolean().optional(),
  scrubbed: z.boolean().optional()
});

export type RuntimeLogs = z.infer<typeof runtimeLogsSchema>;

export const runtimeLocateRequestSchema = z.object({
  workspaceKey: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
  selector: z.string().optional()
});

export type RuntimeLocateRequest = z.infer<typeof runtimeLocateRequestSchema>;

export const runtimeLocateResultSchema = z.object({
  ok: z.boolean(),
  workspaceKey: z.string().optional(),
  sourceCommit: z.string().optional(),
  route: z.string().optional(),
  relativePath: z.string().optional(),
  line: z.number().int().positive().optional(),
  column: z.number().int().positive().optional(),
  endLine: z.number().int().positive().optional(),
  endColumn: z.number().int().positive().optional(),
  componentHint: z.string().optional(),
  structuredEditSupported: z.boolean().optional(),
  notes: z.string().optional(),
  error: z.string().optional()
});

export type RuntimeLocateResult = z.infer<typeof runtimeLocateResultSchema>;

export const runtimeAttachRequestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  workspaceKey: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional()
});

export type RuntimeAttachRequest = z.infer<typeof runtimeAttachRequestSchema>;
