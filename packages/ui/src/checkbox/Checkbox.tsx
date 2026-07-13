import type { ReactNode } from "react";
import type { ComponentSize } from "../shared/types.js";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  CheckboxButton as AriaCheckboxButton,
  CheckboxField as AriaCheckboxField,
  FieldError as AriaFieldError,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/selection-types.js";

export type CheckboxProps = {
  readonly children: ReactNode;
  readonly name?: string;
  readonly value?: string;
  readonly isSelected?: boolean;
  readonly defaultSelected?: boolean;
  readonly isIndeterminate?: boolean;
  readonly isRequired?: boolean;
  readonly isDisabled?: boolean;
  readonly isReadOnly?: boolean;
  readonly isInvalid?: boolean;
  readonly size?: ComponentSize;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly className?: string;
  readonly controlClassName?: string;
  readonly form?: string;
  readonly onSelectionChange?: (isSelected: boolean) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    children,
    name,
    value,
    isSelected,
    defaultSelected,
    isIndeterminate = false,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    isInvalid = false,
    size = "md",
    description,
    errorMessage,
    className,
    controlClassName,
    form,
    onSelectionChange
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => getInputRef(inputRef.current, "Checkbox"), []);
  const isInitiallySelected = isSelected ?? defaultSelected ?? false;
  const shouldRenderError = isInvalid && isPresentNode(errorMessage);

  return (
    <AriaCheckboxField
      {...(isSelected === undefined ? {} : { isSelected })}
      {...(defaultSelected === undefined ? {} : { defaultSelected })}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(form === undefined ? {} : { form })}
      isIndeterminate={isIndeterminate}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      inputRef={inputRef}
      data-om-component="checkbox"
      data-om-size={size}
      data-om-selected={isInitiallySelected || undefined}
      data-om-indeterminate={isIndeterminate || undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-required={isRequired || undefined}
      className={
        joinClassNames("om-selection-control om-checkbox", className) ??
        "om-selection-control om-checkbox"
      }
      onChange={(nextSelected) => {
        if (!isDisabled && !isReadOnly) {
          onSelectionChange?.(nextSelected);
        }
      }}
    >
      <AriaCheckboxButton
        className={
          joinClassNames("om-selection-control__button", controlClassName) ??
          "om-selection-control__button"
        }
      >
        <span className="om-selection-control__indicator" aria-hidden="true">
          <span className="om-selection-control__mark" />
        </span>
        <span className="om-selection-control__content">
          <span className="om-selection-control__label">{children}</span>
        </span>
      </AriaCheckboxButton>
      {isPresentNode(description) ? (
        <AriaText slot="description" className="om-selection-control__description">
          {description}
        </AriaText>
      ) : null}
      {shouldRenderError ? (
        <AriaFieldError
          elementType="span"
          data-om-component="field-error"
          data-om-invalid="true"
          className="om-selection-control__error"
        >
          {errorMessage}
        </AriaFieldError>
      ) : null}
    </AriaCheckboxField>
  );
});

function getInputRef(element: HTMLInputElement | null, componentName: string): HTMLInputElement {
  if (element === null) {
    throw new Error(`${componentName} input ref is unavailable.`);
  }

  return element;
}
