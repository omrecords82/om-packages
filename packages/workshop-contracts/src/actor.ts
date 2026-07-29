import { z } from "zod";

export const workshopActorTypeSchema = z.enum(["user", "service", "agent", "system"]);

export type WorkshopActorType = z.infer<typeof workshopActorTypeSchema>;

export const workshopActorContextSchema = z.object({
  actorType: workshopActorTypeSchema,
  externalKey: z.string().trim().min(1),
  displayName: z.string().trim().min(1).optional(),
  email: z.email().optional(),
  roles: z.array(z.string().trim().min(1)).default([]),
  permissions: z.array(z.string().trim().min(1)).default([])
});

export type WorkshopActorContext = z.infer<typeof workshopActorContextSchema>;
