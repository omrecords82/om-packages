export type TextLiteralHit = {
  readonly kind: "supported" | "unsupported";
  readonly value?: string;
  readonly reason?: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine: number;
  readonly endColumn: number;
  /** jsx-text | string-prop | boolean-prop | className */
  readonly form?: "jsx-text" | "string-prop" | "boolean-prop" | "className";
  readonly propName?: string;
};

export type SourceAnalysisResult = {
  readonly filePath: string;
  readonly textLiterals: TextLiteralHit[];
};

export type StructuredEditOperation =
  | "replace_jsx_text"
  | "replace_string_prop"
  | "replace_boolean_prop"
  | "update_classname";

/**
 * Deterministic JSX text / simple prop scan.
 * Dynamic expressions are labeled unsupported (no silent rewrite).
 */
export function analyzeJsxSource(filePath: string, source: string): SourceAnalysisResult {
  const textLiterals: TextLiteralHit[] = [];
  const lines = source.split(/\r?\n/);
  const jsxText = />([^<>{}\n][^<>{}]*)</g;
  const stringProp = /\b([A-Za-z_][\w]*)\s*=\s*(["'])([^"'\\]|\\.)*\2/g;
  const booleanProp = /\b([A-Za-z_][\w]*)\s*=\s*\{(true|false)\}/g;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";

    let match: RegExpExecArray | null;
    const re = new RegExp(jsxText.source, "g");
    while ((match = re.exec(line)) !== null) {
      const value = (match[1] ?? "").trim();
      if (!value) continue;
      const col = (match.index ?? 0) + 2;
      textLiterals.push({
        kind: "supported",
        value,
        filePath,
        line: i + 1,
        column: col,
        endLine: i + 1,
        endColumn: col + value.length,
        form: "jsx-text"
      });
    }

    const propRe = new RegExp(stringProp.source, "g");
    while ((match = propRe.exec(line)) !== null) {
      const full = match[0] ?? "";
      const propName = match[1] ?? "";
      const quote = match[2] ?? '"';
      const eq = full.indexOf("=");
      const qOpen = full.indexOf(quote, eq + 1);
      if (qOpen < 0) continue;
      const valueStartInFull = qOpen + 1;
      const value = full.slice(valueStartInFull, full.length - 1);
      if (!value || value.includes("{")) continue;
      const col = (match.index ?? 0) + valueStartInFull + 1;
      textLiterals.push({
        kind: "supported",
        value,
        filePath,
        line: i + 1,
        column: col,
        endLine: i + 1,
        endColumn: col + value.length,
        form: propName === "className" ? "className" : "string-prop",
        propName
      });
    }

    const boolRe = new RegExp(booleanProp.source, "g");
    while ((match = boolRe.exec(line)) !== null) {
      const propName = match[1] ?? "";
      const value = match[2] ?? "";
      const full = match[0] ?? "";
      const valueIdx = full.lastIndexOf(value);
      const col = (match.index ?? 0) + valueIdx + 1;
      textLiterals.push({
        kind: "supported",
        value,
        filePath,
        line: i + 1,
        column: col,
        endLine: i + 1,
        endColumn: col + value.length,
        form: "boolean-prop",
        propName
      });
    }

    if (/className\s*=\s*\{/.test(line) && !/className\s*=\s*["']/.test(line)) {
      textLiterals.push({
        kind: "unsupported",
        reason: "dynamic className expression",
        filePath,
        line: i + 1,
        column: 1,
        endLine: i + 1,
        endColumn: Math.max(1, line.length),
        form: "className",
        propName: "className"
      });
    }

    if (/\{[^}]+\}/.test(line) && /return\s*\(/.test(line) === false) {
      if (line.includes("{") && line.includes("}") && /<[A-Za-z]/.test(line)) {
        if (/>\s*\{/.test(line) || /\{\s*[\w.]+\s*\}/.test(line)) {
          textLiterals.push({
            kind: "unsupported",
            reason: "dynamic JSX expression",
            filePath,
            line: i + 1,
            column: 1,
            endLine: i + 1,
            endColumn: Math.max(1, line.length)
          });
        }
      }
    }
  }
  return { filePath, textLiterals };
}

export function applySupportedTextEdit(
  source: string,
  hit: TextLiteralHit,
  nextValue: string
): string {
  if (hit.kind !== "supported" || hit.value === undefined) {
    throw new Error("unsupported text cannot be edited");
  }
  const lines = source.split(/\r?\n/);
  const idx = hit.line - 1;
  const line = lines[idx];
  if (line === undefined) throw new Error("line out of range");
  const start = hit.column - 1;
  const end = start + hit.value.length;
  if (line.slice(start, end) !== hit.value) {
    throw new Error("source location no longer matches original value");
  }
  if (hit.form === "boolean-prop" && nextValue !== "true" && nextValue !== "false") {
    throw new Error("boolean prop value must be true or false");
  }
  lines[idx] = `${line.slice(0, start)}${nextValue}${line.slice(end)}`;
  return lines.join("\n");
}

/**
 * Apply a typed structured operation against an analyzed hit.
 * Never performs broad string replacement — only the exact span.
 */
export function applyStructuredEdit(
  source: string,
  hit: TextLiteralHit,
  operation: StructuredEditOperation,
  nextValue: string
): string {
  if (hit.kind !== "supported") {
    throw new Error(hit.reason || "operation unsupported for this node");
  }
  switch (operation) {
    case "replace_jsx_text":
      if (hit.form !== "jsx-text") throw new Error("hit is not jsx-text");
      break;
    case "replace_string_prop":
      if (hit.form !== "string-prop") throw new Error("hit is not string-prop");
      break;
    case "replace_boolean_prop":
      if (hit.form !== "boolean-prop") throw new Error("hit is not boolean-prop");
      break;
    case "update_classname":
      if (hit.form !== "className") throw new Error("hit is not className");
      break;
    default:
      throw new Error("unknown structured operation");
  }
  return applySupportedTextEdit(source, hit, nextValue);
}

export function findHitAt(
  result: SourceAnalysisResult,
  line: number,
  column: number,
  form?: TextLiteralHit["form"]
): TextLiteralHit | undefined {
  return result.textLiterals.find(
    (h) =>
      h.kind === "supported" &&
      h.line === line &&
      h.column === column &&
      (form == null || h.form === form)
  );
}
