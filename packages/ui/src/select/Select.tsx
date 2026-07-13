import type { ReactNode } from "react";

import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Button as AriaButton,
  FieldError as AriaFieldError,
  Label as AriaLabel,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Select as AriaSelect,
  SelectValue as AriaSelectValue,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import type { SelectOption, SelectProps } from "../shared/select-types.js";
import {
  assertKnownDefaultValue,
  getKnownSelectedValue,
  validateSelectOptions,
  warnUnknownControlledValue
} from "./select-validation.js";

const defaultPlaceholder = "Select an option";

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    labelVisibility = "visible",
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = defaultPlaceholder,
    description,
    errorMessage,
    name,
    form,
    id,
    size = "md",
    isRequired = false,
    isDisabled = false,
    isReadOnly = false,
    isInvalid = false,
    validationBehavior = "native",
    autoFocus = false,
    className,
    triggerClassName,
    popoverClassName,
    listBoxClassName
  },
  ref
) {
  validateSelectOptions(options);
  assertKnownDefaultValue(defaultValue, options);
  warnUnknownControlledValue(value, options);

  const triggerRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => getButtonRef(triggerRef.current), []);

  const selectedKey = getKnownSelectedValue(value, options);
  const [hasUncontrolledSelection, setHasUncontrolledSelection] = useState(
    defaultValue !== undefined && defaultValue !== null
  );
  const hasSelectedFormValue =
    value === undefined
      ? hasUncontrolledSelection
      : selectedKey !== null && selectedKey !== undefined;
  const isEmpty = options.length === 0;
  const shouldRenderError = isInvalid && isPresentNode(errorMessage);
  const disabledKeys = useMemo(
    () => options.filter((option) => option.isDisabled === true).map((option) => option.value),
    [options]
  );

  return (
    <AriaSelect<SelectOption>
      {...(selectedKey === undefined ? {} : { selectedKey })}
      {...(defaultValue === undefined ? {} : { defaultSelectedKey: defaultValue })}
      {...(name === undefined || !hasSelectedFormValue ? {} : { name })}
      {...(form === undefined ? {} : { form })}
      placeholder={placeholder}
      isDisabled={isDisabled || isEmpty}
      isRequired={isRequired}
      isInvalid={isInvalid}
      validationBehavior={validationBehavior}
      disabledKeys={disabledKeys}
      {...(isReadOnly || isEmpty ? { isOpen: false } : {})}
      data-om-component="select"
      data-om-size={size}
      data-om-disabled={isDisabled || isEmpty || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-required={isRequired || undefined}
      data-om-placeholder={selectedKey === null || selectedKey === undefined || undefined}
      className={joinClassNames("om-select", className) ?? "om-select"}
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Internal React Aria 1.19 bridge; OM exposes onValueChange instead.
      onSelectionChange={(nextKey) => {
        if (!isDisabled && !isReadOnly && !isEmpty) {
          setHasUncontrolledSelection(nextKey !== null);
          onValueChange?.(normalizeSelectionKey(nextKey));
        }
      }}
    >
      <AriaLabel
        data-om-component="select-label"
        data-om-required={isRequired || undefined}
        data-om-label-visibility={labelVisibility}
        className="om-select__label"
      >
        <span>{label}</span>
        {isRequired ? (
          <span className="om-select__required-marker" aria-hidden="true">
            *
          </span>
        ) : null}
      </AriaLabel>
      {description === undefined || description === null ? null : (
        <AriaText slot="description" className="om-select__description">
          {description}
        </AriaText>
      )}
      {isEmpty ? <span className="om-select__description">No options available</span> : null}
      <AriaButton
        ref={triggerRef}
        {...(id === undefined ? {} : { id })}
        autoFocus={autoFocus}
        {...(isReadOnly ? { "aria-readonly": true, "aria-disabled": true } : {})}
        {...(isInvalid ? { "aria-invalid": true } : {})}
        {...(isRequired ? { "aria-required": true } : {})}
        data-om-component="select-trigger"
        data-om-size={size}
        data-om-disabled={isDisabled || isEmpty || undefined}
        data-om-read-only={isReadOnly || undefined}
        data-om-invalid={isInvalid || undefined}
        data-om-required={isRequired || undefined}
        data-om-placeholder={selectedKey === null || selectedKey === undefined || undefined}
        className={joinClassNames("om-select__trigger", triggerClassName) ?? "om-select__trigger"}
      >
        <AriaSelectValue className="om-select__value" />
        <span className="om-select__indicator" aria-hidden="true">
          ▾
        </span>
      </AriaButton>
      {shouldRenderError ? (
        <AriaFieldError
          elementType="span"
          data-om-component="field-error"
          data-om-invalid="true"
          className="om-select__error"
        >
          {errorMessage}
        </AriaFieldError>
      ) : null}
      {isEmpty ? null : (
        <AriaPopover
          className={joinClassNames("om-select__popover", popoverClassName) ?? "om-select__popover"}
          placement="bottom start"
          offset={4}
        >
          <AriaListBox
            items={options}
            className={
              joinClassNames("om-select__listbox", listBoxClassName) ?? "om-select__listbox"
            }
          >
            {(option) => (
              <AriaListBoxItem
                id={option.value}
                textValue={option.label}
                {...(option.isDisabled === true ? { isDisabled: true } : {})}
                className="om-select__option"
                data-om-option-disabled={option.isDisabled ?? undefined}
              >
                <span className="om-select__option-check" aria-hidden="true" />
                <span className="om-select__option-content">
                  <span className="om-select__option-label">{option.label}</span>
                  {option.description === undefined ? null : (
                    <span className="om-select__option-description">{option.description}</span>
                  )}
                </span>
              </AriaListBoxItem>
            )}
          </AriaListBox>
        </AriaPopover>
      )}
    </AriaSelect>
  );
});

function normalizeSelectionKey(key: string | number | null): string | null {
  return typeof key === "string" ? key : null;
}

function getButtonRef(element: HTMLButtonElement | null): HTMLButtonElement {
  if (element === null) {
    throw new Error("Select trigger ref is unavailable.");
  }

  return element;
}

function isPresentNode(value: ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== "";
}
