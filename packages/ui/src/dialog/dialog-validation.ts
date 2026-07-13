import type { ReactElement } from "react";

import { isReactElement } from "../shared/dialog-types.js";

type DialogValidationOptions = {
  readonly trigger?: ReactElement | undefined;
  readonly isOpen?: boolean | undefined;
  readonly defaultOpen?: boolean | undefined;
};

export function validateDialogConfiguration({
  trigger,
  isOpen,
  defaultOpen
}: DialogValidationOptions): void {
  if (trigger !== undefined && !isReactElement(trigger)) {
    warnDevelopment("Dialog trigger must be a React element.");
  }

  if (trigger === undefined && isOpen === undefined && defaultOpen !== true) {
    warnDevelopment(
      "Dialog without a trigger must be controlled with isOpen or rendered initially open."
    );
  }
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}
