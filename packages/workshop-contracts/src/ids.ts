import { z } from "zod";

/** Reverse-DNS or scoped package module identifier. */
export const moduleIdSchema = z
  .string()
  .trim()
  .regex(
    /^(?:@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z][a-z0-9]*(?:\.[a-z0-9][a-z0-9-]*)+)$/i,
    "module id must be a scoped package name or reverse-DNS identifier"
  );

export type ModuleId = z.infer<typeof moduleIdSchema>;

/** SemVer 2.0 core version (optional prerelease / build). */
export const semverSchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "version must be a SemVer string"
  );

export type SemVer = z.infer<typeof semverSchema>;

/** npm-style host API compatibility range. */
export const hostCompatibilityRangeSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[0-9A-Za-z .<>=|^~*-]+$/, "invalid host compatibility range");

export type HostCompatibilityRange = z.infer<typeof hostCompatibilityRangeSchema>;

export const capabilityIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9]*(?:[.:-][a-z0-9]+)*$/i, "invalid capability id");

export type CapabilityId = z.infer<typeof capabilityIdSchema>;

export const permissionIdSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9]*(?:[.:-][a-z0-9]+)*$/i, "invalid permission id");

export type PermissionId = z.infer<typeof permissionIdSchema>;

export const correlationIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/, "invalid correlation id");

export type CorrelationId = z.infer<typeof correlationIdSchema>;

export function createCorrelationId(prefix = "omw"): CorrelationId {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return correlationIdSchema.parse(`${prefix}-${rand}`);
}
