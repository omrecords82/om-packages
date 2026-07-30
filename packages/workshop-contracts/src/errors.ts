import { z } from "zod";

import { correlationIdSchema } from "./ids.js";

export const workshopErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CAPABILITY_UNAVAILABLE",
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "CONFLICT",
  "SOURCE_CHANGED",
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
  "FORMATTER_UNAVAILABLE",
  "DIAGNOSTIC_RUN_FAILED",
  "OPERATION_UNSUPPORTED",
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
