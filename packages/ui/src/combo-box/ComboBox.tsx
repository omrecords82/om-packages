import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  FieldError as AriaFieldError,
  Input as AriaInput,
  Label as AriaLabel,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import type { ComboBoxOption, ComboBoxProps } from "../shared/combo-box-types.js";
import { createComboBoxFilter } from "./combo-box-filter.js";
import {
  getKnownSelectedValue,
  getSelectedOptionLabel,
  sanitizeComboBoxOptions,
  validateComboBoxConfiguration,
  warnUnknownControlledValue,
  warnUnknownDefaultValue
} from "./combo-box-validation.js";

const defaultNoResultsMessage = "No options found";
const triggerLabel = "Show options";

export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(function ComboBox(
  {
    label,
    labelVisibility = "visible",
    options,
    selectedValue,
    defaultSelectedValue,
    onSelectedValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    filterMode,
    placeholder,
    description,
    errorMessage,
    noResultsMessage = defaultNoResultsMessage,
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
    inputClassName,
    triggerClassName,
    popoverClassName,
    listBoxClassName
  },
  ref
) {
  const resolvedFilterMode = validateComboBoxConfiguration({
    label,
    noResultsMessage,
    filterMode
  });
  const validOptions = sanitizeComboBoxOptions(options);

  warnUnknownControlledValue(selectedValue, validOptions);
  warnUnknownDefaultValue(defaultSelectedValue, validOptions);

  const selectedKey = getKnownSelectedValue(selectedValue, validOptions);
  const defaultSelectedKey = getKnownSelectedValue(defaultSelectedValue, validOptions);
  const currentSelectionValue = selectedValue === undefined ? defaultSelectedValue : selectedValue;
  const currentSelectionLabel = getSelectedOptionLabel(currentSelectionValue, validOptions) ?? "";
  const [internalInputValue, setInternalInputValue] = useState(
    defaultInputValue ?? currentSelectionLabel
  );

  const [isOpen, setIsOpen] = useState(false);
  const currentInputValue = inputValue ?? internalInputValue;
  const filteredOptions = useMemo(
    () =>
      validOptions.filter((option) =>
        createComboBoxFilter(resolvedFilterMode)(option.label, currentInputValue)
      ),
    [currentInputValue, resolvedFilterMode, validOptions]
  );

  useEffect(() => {
    if (inputValue !== undefined || selectedValue === undefined) {
      return;
    }

    setInternalInputValue(currentSelectionLabel);
  }, [currentSelectionLabel, inputValue, selectedValue]);

  const handleSelectionChange = useCallback(
    (nextKey: string | number | null) => {
      if (isDisabled || isReadOnly) {
        return;
      }

      const nextValue = typeof nextKey === "string" ? nextKey : null;
      const nextLabel = getSelectedOptionLabel(nextValue, validOptions) ?? "";
      onSelectedValueChange?.(nextValue);
      if (inputValue === undefined) {
        setInternalInputValue(nextLabel);
      } else {
        onInputValueChange?.(nextLabel);
      }
    },
    [inputValue, isDisabled, isReadOnly, onInputValueChange, onSelectedValueChange, validOptions]
  );

  const handleInputChange = useCallback(
    (nextValue: string) => {
      if (isDisabled || isReadOnly) {
        return;
      }

      if (inputValue === undefined) {
        setInternalInputValue(nextValue);
      }
      onInputValueChange?.(nextValue);
    },
    [inputValue, isDisabled, isReadOnly, onInputValueChange]
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setIsOpen(nextOpen);
  }, []);

  const resolvedNoResultsMessage =
    noResultsMessage.trim().length > 0 ? noResultsMessage : defaultNoResultsMessage;

  return (
    <AriaComboBox<ComboBoxOption>
      {...(selectedValue === undefined ? {} : { selectedKey: selectedKey ?? null })}
      {...(defaultSelectedValue === undefined
        ? {}
        : { defaultSelectedKey: defaultSelectedKey ?? null })}
      {...(inputValue === undefined ? {} : { inputValue })}
      {...(defaultInputValue === undefined ? {} : { defaultInputValue })}
      {...(name === undefined ? {} : { name })}
      {...(form === undefined ? {} : { form })}
      {...(id === undefined ? {} : { id })}
      items={validOptions}
      defaultFilter={createComboBoxFilter(resolvedFilterMode)}
      allowsCustomValue={false}
      allowsEmptyCollection
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      validationBehavior={validationBehavior}
      autoFocus={autoFocus}
      className={joinClassNames("om-field om-combo-box", className) ?? "om-field om-combo-box"}
      data-om-component="combo-box"
      data-om-size={size}
      data-om-open={isOpen ? true : undefined}
      data-om-disabled={isDisabled || undefined}
      data-om-read-only={isReadOnly || undefined}
      data-om-invalid={isInvalid || undefined}
      data-om-required={isRequired || undefined}
      data-om-filter-mode={resolvedFilterMode}
      data-om-empty-options={validOptions.length === 0 || undefined}
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- Internal React Aria 1.19 bridge; OM exposes onSelectedValueChange instead.
      onSelectionChange={handleSelectionChange}
      onInputChange={handleInputChange}
      onOpenChange={handleOpenChange}
    >
      <AriaLabel
        data-om-component="combo-box-label"
        data-om-label-visibility={labelVisibility}
        className="om-combo-box__label"
      >
        <span>{label}</span>
        {isRequired ? (
          <span className="om-combo-box__required-marker" aria-hidden="true">
            *
          </span>
        ) : null}
      </AriaLabel>
      <div className="om-combo-box__control" data-om-component="combo-box-control">
        <AriaInput
          ref={ref}
          className={joinClassNames("om-combo-box__input", inputClassName) ?? "om-combo-box__input"}
          {...(placeholder === undefined ? {} : { placeholder })}
        />
        <AriaButton
          type="button"
          className={
            joinClassNames("om-combo-box__trigger", triggerClassName) ?? "om-combo-box__trigger"
          }
          isDisabled={isDisabled || isReadOnly}
          aria-label={triggerLabel}
          data-om-component="combo-box-trigger"
        >
          <span className="om-combo-box__indicator" aria-hidden="true">
            ▾
          </span>
        </AriaButton>
      </div>
      {description === undefined || description === null ? null : (
        <AriaText slot="description" className="om-combo-box__description">
          {description}
        </AriaText>
      )}
      {isInvalid && errorMessage !== undefined && errorMessage !== null ? (
        <AriaFieldError
          elementType="span"
          data-om-component="field-error"
          data-om-invalid="true"
          className="om-combo-box__error"
        >
          {errorMessage}
        </AriaFieldError>
      ) : null}
      <AriaPopover
        className={
          joinClassNames("om-combo-box__popover", popoverClassName) ?? "om-combo-box__popover"
        }
        data-om-component="combo-box-popover"
        offset={4}
        placement="bottom start"
      >
        {filteredOptions.length === 0 ? (
          <div className="om-combo-box__no-results" data-om-empty-results="true" role="status">
            {resolvedNoResultsMessage}
          </div>
        ) : (
          <AriaListBox<ComboBoxOption>
            items={filteredOptions}
            className={
              joinClassNames("om-combo-box__listbox", listBoxClassName) ?? "om-combo-box__listbox"
            }
          >
            {(option) => (
              <AriaListBoxItem<ComboBoxOption>
                key={option.value}
                id={option.value}
                textValue={option.label}
                {...(option.isDisabled === true ? { isDisabled: true } : {})}
                className="om-combo-box__option"
                data-om-component="combo-box-option"
                data-om-option-disabled={option.isDisabled ?? undefined}
              >
                <span className="om-combo-box__option-check" aria-hidden="true" />
                <span className="om-combo-box__option-content">
                  <span className="om-combo-box__option-label">{option.label}</span>
                  {option.description === undefined ? null : (
                    <span className="om-combo-box__option-description">{option.description}</span>
                  )}
                </span>
              </AriaListBoxItem>
            )}
          </AriaListBox>
        )}
      </AriaPopover>
    </AriaComboBox>
  );
});
