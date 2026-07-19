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

/** Sortable columns accepted by `GET /api/funeral-records`. */
export const FUNERAL_SORT_FIELDS = [
  "id",
  "name",
  "lastname",
  "deceased_date",
  "burial_date",
  "clergy",
  "burial_location",
  "age",
  "created_at",
  "updated_at",
] as const;

export type FuneralSortField = (typeof FUNERAL_SORT_FIELDS)[number];

export const funeralSortFieldSchema = z.enum(FUNERAL_SORT_FIELDS);

/** Canonical funeral row (snake_case DB / API fields). */
export const funeralRecordRowSchema = z.object({
  id: recordIdSchema,
  church_id: churchIdSchema,
  name: nonEmptyStringSchema,
  lastname: nonEmptyStringSchema,
  deceased_date: z.string().nullable().optional(),
  burial_date: z.string().nullable().optional(),
  age: z.number().int().nonnegative().nullable().optional(),
  clergy: nonEmptyStringSchema,
  burial_location: z.string().nullable().optional(),
  burial_location_id: z.number().int().positive().nullable().optional(),
  burial_location_original: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: sacramentRecordStatusSchema.default("Recorded"),
  verified_by: z.union([z.string(), z.number(), z.null()]).optional(),
  verified_at: z.string().nullable().optional(),
});

export type FuneralRecordRow = z.infer<typeof funeralRecordRowSchema>;

export const funeralRecordWriteSchema = z.object({
  church_id: churchIdSchema.optional(),
  name: nonEmptyStringSchema,
  lastname: nonEmptyStringSchema,
  deceased_date: optionalNullableStringSchema,
  burial_date: optionalNullableStringSchema,
  age: optionalAgeSchema,
  clergy: nonEmptyStringSchema,
  burial_location: optionalNullableStringSchema,
  burial_location_id: z.coerce.number().int().positive().nullable().optional(),
  burial_location_original: optionalNullableStringSchema,
});

export type FuneralRecordWrite = z.infer<typeof funeralRecordWriteSchema>;

/** `POST /api/funeral-records` body — OM requires name, lastname, deceased_date, clergy. */
export const funeralRecordCreateSchema = funeralRecordWriteSchema.extend({
  deceased_date: nonEmptyStringSchema,
});

export type FuneralRecordCreate = z.infer<typeof funeralRecordCreateSchema>;

export const funeralRecordUpdateSchema = funeralRecordCreateSchema;

export type FuneralRecordUpdate = z.infer<typeof funeralRecordUpdateSchema>;

export const funeralRecordsListQuerySchema = recordsListQueryBaseSchema.extend({
  sortField: funeralSortFieldSchema.default("id"),
});

export type FuneralRecordsListQuery = z.infer<typeof funeralRecordsListQuerySchema>;

export const funeralRecordsListResponseSchema =
  createRecordsListResponseSchema(funeralRecordRowSchema);

/** Accept snake_case or legacy camelCase keys before validating canonical write shape. */
export function normalizeFuneralWriteInput(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  return {
    church_id: input.church_id,
    name: input.name ?? input.firstName ?? input.first_name,
    lastname: input.lastname ?? input.lastName ?? input.last_name,
    deceased_date: input.deceased_date ?? input.dateOfDeath ?? input.dod,
    burial_date: input.burial_date ?? input.burialDate ?? input.funeralDate,
    age: input.age,
    clergy: input.clergy ?? input.priest,
    burial_location: input.burial_location ?? input.burialPlace ?? input.burialLocation,
    burial_location_id: input.burial_location_id ?? input.burialLocationId,
    burial_location_original: input.burial_location_original ?? input.burialLocationOriginal,
  };
}

export function parseFuneralRecordCreate(raw: unknown) {
  return funeralRecordCreateSchema.parse(normalizeFuneralWriteInput(raw));
}

export function parseFuneralRecordUpdate(raw: unknown) {
  return funeralRecordUpdateSchema.parse(normalizeFuneralWriteInput(raw));
}

export function parseFuneralRecordRow(raw: unknown) {
  return funeralRecordRowSchema.parse(raw);
}

export function parseFuneralRecordsListQuery(raw: unknown) {
  return funeralRecordsListQuerySchema.parse(raw);
}

export function parseFuneralRecordsListResponse(raw: unknown) {
  return funeralRecordsListResponseSchema.parse(raw);
}
