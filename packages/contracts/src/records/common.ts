import { z } from "zod";

/** OM sacrament row status values (`PATCH /api/*-records/:id/status`). */
export const SACRAMENT_RECORD_STATUSES = [
  "Recorded",
  "Verified",
  "Awaiting Clergy",
] as const;

export type SacramentRecordStatus = (typeof SACRAMENT_RECORD_STATUSES)[number];

export const sacramentRecordStatusSchema = z.enum(SACRAMENT_RECORD_STATUSES);

export const SACRAMENT_RECORD_TYPES = ["baptism", "marriage", "funeral"] as const;

export type SacramentRecordType = (typeof SACRAMENT_RECORD_TYPES)[number];

export const sacramentRecordTypeSchema = z.enum(SACRAMENT_RECORD_TYPES);

/** Non-empty trimmed string — matches OM `isValidField` for required POST/PUT fields. */
export const nonEmptyStringSchema = z.string().trim().min(1);

/** Optional OM date/text field (empty string coerced to null on write). */
export const optionalNullableStringSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

export const optionalAgeSchema = z
  .union([z.coerce.number().int().nonnegative(), z.literal(""), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return value;
  });

export const churchIdSchema = z.coerce.number().int().positive();

export const recordIdSchema = z.coerce.number().int().positive();

export const sortDirectionSchema = z
  .enum(["asc", "desc", "ASC", "DESC"])
  .transform((value) => value.toLowerCase() as "asc" | "desc");

export const recordsListMetaSchema = z.object({
  totalRecords: z.coerce.number().int().nonnegative(),
  currentPage: z.coerce.number().int().positive(),
  totalPages: z.coerce.number().int().positive(),
});

export type RecordsListMeta = z.infer<typeof recordsListMetaSchema>;

/** Shared list query params for `GET /api/*-records` (portal + legacy OM). */
export const recordsListQueryBaseSchema = z.object({
  church_id: churchIdSchema,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(25),
  search: z.string().optional().default(""),
  sortDirection: sortDirectionSchema.default("desc"),
});

export type RecordsListQueryBase = z.infer<typeof recordsListQueryBaseSchema>;

/** Unwrap list payloads (`records` or `data` key) from OM list endpoints. */
export function createRecordsListResponseSchema<T extends z.ZodTypeAny>(rowSchema: T) {
  return z
    .object({
      records: z.array(rowSchema).optional(),
      data: z.array(rowSchema).optional(),
      totalRecords: z.coerce.number().int().nonnegative().optional(),
      total: z.coerce.number().int().nonnegative().optional(),
      currentPage: z.coerce.number().int().positive().optional(),
      page: z.coerce.number().int().positive().optional(),
      totalPages: z.coerce.number().int().positive().optional(),
    })
    .transform((payload) => {
      const rows = payload.records ?? payload.data ?? [];
      const totalRecords = payload.totalRecords ?? payload.total ?? rows.length;
      const currentPage = payload.currentPage ?? payload.page ?? 1;
      const totalPages =
        payload.totalPages ?? Math.max(1, Math.ceil(totalRecords / Math.max(1, rows.length || 1)));
      return { rows, meta: { totalRecords, currentPage, totalPages } };
    });
}

export const sacramentStatusPatchSchema = z.object({
  status: sacramentRecordStatusSchema,
  church_id: churchIdSchema.optional(),
});

export type SacramentStatusPatch = z.infer<typeof sacramentStatusPatchSchema>;
