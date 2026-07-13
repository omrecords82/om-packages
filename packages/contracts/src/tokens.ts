/* eslint-disable @typescript-eslint/consistent-indexed-object-style -- Public token maps require readonly index signatures keyed by token path. */
import type { JsonObject } from "./json.js";

export type TokenCategory = "primitive" | "semantic" | "component" | "liturgical" | "accessibility";

export type TokenValueType =
  | "color"
  | "dimension"
  | "number"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "cubicBezier"
  | "shadow"
  | "string";

export type TokenLiteral = string | number;

export type TokenPath = string;

export type TokenReference = `{${string}}`;

// Required public contract separates literal values from reference syntax.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type TokenValue = TokenLiteral | TokenReference;

export type TokenStability = "bootstrap" | "experimental" | "stable" | "deprecated";

export type TokenDefinition = {
  readonly path: TokenPath;
  readonly category: TokenCategory;
  readonly type: TokenValueType;
  readonly value: TokenValue;
  readonly description: string;
  readonly stability: TokenStability;
  readonly deprecated?: boolean;
  readonly replacement?: TokenPath;
  readonly extensions?: JsonObject;
};

export type ResolvedTokenValue = string | number;

export type ResolvedTokenMap = {
  readonly [path: TokenPath]: ResolvedTokenValue;
};

export type TokenSourceLayer = TokenCategory;

export type TokenSourceDocument = {
  readonly schemaVersion: number;
  readonly layer: TokenSourceLayer;
  readonly tokens: {
    readonly [path: TokenPath]: Omit<TokenDefinition, "path" | "category">;
  };
  readonly extensions?: JsonObject;
};
