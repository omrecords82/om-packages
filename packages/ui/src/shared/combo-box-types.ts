import type { ReactNode } from "react";

import type { SelectOption } from "./select-types.js";
import type { ComponentSize } from "./types.js";
import type { FieldValidationBehavior, LabelVisibility } from "./field-types.js";

export type ComboBoxOption = SelectOption;

export type ComboBoxFilterMode = "contains" | "starts-with";

export type ComboBoxProps = {
  readonly label: ReactNode;
  readonly labelVisibility?: LabelVisibility;

  readonly options: readonly ComboBoxOption[];

  readonly selectedValue?: string | null;
  readonly defaultSelectedValue?: string | null;
  readonly onSelectedValueChange?: (value: string | null) => void;

  readonly inputValue?: string;
  readonly defaultInputValue?: string;
  readonly onInputValueChange?: (value: string) => void;

  readonly filterMode?: ComboBoxFilterMode;

  readonly placeholder?: string;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly noResultsMessage?: string;

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
  readonly inputClassName?: string;
  readonly triggerClassName?: string;
  readonly popoverClassName?: string;
  readonly listBoxClassName?: string;
};
