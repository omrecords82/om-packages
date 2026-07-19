import { z } from "zod";

import {
  churchIdSchema,
  nonEmptyStringSchema,
  optionalNullableStringSchema,
  recordIdSchema,
  recordsListQueryBaseSchema,
  sacramentRecordStatusSchema,
  createRecordsListResponseSchema,
} from "./common.js";

/** Sortable columns accepted by `GET /api/marriage-records`. */
export const MARRIAGE_SORT_FIELDS = [
  "id",
  "mdate",
  "fname_groom",
  "lname_groom",
  "fname_bride",
  "lname_bride",
  "parentsg",
  "parentsb",
  "witness",
  "mlicense",
  "clergy",
  "created_at",
  "updated_at",
] as const;

export type MarriageSortField = (typeof MARRIAGE_SORT_FIELDS)[number];

export const marriageSortFieldSchema = z.enum(MARRIAGE_SORT_FIELDS);

/** Canonical marriage row (snake_case DB / API fields). */
export const marriageRecordRowSchema = z.object({
  id: recordIdSchema,
  church_id: churchIdSchema,
  mdate: z.string().nullable().optional(),
  fname_groom: nonEmptyStringSchema,
  lname_groom: nonEmptyStringSchema,
  fname_bride: nonEmptyStringSchema,
  lname_bride: nonEmptyStringSchema,
  parentsg: z.string().nullable().optional(),
  parentsb: z.string().nullable().optional(),
  witness: z.string().nullable().optional(),
  mlicense: z.string().nullable().optional(),
  clergy: nonEmptyStringSchema,
  status: sacramentRecordStatusSchema.default("Recorded"),
  verified_by: z.union([z.string(), z.number(), z.null()]).optional(),
  verified_at: z.string().nullable().optional(),
});

export type MarriageRecordRow = z.infer<typeof marriageRecordRowSchema>;

export const marriageRecordWriteSchema = z.object({
  church_id: churchIdSchema.optional(),
  mdate: optionalNullableStringSchema,
  fname_groom: nonEmptyStringSchema,
  lname_groom: nonEmptyStringSchema,
  fname_bride: nonEmptyStringSchema,
  lname_bride: nonEmptyStringSchema,
  parentsg: optionalNullableStringSchema,
  parentsb: optionalNullableStringSchema,
  witness: optionalNullableStringSchema,
  mlicense: optionalNullableStringSchema,
  clergy: nonEmptyStringSchema,
});

export type MarriageRecordWrite = z.infer<typeof marriageRecordWriteSchema>;

/** `POST /api/marriage-records` and `PUT /api/marriage-records/:id` required fields. */
export const marriageRecordCreateSchema = marriageRecordWriteSchema.extend({
  mdate: nonEmptyStringSchema,
});

export type MarriageRecordCreate = z.infer<typeof marriageRecordCreateSchema>;

export const marriageRecordUpdateSchema = marriageRecordCreateSchema;

export type MarriageRecordUpdate = z.infer<typeof marriageRecordUpdateSchema>;

export const marriageRecordsListQuerySchema = recordsListQueryBaseSchema.extend({
  sortField: marriageSortFieldSchema.default("id"),
});

export type MarriageRecordsListQuery = z.infer<typeof marriageRecordsListQuerySchema>;

export const marriageRecordsListResponseSchema =
  createRecordsListResponseSchema(marriageRecordRowSchema);

/** Accept snake_case or legacy camelCase keys before validating canonical write shape. */
export function normalizeMarriageWriteInput(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const input = raw as Record<string, unknown>;
  return {
    church_id: input.church_id,
    mdate: input.mdate ?? input.marriageDate,
    fname_groom: input.fname_groom ?? input.groomFirstName ?? input.firstName,
    lname_groom: input.lname_groom ?? input.groomLastName ?? input.lastName,
    fname_bride: input.fname_bride ?? input.brideFirstName,
    lname_bride: input.lname_bride ?? input.brideLastName,
    parentsg: input.parentsg ?? input.groomParents,
    parentsb: input.parentsb ?? input.brideParents,
    witness: input.witness ?? input.witnesses,
    mlicense: input.mlicense ?? input.marriageLicense,
    clergy: input.clergy ?? input.priest ?? input.celebrant,
  };
}

export function parseMarriageRecordCreate(raw: unknown) {
  return marriageRecordCreateSchema.parse(normalizeMarriageWriteInput(raw));
}

export function parseMarriageRecordUpdate(raw: unknown) {
  return marriageRecordUpdateSchema.parse(normalizeMarriageWriteInput(raw));
}

export function parseMarriageRecordRow(raw: unknown) {
  return marriageRecordRowSchema.parse(raw);
}

export function parseMarriageRecordsListQuery(raw: unknown) {
  return marriageRecordsListQuerySchema.parse(raw);
}

export function parseMarriageRecordsListResponse(raw: unknown) {
  return marriageRecordsListResponseSchema.parse(raw);
}
