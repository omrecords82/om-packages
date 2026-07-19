/** Explicit integer version for serialized sacramental record contract payloads. */
export const CURRENT_RECORDS_SCHEMA_VERSION = 1 as const;

export type RecordsSchemaVersion = typeof CURRENT_RECORDS_SCHEMA_VERSION;
