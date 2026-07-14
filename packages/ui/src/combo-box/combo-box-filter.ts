import type { ComboBoxFilterMode } from "../shared/combo-box-types.js";

export function createComboBoxFilter(
  filterMode: ComboBoxFilterMode
): (textValue: string, inputValue: string) => boolean {
  return filterMode === "starts-with" ? startsWithFilter : containsFilter;
}

function containsFilter(textValue: string, inputValue: string): boolean {
  const normalizedInput = normalizeSearchText(inputValue);
  if (normalizedInput.length === 0) {
    return true;
  }

  return normalizeSearchText(textValue).includes(normalizedInput);
}

function startsWithFilter(textValue: string, inputValue: string): boolean {
  const normalizedInput = normalizeSearchText(inputValue);
  if (normalizedInput.length === 0) {
    return true;
  }

  return normalizeSearchText(textValue).startsWith(normalizedInput);
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim();
}
