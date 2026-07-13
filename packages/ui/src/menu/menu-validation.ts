import type { MenuEntry, MenuLinkItem } from "../shared/menu-types.js";
import type { ReactElement } from "react";

const executableSchemePattern = /^\s*(?:javascript|data|vbscript):/iu;

export function validateMenuEntries(items: readonly MenuEntry[]): void {
  const ids = new Set<string>();
  let availableItems = 0;

  for (const item of items) {
    if (item.id.trim().length === 0) {
      throw new Error("Menu entries require non-empty string ids.");
    }

    if (ids.has(item.id)) {
      throw new Error(`Menu entry ids must be unique: ${item.id}`);
    }
    ids.add(item.id);

    if (item.type === "separator") {
      continue;
    }

    if (item.label.trim().length === 0) {
      throw new Error("Menu action and link items require non-empty labels.");
    }

    if (item.isDisabled !== true) {
      availableItems += 1;
    }

    if (item.type === "link") {
      validateMenuLink(item);
    }
  }

  if (items.length > 0 && availableItems === 0) {
    warnDevelopment("Menu contains no available action or link items.");
  }
}

export function hasAvailableMenuItem(items: readonly MenuEntry[]): boolean {
  return items.some((item) => item.type !== "separator" && item.isDisabled !== true);
}

export function getSafeRel(item: MenuLinkItem): string | undefined {
  if (item.target !== "_blank") {
    return item.rel;
  }

  if (hasSafeBlankRel(item.rel)) {
    return item.rel;
  }

  return "noopener noreferrer";
}

export function validateMenuTrigger(trigger: ReactElement): void {
  const type = trigger.type;
  if (typeof type !== "string") {
    return;
  }

  const props = trigger.props as {
    readonly role?: string;
    readonly tabIndex?: number;
    readonly onClick?: unknown;
  };

  const isIntrinsicInteractive =
    type === "button" || type === "a" || props.role === "button" || props.tabIndex === 0;
  if (!isIntrinsicInteractive && props.onClick === undefined) {
    warnDevelopment("Menu trigger should be an interactive React element.");
  }
}

function validateMenuLink(item: MenuLinkItem): void {
  if (item.href.trim().length === 0) {
    throw new Error("Menu link items require non-empty href values.");
  }

  if (executableSchemePattern.test(item.href)) {
    throw new Error(`Menu link item uses an unsafe href scheme: ${item.id}`);
  }
}

function hasSafeBlankRel(rel: string | undefined): boolean {
  if (rel === undefined) {
    return false;
  }

  const values = new Set(rel.toLowerCase().split(/\s+/u).filter(Boolean));
  return values.has("noopener") && values.has("noreferrer");
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
