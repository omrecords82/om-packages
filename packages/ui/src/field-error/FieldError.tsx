import type { ReactNode } from "react";

import { forwardRef } from "react";

import { joinClassNames } from "../shared/class-names.js";

export type FieldErrorProps = {
  readonly children?: ReactNode;
  readonly className?: string;
  readonly id?: string;
};

export const FieldError = forwardRef<HTMLElement, FieldErrorProps>(function FieldError(
  { children, className, id },
  ref
) {
  if (children === undefined || children === null || children === false || children === "") {
    return null;
  }

  return (
    <span
      ref={ref}
      {...(id === undefined ? {} : { id })}
      role="alert"
      data-om-component="field-error"
      data-om-invalid="true"
      className={joinClassNames("om-field__error", className) ?? "om-field__error"}
    >
      {children}
    </span>
  );
});
