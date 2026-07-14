import { isValidElement } from "react";

import type { ComboBoxFilterMode, ComboBoxOption } from "../shared/combo-box-types.js";

const validFilterModes = new Set<ComboBoxFilterMode>(["contains", "starts-with"]);

export function validateComboBoxConfiguration({
  label,
  noResultsMessage,
  filterMode
}: {
  readonly label: unknown;
  readonly noResultsMessage?: string | undefined;
  readonly filterMode?: ComboBoxFilterMode | undefined;
}): ComboBoxFilterMode {
  validateComboBoxLabel(label);
  validateNoResultsMessage(noResultsMessage);
  return resolveFilterMode(filterMode);
}

export function sanitizeComboBoxOptions(
  options: readonly ComboBoxOption[]
): readonly ComboBoxOption[] {
  const validOptions: ComboBoxOption[] = [];
  const values = new Set<string>();

  for (const option of options) {
    if (option.value.trim().length === 0) {
      warnDevelopment("ComboBox options require non-empty string values.");
      continue;
    }

    if (option.label.trim().length === 0) {
      warnDevelopment("ComboBox options require non-empty labels.");
      continue;
    }

    if (values.has(option.value)) {
      warnDevelopment(`ComboBox option values must be unique: ${option.value}`);
      continue;
    }

    values.add(option.value);
    validOptions.push(option);
  }

  if (options.length === 0) {
    warnDevelopment("ComboBox options are empty.");
  } else if (validOptions.length === 0) {
    warnDevelopment("ComboBox contains no usable options.");
  }

  return validOptions;
}

export function getKnownSelectedValue(
  value: string | null | undefined,
  options: readonly ComboBoxOption[]
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  return options.some((option) => option.value === value) ? value : null;
}

export function warnUnknownControlledValue(
  value: string | null | undefined,
  options: readonly ComboBoxOption[]
): void {
  if (value === undefined || value === null || options.some((option) => option.value === value)) {
    return;
  }

  warnDevelopment(`ComboBox selectedValue does not match an option value: ${value}`);
}

export function warnUnknownDefaultValue(
  value: string | null | undefined,
  options: readonly ComboBoxOption[]
): void {
  if (value === undefined || value === null || options.some((option) => option.value === value)) {
    return;
  }

  warnDevelopment(`ComboBox defaultSelectedValue does not match an option value: ${value}`);
}

export function getSelectedOptionLabel(
  value: string | null | undefined,
  options: readonly ComboBoxOption[]
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return options.find((option) => option.value === value)?.label;
}

function validateComboBoxLabel(label: unknown): void {
  if (typeof label === "string") {
    if (label.trim().length === 0) {
      warnDevelopment("ComboBox requires a non-empty label.");
    }
    return;
  }

  if (!hasVisibleText(label)) {
    warnDevelopment("ComboBox requires an accessible label.");
  }
}

function validateNoResultsMessage(message: string | undefined): void {
  if (message?.trim().length === 0) {
    warnDevelopment("ComboBox noResultsMessage should not be empty.");
  }
}

function resolveFilterMode(filterMode: ComboBoxFilterMode | undefined): ComboBoxFilterMode {
  if (filterMode === undefined) {
    return "contains";
  }

  if (!validFilterModes.has(filterMode)) {
    warnDevelopment(`Unsupported ComboBox filter mode: ${filterMode}`);
    return "contains";
  }

  return filterMode;
}

function hasVisibleText(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((child) => hasVisibleText(child));
  }

  if (isValidElement(value)) {
    const props = value.props as { readonly children?: unknown; readonly "aria-hidden"?: boolean };
    if (props["aria-hidden"] === true) {
      return false;
    }

    return hasVisibleText(props.children);
  }

  return false;
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
