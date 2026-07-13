import type { InputMode, CommonTextFieldProps, TextInputType } from "../shared/field-types.js";

import { forwardRef } from "react";
import {
  FieldError as AriaFieldError,
  Input as AriaInput,
  Text as AriaText,
  TextField as AriaTextField
} from "react-aria-components";

import { Label } from "../label/index.js";
import { joinClassNames } from "../shared/class-names.js";

export type TextFieldProps = CommonTextFieldProps & {
  readonly type?: TextInputType;
  readonly inputMode?: InputMode;
  readonly autoComplete?: string;
  readonly pattern?: string;
  readonly spellCheck?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
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
    type = "text",
    inputMode,
    autoComplete,
    pattern,
    spellCheck
  },
  ref
) {
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
      data-om-component="text-field"
      data-om-size={size}
      data-om-required={isRequired || undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-label-visibility={labelVisibility}
      className={joinClassNames("om-field om-text-field", className) ?? "om-field om-text-field"}
    >
      <Label isRequired={isRequired} visibility={labelVisibility}>
        {label}
      </Label>
      {description === undefined || description === null ? null : (
        <AriaText slot="description" className="om-field__description">
          {description}
        </AriaText>
      )}
      <AriaInput
        ref={ref}
        {...(id === undefined ? {} : { id })}
        {...(name === undefined ? {} : { name })}
        {...(form === undefined ? {} : { form })}
        {...(placeholder === undefined ? {} : { placeholder })}
        {...(maxLength === undefined ? {} : { maxLength })}
        {...(minLength === undefined ? {} : { minLength })}
        {...(inputMode === undefined ? {} : { inputMode })}
        {...(autoComplete === undefined ? {} : { autoComplete })}
        {...(pattern === undefined ? {} : { pattern })}
        {...(spellCheck === undefined ? {} : { spellCheck })}
        type={type}
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
