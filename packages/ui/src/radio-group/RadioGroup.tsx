import type { ReactElement, ReactNode } from "react";
import type { SelectionOrientation } from "../shared/selection-types.js";

import { Children, forwardRef, isValidElement } from "react";
import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  RadioGroup as AriaRadioGroup,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/selection-types.js";

export type RadioGroupProps = {
  readonly label: ReactNode;
  readonly children: ReactNode;
  readonly name?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly orientation?: SelectionOrientation;
  readonly description?: ReactNode;
  readonly errorMessage?: ReactNode;
  readonly isRequired?: boolean;
  readonly isDisabled?: boolean;
  readonly isReadOnly?: boolean;
  readonly isInvalid?: boolean;
  readonly className?: string;
  readonly onValueChange?: (value: string) => void;
};

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    label,
    children,
    name,
    value,
    defaultValue,
    orientation = "vertical",
    description,
    errorMessage,
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    isInvalid = false,
    className,
    onValueChange
  },
  ref
) {
  assertUniqueRadioValues(children);
  const shouldRenderError = isInvalid && isPresentNode(errorMessage);

  return (
    <AriaRadioGroup
      ref={ref}
      {...(name === undefined ? {} : { name })}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      orientation={orientation}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      data-om-component="radio-group"
      data-om-orientation={orientation}
      data-om-required={isRequired || undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      className={joinClassNames("om-radio-group", className) ?? "om-radio-group"}
      onChange={(nextValue) => {
        if (!isDisabled && !isReadOnly) {
          onValueChange?.(nextValue);
        }
      }}
    >
      <AriaLabel className="om-selection-control__group-label">{label}</AriaLabel>
      {isPresentNode(description) ? (
        <AriaText slot="description" className="om-selection-control__description">
          {description}
        </AriaText>
      ) : null}
      <div className="om-radio-group__options">{children}</div>
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
    </AriaRadioGroup>
  );
});

function assertUniqueRadioValues(children: ReactNode): void {
  const values = new Set<string>();
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    const element = child as ReactElement<{ readonly value?: unknown }>;
    if (typeof element.props.value !== "string") {
      continue;
    }

    if (element.props.value.trim().length === 0) {
      throw new Error("RadioGroup radio values must be non-empty strings.");
    }

    if (values.has(element.props.value)) {
      throw new Error(`RadioGroup radio values must be unique: ${element.props.value}`);
    }

    values.add(element.props.value);
  }
}
