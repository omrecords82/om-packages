import type { ReactNode } from "react";

import type { FieldValidationBehavior, LabelVisibility } from "./field-types.js";
import type { ComponentSize } from "./types.js";

export type SelectOption = {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
};

export type SelectProps = {
  readonly label: ReactNode;
  readonly labelVisibility?: LabelVisibility;
  readonly options: readonly SelectOption[];
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly placeholder?: string;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly name?: string;
  readonly form?: string;
  readonly id?: string;
  readonly size?: ComponentSize;
  readonly isRequired?: boolean;
  readonly isDisabled?: boolean;
  readonly isReadOnly?: boolean;
  readonly isInvalid?: boolean;
  readonly validationBehavior?: FieldValidationBehavior;
  readonly autoFocus?: boolean;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly popoverClassName?: string;
  readonly listBoxClassName?: string;
};
