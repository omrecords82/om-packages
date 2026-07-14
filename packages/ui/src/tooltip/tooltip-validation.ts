import type { ReactElement } from "react";
import type { TooltipDelay, TooltipPlacement } from "../shared/tooltip-types.js";

import { isValidElement } from "react";

const placements = new Set<TooltipPlacement>([
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "left-start",
  "left-end",
  "right",
  "right-start",
  "right-end"
]);

const delays = new Set<TooltipDelay>(["immediate", "standard"]);

export function validateTooltipConfiguration({
  trigger,
  content,
  placement,
  delay
}: {
  readonly trigger: ReactElement;
  readonly content: string;
  readonly placement: TooltipPlacement;
  readonly delay: TooltipDelay;
}): void {
  if (!isValidElement(trigger)) {
    throw new Error("Tooltip trigger must be a React element.");
  }

  if (content.trim().length === 0) {
    throw new Error("Tooltip content must be a non-empty string.");
  }

  if (!placements.has(placement)) {
    throw new Error(`Unsupported Tooltip placement: ${placement}`);
  }

  if (!delays.has(delay)) {
    throw new Error(`Unsupported Tooltip delay: ${delay}`);
  }

  validateTrigger(trigger);
}

function validateTrigger(trigger: ReactElement): void {
  if (!isIntrinsicElement(trigger)) {
    warnIfIconOnlyWithoutName(trigger);
    return;
  }

  const props = trigger.props as {
    readonly href?: string;
    readonly role?: string;
    readonly tabIndex?: number;
    readonly onClick?: unknown;
    readonly children?: unknown;
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
    readonly accessibleLabel?: string;
    readonly title?: string;
  };

  const isIntrinsicInteractive =
    trigger.type === "button" ||
    trigger.type === "input" ||
    trigger.type === "select" ||
    trigger.type === "textarea" ||
    (trigger.type === "a" && typeof props.href === "string" && props.href.trim().length > 0) ||
    props.role === "button" ||
    props.role === "link" ||
    props.tabIndex === 0;

  if (!isIntrinsicInteractive && props.onClick === undefined) {
    warnDevelopment("Tooltip trigger should be an interactive React element.");
  }

  warnIfIconOnlyWithoutName(trigger);
}

function warnIfIconOnlyWithoutName(trigger: ReactElement): void {
  const props = trigger.props as {
    readonly children?: unknown;
    readonly "aria-label"?: string;
    readonly "aria-labelledby"?: string;
    readonly accessibleLabel?: string;
    readonly title?: string;
  };

  if (hasAccessibleNameHint(props) || hasVisibleText(props.children)) {
    return;
  }

  warnDevelopment(
    "Tooltip trigger appears to lack an accessible name. Tooltip content is descriptive and is not copied into aria-label."
  );
}

function isIntrinsicElement(trigger: ReactElement): boolean {
  return typeof trigger.type === "string";
}

function hasAccessibleNameHint(props: {
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
  readonly accessibleLabel?: string;
  readonly title?: string;
}): boolean {
  return (
    hasNonEmptyString(props["aria-label"]) ||
    hasNonEmptyString(props["aria-labelledby"]) ||
    hasNonEmptyString(props.accessibleLabel) ||
    hasNonEmptyString(props.title)
  );
}

function hasNonEmptyString(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
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
