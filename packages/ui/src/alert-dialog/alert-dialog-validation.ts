import type { ReactNode } from "react";

import { isNonEmptyText, isPresentNode } from "../shared/dialog-types.js";

type AlertDialogValidationOptions = {
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly description: ReactNode;
};

export function validateAlertDialogConfiguration({
  confirmLabel,
  cancelLabel,
  description
}: AlertDialogValidationOptions): void {
  if (!isNonEmptyText(confirmLabel)) {
    throw new Error("AlertDialog requires a non-empty confirmLabel.");
  }

  if (!isNonEmptyText(cancelLabel)) {
    throw new Error("AlertDialog requires a non-empty cancelLabel.");
  }

  if (!isPresentNode(description)) {
    warnDevelopment("AlertDialog requires a description that explains the decision.");
  }
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
