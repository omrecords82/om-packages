import type { ReactElement, ReactNode } from "react";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export type AlertDialogIntent = "confirmation" | "warning" | "destructive";

export type AlertDialogInitialFocus = "cancel" | "confirm";

export type AlertDialogConfirmBehavior = "close" | "manual";

export function isPresentNode(value: ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== "";
}

export function isReactElement(value: unknown): value is ReactElement {
  return typeof value === "object" && value !== null && "props" in value && "type" in value;
}

export function isNonEmptyText(value: string): boolean {
  return value.trim().length > 0;
}
