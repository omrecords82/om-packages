import type { ReactNode } from "react";
import type { LabelVisibility } from "../shared/field-types.js";

import { forwardRef } from "react";
import { Label as AriaLabel } from "react-aria-components";

import { assertNonEmptyAccessibleLabel, joinClassNames } from "../shared/class-names.js";

export type LabelProps = {
  readonly children: ReactNode;
  readonly htmlFor?: string;
  readonly isRequired?: boolean;
  readonly visibility?: LabelVisibility;
  readonly className?: string;
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, htmlFor, isRequired = false, visibility = "visible", className },
  ref
) {
  if (typeof children === "string") {
    assertNonEmptyAccessibleLabel(children, "Label");
  }

  return (
    <AriaLabel
      ref={ref}
      {...(htmlFor === undefined ? {} : { htmlFor })}
      data-om-component="label"
      data-om-required={isRequired || undefined}
      data-om-label-visibility={visibility}
      className={joinClassNames("om-field__label", className) ?? "om-field__label"}
    >
      <span>{children}</span>
      {isRequired ? (
        <span className="om-field__required-marker" aria-hidden="true">
          *
        </span>
      ) : null}
    </AriaLabel>
  );
});
