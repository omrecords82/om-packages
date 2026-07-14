import type { ReactElement } from "react";

import type { DrawerPlacement, DrawerSize } from "../shared/drawer-types.js";

import { isReactElement } from "../shared/dialog-types.js";

type DrawerConfiguration = {
  readonly trigger?: ReactElement | undefined;
  readonly isOpen?: boolean | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly isDismissable?: boolean | undefined;
  readonly isKeyboardDismissDisabled?: boolean | undefined;
  readonly hideCloseButton?: boolean | undefined;
  readonly placement?: DrawerPlacement | undefined;
  readonly size?: DrawerSize | undefined;
};

export function validateDrawerConfiguration({
  trigger,
  isOpen,
  defaultOpen,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  hideCloseButton = false,
  placement = "end",
  size = "md"
}: DrawerConfiguration): {
  readonly placement: DrawerPlacement;
  readonly size: DrawerSize;
} {
  if (trigger !== undefined && !isReactElement(trigger)) {
    warnDevelopment("Drawer trigger must be a React element.");
  }

  if (trigger === undefined && isOpen === undefined && defaultOpen !== true) {
    warnDevelopment(
      "Drawer without a trigger must be controlled with isOpen or rendered initially open."
    );
  }

  if (!isDismissable && isKeyboardDismissDisabled && hideCloseButton) {
    warnDevelopment("Drawer may become impossible to exit when all dismissal paths are disabled.");
  }

  const resolvedPlacement = isDrawerPlacement(placement) ? placement : "end";
  if (!isDrawerPlacement(placement)) {
    warnDevelopment(`Unsupported Drawer placement: ${String(placement)}`);
  }

  const resolvedSize = isDrawerSize(size) ? size : "md";
  if (!isDrawerSize(size)) {
    warnDevelopment(`Unsupported Drawer size: ${String(size)}`);
  }

  return {
    placement: resolvedPlacement,
    size: resolvedSize
  };
}

function warnDevelopment(message: string): void {
  const runtime = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  if (runtime.process?.env?.NODE_ENV !== "production") {
    console.warn(message);
  }
}

function isDrawerPlacement(value: string): value is DrawerPlacement {
  return value === "start" || value === "end" || value === "top" || value === "bottom";
}

function isDrawerSize(value: string): value is DrawerSize {
  return value === "sm" || value === "md" || value === "lg" || value === "xl";
}
