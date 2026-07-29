import { z } from "zod";

import { correlationIdSchema } from "./ids.js";

export const workshopErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CAPABILITY_UNAVAILABLE",
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "CONFLICT",
  "NETWORK_ERROR",
  "INVALID_PAYLOAD",
  "INTERNAL_ERROR"
]);

export type WorkshopErrorCode = z.infer<typeof workshopErrorCodeSchema>;

export const workshopErrorSchema = z.object({
  code: workshopErrorCodeSchema,
  message: z.string().trim().min(1),
  correlationId: correlationIdSchema.optional(),
  details: z.record(z.string(), z.unknown()).optional()
});

export type WorkshopError = z.infer<typeof workshopErrorSchema>;

export function createWorkshopError(
  code: WorkshopErrorCode,
  message: string,
  options?: {
    readonly correlationId?: string;
    readonly details?: Readonly<Record<string, unknown>>;
  }
): WorkshopError {
  return workshopErrorSchema.parse({
    code,
    message,
    ...(options?.correlationId ? { correlationId: options.correlationId } : {}),
    ...(options?.details ? { details: options.details } : {})
  });
}
