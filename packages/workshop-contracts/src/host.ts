import { z } from "zod";

import { capabilityIdSchema, permissionIdSchema, semverSchema } from "./ids.js";

export const workshopHostCapabilitySchema = z.object({
  id: capabilityIdSchema,
  available: z.boolean(),
  reason: z.string().trim().min(1).optional()
});

export type WorkshopHostCapability = z.infer<typeof workshopHostCapabilitySchema>;

export const workshopHostStatusSchema = z.object({
  hostApiVersion: semverSchema,
  environmentKey: z.string().trim().min(1),
  systemKey: z.string().trim().min(1),
  healthy: z.boolean(),
  message: z.string().trim().min(1).optional(),
  observedAt: z.iso.datetime({ offset: true }).optional()
});

export type WorkshopHostStatus = z.infer<typeof workshopHostStatusSchema>;

export const workshopHostCapabilitiesSchema = z.object({
  hostApiVersion: semverSchema,
  capabilities: z.array(workshopHostCapabilitySchema),
  permissions: z.array(permissionIdSchema).default([])
});

export type WorkshopHostCapabilities = z.infer<typeof workshopHostCapabilitiesSchema>;
