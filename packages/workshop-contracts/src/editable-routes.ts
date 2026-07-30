import { z } from "zod";

export const omEditableRelatedFileSchema = z.object({
  path: z.string().trim().min(1),
  role: z.string().trim().min(1),
  exportName: z.string().nullable().optional()
});

export const omEditableElementHintSchema = z.object({
  kind: z.enum(["heading", "paragraph", "data-field", "styled-container"]),
  label: z.string().trim().min(1),
  sourceFile: z.string().trim().min(1),
  match: z.string().optional(),
  structuredEditSupported: z.boolean().optional()
});

export const omEditableRouteSchema = z.object({
  routeKey: z.string().trim().min(1),
  systemKey: z.string().trim().min(1),
  applicationKey: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1),
  aliases: z.array(z.string()).optional(),
  productionUrl: z.string().url(),
  repositoryKey: z.string().trim().min(1),
  frontendRoot: z.string().trim().min(1),
  entryFile: z.string().trim().min(1),
  entryExport: z.string().nullable().optional(),
  relatedFiles: z.array(omEditableRelatedFileSchema).default([]),
  runtimeProfile: z.string().trim().min(1),
  previewProfile: z.string().trim().min(1).optional(),
  authDataProfile: z.string().trim().min(1).optional(),
  artifactKey: z.string().trim().min(1),
  owner: z.string().optional(),
  enabled: z.boolean().default(true),
  readOnly: z.boolean().optional(),
  elementHints: z.array(omEditableElementHintSchema).optional(),
  canonicalRepository: z
    .object({
      repositoryKey: z.string(),
      remoteUrl: z.string().optional(),
      localMirrorPath: z.string().optional(),
      defaultBranch: z.string().optional(),
      baseCommit: z.string().nullable().optional()
    })
    .optional(),
  productionComparisonReadOnly: z.boolean().optional()
});

export type OmEditableRoute = z.infer<typeof omEditableRouteSchema>;

export const listEditableRoutesResultSchema = z.object({
  ok: z.boolean(),
  checksum: z.string().optional(),
  routes: z.array(omEditableRouteSchema)
});

export type ListEditableRoutesResult = z.infer<typeof listEditableRoutesResultSchema>;

export const getEditableRouteResultSchema = z.object({
  ok: z.boolean(),
  route: omEditableRouteSchema.optional(),
  code: z.string().optional(),
  message: z.string().optional()
});

export type GetEditableRouteResult = z.infer<typeof getEditableRouteResultSchema>;
