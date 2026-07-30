import { z } from "zod";

export const dirtyWorkspaceFileSchema = z.object({
  relativePath: z.string().trim().min(1),
  changeType: z.enum(["create", "modify", "delete", "rename", "move", "mode_change", "binary"]),
  baseSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  resultSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  sizeBeforeBytes: z.number().int().nonnegative().nullable().optional(),
  sizeAfterBytes: z.number().int().nonnegative().nullable().optional()
});

export type DirtyWorkspaceFile = z.infer<typeof dirtyWorkspaceFileSchema>;

export const dirtyWorkspaceResultSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  worktreePath: z.string().optional(),
  dirty: z.boolean(),
  files: z.array(dirtyWorkspaceFileSchema),
  unifiedDiff: z.string().optional()
});

export type DirtyWorkspaceResult = z.infer<typeof dirtyWorkspaceResultSchema>;

export const createChangeSetRequestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(255).optional(),
  actorExternalKey: z.string().trim().min(1).optional()
});

export type CreateChangeSetRequest = z.infer<typeof createChangeSetRequestSchema>;

export const createChangeSetResultSchema = z.object({
  changeSetId: z.string().trim().min(1),
  changeSetKey: z.string().trim().min(1),
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1)
});

export type CreateChangeSetResult = z.infer<typeof createChangeSetResultSchema>;

export const createRevisionRequestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  summary: z.string().trim().min(1).max(2000).optional(),
  actorExternalKey: z.string().trim().min(1).optional()
});

export type CreateRevisionRequest = z.infer<typeof createRevisionRequestSchema>;

export const revisionFileSchema = z.object({
  relativePath: z.string().trim().min(1).nullable().optional(),
  changeType: z.string().trim().min(1),
  baseSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  resultSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional(),
  patchSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable().optional()
});

export const createRevisionResultSchema = z.object({
  changeSetId: z.string().trim().min(1),
  changeSetKey: z.string().trim().min(1),
  revisionId: z.string().trim().min(1),
  revisionNumber: z.number().int().positive(),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sealed: z.boolean(),
  files: z.array(revisionFileSchema),
  evidenceCount: z.number().int().nonnegative()
});

export type CreateRevisionResult = z.infer<typeof createRevisionResultSchema>;

export const revisionDetailSchema = z.object({
  revisionId: z.string().trim().min(1),
  changeSetId: z.string().trim().min(1),
  revisionNumber: z.number().int().positive(),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sealedAt: z.union([z.string(), z.date(), z.null()]).optional(),
  summary: z.string().nullable().optional(),
  sealed: z.boolean(),
  files: z.array(revisionFileSchema),
  guards: z
    .object({
      sealUpdateBlocked: z.boolean().optional(),
      sealDeleteBlocked: z.boolean().optional()
    })
    .optional()
});

export type RevisionDetail = z.infer<typeof revisionDetailSchema>;

export const sealRevisionRequestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  repositoryId: z.string().trim().min(1),
  actorExternalKey: z.string().trim().min(1).optional()
});

export type SealRevisionRequest = z.infer<typeof sealRevisionRequestSchema>;
