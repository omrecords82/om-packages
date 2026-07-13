import type { ReactNode } from "react";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  RadioButton as AriaRadioButton,
  RadioField as AriaRadioField,
  Text as AriaText
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/selection-types.js";

export type RadioProps = {
  readonly value: string;
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly isDisabled?: boolean;
  readonly className?: string;
  readonly controlClassName?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, children, description, isDisabled = false, className, controlClassName },
  ref
) {
  if (value.trim().length === 0) {
    throw new Error("Radio requires a non-empty value.");
  }

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => getInputRef(inputRef.current, "Radio"), []);

  return (
    <AriaRadioField
      value={value}
      isDisabled={isDisabled}
      inputRef={inputRef}
      data-om-component="radio"
      data-om-disabled={isDisabled || undefined}
      className={
        joinClassNames("om-selection-control om-radio", className) ??
        "om-selection-control om-radio"
      }
    >
      <AriaRadioButton
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
      </AriaRadioButton>
      {isPresentNode(description) ? (
        <AriaText slot="description" className="om-selection-control__description">
          {description}
        </AriaText>
      ) : null}
    </AriaRadioField>
  );
});

function getInputRef(element: HTMLInputElement | null, componentName: string): HTMLInputElement {
  if (element === null) {
    throw new Error(`${componentName} input ref is unavailable.`);
  }

  return element;
}
