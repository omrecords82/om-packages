import type { CommonTextFieldProps, TextAreaResize } from "../shared/field-types.js";

import { forwardRef } from "react";
import {
  FieldError as AriaFieldError,
  Text as AriaText,
  TextArea as AriaTextArea,
  TextField as AriaTextField
} from "react-aria-components";

import { Label } from "../label/index.js";
import { joinClassNames } from "../shared/class-names.js";

export type TextAreaProps = CommonTextFieldProps & {
  readonly rows?: number;
  readonly resize?: TextAreaResize;
  readonly spellCheck?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    labelVisibility = "visible",
    name,
    id,
    value,
    defaultValue,
    placeholder,
    description,
    errorMessage,
    size = "md",
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    isInvalid = false,
    validationBehavior = "native",
    autoFocus = false,
    className,
    controlClassName,
    form,
    maxLength,
    minLength,
    onValueChange,
    rows,
    resize = "vertical",
    spellCheck
  },
  ref
) {
  if (rows !== undefined && (!Number.isInteger(rows) || rows < 1)) {
    throw new Error("TextArea rows must be a positive integer.");
  }

  const shouldRenderError = isInvalid && errorMessage !== undefined && errorMessage !== null;

  return (
    <AriaTextField
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onValueChange === undefined ? {} : { onChange: onValueChange })}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      validationBehavior={validationBehavior}
      autoFocus={autoFocus}
      data-om-component="text-area"
      data-om-size={size}
      data-om-required={isRequired || undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-label-visibility={labelVisibility}
      data-om-resize={resize}
      className={joinClassNames("om-field om-text-area", className) ?? "om-field om-text-area"}
    >
      <Label isRequired={isRequired} visibility={labelVisibility}>
        {label}
      </Label>
      {description === undefined || description === null ? null : (
        <AriaText slot="description" className="om-field__description">
          {description}
        </AriaText>
      )}
      <AriaTextArea
        ref={ref}
        {...(id === undefined ? {} : { id })}
        {...(name === undefined ? {} : { name })}
        {...(form === undefined ? {} : { form })}
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(maxLength === undefined ? {} : { maxLength })}
        {...(minLength === undefined ? {} : { minLength })}
        {...(rows === undefined ? {} : { rows })}
        {...(spellCheck === undefined ? {} : { spellCheck })}
        className={joinClassNames("om-field__control", controlClassName) ?? "om-field__control"}
      />
      {shouldRenderError ? (
        <AriaFieldError
          elementType="span"
          data-om-component="field-error"
          data-om-invalid="true"
          className="om-field__error"
        >
          {errorMessage}
        </AriaFieldError>
      ) : null}
    </AriaTextField>
  );
});
