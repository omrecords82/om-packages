import { z } from "zod";

import {
  capabilityIdSchema,
  hostCompatibilityRangeSchema,
  moduleIdSchema,
  permissionIdSchema,
  semverSchema
} from "./ids.js";

export const workshopRouteDefinitionSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_-]*$/i, "invalid route id"),
  path: z
    .string()
    .trim()
    .regex(/^\/[A-Za-z0-9/_-]*$/, "route path must be an absolute path"),
  title: z.string().trim().min(1),
  elementExport: z.string().trim().min(1),
  requiredCapabilities: z.array(capabilityIdSchema).default([]),
  requiredPermissions: z.array(permissionIdSchema).default([])
});

export type WorkshopRouteDefinition = z.infer<typeof workshopRouteDefinitionSchema>;

export const workshopNavigationDefinitionSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_-]*$/i, "invalid navigation id"),
  label: z.string().trim().min(1),
  routeId: z.string().trim().min(1),
  order: z.number().int().optional(),
  icon: z.string().trim().min(1).optional()
});

export type WorkshopNavigationDefinition = z.infer<typeof workshopNavigationDefinitionSchema>;

export const workshopFeatureFlagSchema = z.object({
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_.-]*$/i, "invalid feature flag key"),
  defaultEnabled: z.boolean().default(false),
  description: z.string().trim().min(1).optional()
});

export type WorkshopFeatureFlag = z.infer<typeof workshopFeatureFlagSchema>;

export const workshopModuleStatusSchema = z.enum(["ready", "degraded", "unavailable", "error"]);

export type WorkshopModuleStatus = z.infer<typeof workshopModuleStatusSchema>;

export const workshopModuleDiagnosticSchema = z.object({
  status: workshopModuleStatusSchema,
  message: z.string().trim().min(1).optional(),
  details: z.record(z.string(), z.unknown()).optional()
});

export type WorkshopModuleDiagnostic = z.infer<typeof workshopModuleDiagnosticSchema>;

export const workshopModuleManifestSchema = z
  .object({
    id: moduleIdSchema,
    version: semverSchema,
    displayName: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    hostCompatibility: hostCompatibilityRangeSchema,
    routes: z.array(workshopRouteDefinitionSchema).min(1),
    navigation: z.array(workshopNavigationDefinitionSchema).default([]),
    requiredCapabilities: z.array(capabilityIdSchema).default([]),
    requiredPermissions: z.array(permissionIdSchema).default([]),
    featureFlags: z.array(workshopFeatureFlagSchema).default([]),
    diagnostic: workshopModuleDiagnosticSchema.optional()
  })
  .superRefine((manifest, ctx) => {
    const routeIds = new Set(manifest.routes.map((route) => route.id));
    for (const nav of manifest.navigation) {
      if (!routeIds.has(nav.routeId)) {
        ctx.addIssue({
          code: "custom",
          message: `navigation '${nav.id}' references unknown routeId '${nav.routeId}'`,
          path: ["navigation"]
        });
      }
    }
  });

export type WorkshopModuleManifest = z.infer<typeof workshopModuleManifestSchema>;

export function parseWorkshopModuleManifest(input: unknown): WorkshopModuleManifest {
  return workshopModuleManifestSchema.parse(input);
}

export function safeParseWorkshopModuleManifest(input: unknown) {
  return workshopModuleManifestSchema.safeParse(input);
}

/**
 * Validates and freezes a module manifest for host consumption.
 * Modules must call this (or `parseWorkshopModuleManifest`) before export.
 */
export function defineWorkshopModule(manifest: WorkshopModuleManifest): WorkshopModuleManifest {
  return Object.freeze(parseWorkshopModuleManifest(manifest));
}
