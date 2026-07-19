import { z } from "zod";

import {
  churchIdSchema,
  nonEmptyStringSchema,
  optionalAgeSchema,
  optionalNullableStringSchema,
  recordIdSchema,
  recordsListQueryBaseSchema,
  sacramentRecordStatusSchema,
  createRecordsListResponseSchema,
} from "./common.js";

/** Sortable columns accepted by `GET /api/baptism-records`. */
export const BAPTISM_SORT_FIELDS = [
  "id",
  "first_name",
  "last_name",
  "birth_date",
  "reception_date",
  "clergy",
  "birthplace",
  "entry_type",
  "sponsors",
  "parents",
  "created_at",
  "updated_at",
] as const;

export type BaptismSortField = (typeof BAPTISM_SORT_FIELDS)[number];

export const baptismSortFieldSchema = z.enum(BAPTISM_SORT_FIELDS);

/** Canonical baptism row (snake_case DB / API fields). */
export const baptismRecordRowSchema = z.object({
  id: recordIdSchema,
  church_id: churchIdSchema,
  first_name: nonEmptyStringSchema,
  last_name: nonEmptyStringSchema,
  middle_name: z.string().optional(),
  birth_date: z.string().nullable().optional(),
  reception_date: z.string().nullable().optional(),
  birthplace: z.string().nullable().optional(),
  entry_type: z.string().nullable().optional(),
  sponsors: z.string().nullable().optional(),
  parents: z.string().nullable().optional(),
  clergy: nonEmptyStringSchema,
  status: sacramentRecordStatusSchema.default("Recorded"),
  verified_by: z.union([z.string(), z.number(), z.null()]).optional(),
  verified_at: z.string().nullable().optional(),
});

export type BaptismRecordRow = z.infer<typeof baptismRecordRowSchema>;

/** Writable baptism fields (snake_case) aligned with OM `baptism_records` columns. */
export const baptismRecordWriteSchema = z.object({
  church_id: churchIdSchema.optional(),
  first_name: nonEmptyStringSchema,
  last_name: nonEmptyStringSchema,
  birth_date: optionalNullableStringSchema,
  reception_date: optionalNullableStringSchema,
  birthplace: optionalNullableStringSchema,
  entry_type: optionalNullableStringSchema,
  sponsors: optionalNullableStringSchema,
  parents: optionalNullableStringSchema,
  clergy: nonEmptyStringSchema,
});

export type BaptismRecordWrite = z.infer<typeof baptismRecordWriteSchema>;

/** `POST /api/baptism-records` body — OM requires first_name, last_name, birth_date, clergy. */
export const baptismRecordCreateSchema = baptismRecordWriteSchema.extend({
  birth_date: nonEmptyStringSchema,
});

export type BaptismRecordCreate = z.infer<typeof baptismRecordCreateSchema>;

/** `PUT /api/baptism-records/:id` body — birth_date optional when omitted (keep existing). */
export const baptismRecordUpdateSchema = baptismRecordWriteSchema;

export type BaptismRecordUpdate = z.infer<typeof baptismRecordUpdateSchema>;

export const baptismRecordsListQuerySchema = recordsListQueryBaseSchema.extend({
  sortField: baptismSortFieldSchema.default("id"),
});

export type BaptismRecordsListQuery = z.infer<typeof baptismRecordsListQuerySchema>;

export const baptismRecordsListResponseSchema =
  createRecordsListResponseSchema(baptismRecordRowSchema);

/** Accept snake_case or legacy camelCase keys before validating canonical write shape. */
export function normalizeBaptismWriteInput(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  return {
    church_id: input.church_id,
    first_name: input.first_name ?? input.firstName,
    last_name: input.last_name ?? input.lastName,
    birth_date: input.birth_date ?? input.dateOfBirth ?? input.birthDate,
    reception_date: input.reception_date ?? input.dateOfBaptism ?? input.baptismDate,
    birthplace: input.birthplace ?? input.placeOfBirth,
    entry_type: input.entry_type ?? input.entryType,
    sponsors: input.sponsors ?? input.godparents,
    parents: input.parents,
    clergy: input.clergy ?? input.priest,
  };
}

export function parseBaptismRecordCreate(raw: unknown) {
  return baptismRecordCreateSchema.parse(normalizeBaptismWriteInput(raw));
}

export function parseBaptismRecordUpdate(raw: unknown) {
  return baptismRecordUpdateSchema.parse(normalizeBaptismWriteInput(raw));
}

export function parseBaptismRecordRow(raw: unknown) {
  return baptismRecordRowSchema.parse(raw);
}

export function parseBaptismRecordsListQuery(raw: unknown) {
  return baptismRecordsListQuerySchema.parse(raw);
}

export function parseBaptismRecordsListResponse(raw: unknown) {
  return baptismRecordsListResponseSchema.parse(raw);
}
