import type { ReactNode } from "react";
import type { ComponentSize } from "./types.js";

export type LabelVisibility = "visible" | "visually-hidden";

export type TextInputType = "text" | "email" | "password" | "search" | "tel" | "url";

export type InputMode =
  "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";

export type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

export type FieldValidationBehavior = "native" | "aria";

export type CommonTextFieldProps = {
  readonly label: ReactNode;
  readonly labelVisibility?: LabelVisibility;
  readonly name?: string;
  readonly id?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly size?: ComponentSize;
  readonly isRequired?: boolean;
  readonly isDisabled?: boolean;
  readonly isReadOnly?: boolean;
  readonly isInvalid?: boolean;
  readonly validationBehavior?: FieldValidationBehavior;
  readonly autoFocus?: boolean;
  readonly className?: string;
  readonly controlClassName?: string;
  readonly form?: string;
  readonly maxLength?: number;
  readonly minLength?: number;
  readonly onValueChange?: (value: string) => void;
};
