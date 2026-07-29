export type TextLiteralHit = {
  readonly kind: "supported" | "unsupported";
  readonly value?: string;
  readonly reason?: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly endLine: number;
  readonly endColumn: number;
};

export type SourceAnalysisResult = {
  readonly filePath: string;
  readonly textLiterals: TextLiteralHit[];
};

/** Deterministic JSX text-literal scan without heuristic rewriting. */
export function analyzeJsxSource(filePath: string, source: string): SourceAnalysisResult {
  const textLiterals: TextLiteralHit[] = [];
  const lines = source.split(/\r?\n/);
  const jsxText = />([^<>{}\n][^<>{}]*)</g;
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
        endColumn: col + value.length
      });
    }
    if (/\{[^}]+\}/.test(line) && /return\s*\(/.test(line) === false) {
      // Dynamic JSX expression markers on the line are unsupported for silent edit.
      if (line.includes("{") && line.includes("}") && /<[A-Za-z]/.test(line)) {
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
  lines[idx] = `${line.slice(0, start)}${nextValue}${line.slice(end)}`;
  return lines.join("\n");
}
