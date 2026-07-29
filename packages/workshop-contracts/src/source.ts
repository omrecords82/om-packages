import { z } from "zod";

export const workshopSourceIdentitySchema = z.object({
  systemKey: z.string().trim().min(1),
  repositoryKey: z.string().trim().min(1),
  commitSha: z
    .string()
    .trim()
    .regex(/^[0-9a-f]{7,64}$/i, "commitSha must be a git SHA"),
  refName: z.string().trim().min(1).optional(),
  path: z.string().trim().min(1).optional()
});

export type WorkshopSourceIdentity = z.infer<typeof workshopSourceIdentitySchema>;
