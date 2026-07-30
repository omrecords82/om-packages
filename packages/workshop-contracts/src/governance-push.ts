import { z } from "zod";

export const submitApprovalRequestSchema = z.object({
  changeSetKey: z.string().trim().min(1),
  requesterExternalKey: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1).max(2000).optional()
});

export type SubmitApprovalRequest = z.infer<typeof submitApprovalRequestSchema>;

export const submitApprovalResultSchema = z
  .object({
    ok: z.boolean(),
    requestKey: z.string().optional(),
    requestId: z.number().optional(),
    revisionId: z.union([z.number(), z.string()]).optional(),
    contentSha: z.string().optional(),
    changeSetKey: z.string().optional(),
    error: z.string().optional()
  })
  .passthrough();

export type SubmitApprovalResult = z.infer<typeof submitApprovalResultSchema>;

export const decideApprovalRequestSchema = z.object({
  requestKey: z.string().trim().min(1),
  actorExternalKey: z.string().trim().min(1),
  decision: z.enum(["approve", "reject", "request_changes"]),
  reason: z.string().optional()
});

export type DecideApprovalRequest = z.infer<typeof decideApprovalRequestSchema>;

export const decideApprovalResultSchema = z
  .object({
    ok: z.boolean(),
    error: z.string().optional(),
    status: z.string().optional()
  })
  .passthrough();

export type DecideApprovalResult = z.infer<typeof decideApprovalResultSchema>;

export const pushApprovedRevisionRequestSchema = z.object({
  requestKey: z.string().trim().min(1),
  worktreePath: z.string().optional(),
  workspaceId: z.string().optional(),
  repositoryId: z.string().optional(),
  outputBranch: z.string().optional(),
  actorExternalKey: z.string().optional(),
  commitMessage: z.string().optional()
});

export type PushApprovedRevisionRequest = z.infer<typeof pushApprovedRevisionRequestSchema>;

export const pushApprovedRevisionResultSchema = z.object({
  ok: z.boolean(),
  requestKey: z.string().optional(),
  revisionId: z.string().optional(),
  contentSha256: z.string().optional(),
  outputBranch: z.string().optional(),
  outputCommitSha: z.string().optional(),
  remote: z.string().optional(),
  filesPushed: z.array(z.string()).optional(),
  merged: z.boolean().optional(),
  deployed: z.boolean().optional(),
  productionTouched: z.boolean().optional(),
  code: z.string().optional(),
  message: z.string().optional()
});

export type PushApprovedRevisionResult = z.infer<typeof pushApprovedRevisionResultSchema>;
