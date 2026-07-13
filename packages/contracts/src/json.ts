/* eslint-disable @typescript-eslint/consistent-indexed-object-style -- Public JSON contract requires readonly index signatures. */
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type JsonObject = {
  readonly [key: string]: JsonValue;
};
