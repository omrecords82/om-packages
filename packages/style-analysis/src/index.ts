export type StyleClassification =
  | "TOKEN_COMPLIANT"
  | "HARDCODED_VALUE"
  | "DUPLICATE_RULE"
  | "CONFLICTING_RULE"
  | "UNUSED_RULE"
  | "LEGACY_RULE"
  | "COMPONENT_LOCAL"
  | "PAGE_LOCAL"
  | "GLOBAL"
  | "GENERATED"
  | "CSS_IN_JS"
  | "TAILWIND_UTILITY";

export type StyleFinding = {
  readonly classification: StyleClassification;
  readonly filePath: string;
  readonly line: number;
  readonly snippet: string;
  readonly confidence: number;
  readonly recommendation?: string;
};

const HEX = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
const TOKEN = /var\(--om-[a-z0-9-]+\)/gi;
const TW = /\b(?:className|class)=["'`]([^"'`]+)["'`]/g;

export function analyzeStyleSource(filePath: string, source: string): StyleFinding[] {
  const findings: StyleFinding[] = [];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    for (const m of line.matchAll(TOKEN)) {
      findings.push({
        classification: "TOKEN_COMPLIANT",
        filePath,
        line: i + 1,
        snippet: m[0],
        confidence: 0.95
      });
    }
    for (const m of line.matchAll(HEX)) {
      findings.push({
        classification: "HARDCODED_VALUE",
        filePath,
        line: i + 1,
        snippet: m[0],
        confidence: 0.9,
        recommendation: "Replace with nearest @om/tokens color variable when available"
      });
    }
    for (const m of line.matchAll(TW)) {
      findings.push({
        classification: "TAILWIND_UTILITY",
        filePath,
        line: i + 1,
        snippet: m[1] ?? "",
        confidence: 0.85
      });
    }
  }
  return findings;
}
