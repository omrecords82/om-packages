import type { SelectOption } from "../shared/select-types.js";

export function validateSelectOptions(options: readonly SelectOption[]): void {
  const values = new Set<string>();
  for (const option of options) {
    if (option.value.trim().length === 0) {
      throw new Error("Select options require non-empty string values.");
    }

    if (option.label.trim().length === 0) {
      throw new Error("Select options require non-empty labels.");
    }

    if (values.has(option.value)) {
      throw new Error(`Select option values must be unique: ${option.value}`);
    }

    values.add(option.value);
  }
}

export function assertKnownDefaultValue(
  defaultValue: string | null | undefined,
  options: readonly SelectOption[]
): void {
  if (defaultValue === undefined || defaultValue === null) {
    return;
  }

  if (!options.some((option) => option.value === defaultValue)) {
    throw new Error(`Select defaultValue must match an option value: ${defaultValue}`);
  }
}

export function warnUnknownControlledValue(
  value: string | null | undefined,
  options: readonly SelectOption[]
): void {
  if (value === undefined || value === null || options.some((option) => option.value === value)) {
    return;
  }

  if (typeof console !== "undefined") {
    console.warn(`Select value does not match an option value: ${value}`);
  }
}

export function getKnownSelectedValue(
  value: string | null | undefined,
  options: readonly SelectOption[]
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  return options.some((option) => option.value === value) ? value : null;
}
