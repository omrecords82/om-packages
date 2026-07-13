import type { ReactNode } from "react";

import type { ComponentSize } from "./types.js";

export type SelectionOrientation = "vertical" | "horizontal";

export type CheckboxState = boolean | "mixed";

export type SelectionControlProps = {
  readonly children: ReactNode;
  readonly name?: string;
  readonly value?: string;
  readonly isRequired?: boolean;
  readonly isDisabled?: boolean;
  readonly isReadOnly?: boolean;
  readonly isInvalid?: boolean;
  readonly size?: ComponentSize;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly className?: string;
  readonly controlClassName?: string;
};

export function isPresentNode(value: ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== "";
}
