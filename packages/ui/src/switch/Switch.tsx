import type { ReactNode } from "react";
import type { ComponentSize } from "../shared/types.js";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  FieldError as AriaFieldError,
  SwitchButton as AriaSwitchButton,
  SwitchField as AriaSwitchField,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/selection-types.js";

export type SwitchProps = {
  readonly children: ReactNode;
  readonly name?: string;
  readonly value?: string;
  readonly isSelected?: boolean;
  readonly defaultSelected?: boolean;
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

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    children,
    name,
    value,
    isSelected,
    defaultSelected,
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
  useImperativeHandle(ref, () => getInputRef(inputRef.current, "Switch"), []);
  const isInitiallySelected = isSelected ?? defaultSelected ?? false;
  const shouldRenderError = isInvalid && isPresentNode(errorMessage);

  return (
    <AriaSwitchField
      {...(isSelected === undefined ? {} : { isSelected })}
      {...(defaultSelected === undefined ? {} : { defaultSelected })}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(form === undefined ? {} : { form })}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      inputRef={inputRef}
      data-om-component="switch"
      data-om-size={size}
      data-om-selected={isInitiallySelected || undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-required={isRequired || undefined}
      className={
        joinClassNames("om-selection-control om-switch", className) ??
        "om-selection-control om-switch"
      }
      onChange={(nextSelected) => {
        if (!isDisabled && !isReadOnly) {
          onSelectionChange?.(nextSelected);
        }
      }}
    >
      <AriaSwitchButton
        className={
          joinClassNames("om-selection-control__button", controlClassName) ??
          "om-selection-control__button"
        }
      >
        <span className="om-switch__track" aria-hidden="true">
          <span className="om-switch__thumb" />
        </span>
        <span className="om-selection-control__content">
          <span className="om-selection-control__label">{children}</span>
        </span>
      </AriaSwitchButton>
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
    </AriaSwitchField>
  );
});

function getInputRef(element: HTMLInputElement | null, componentName: string): HTMLInputElement {
  if (element === null) {
    throw new Error(`${componentName} input ref is unavailable.`);
  }

  return element;
}
