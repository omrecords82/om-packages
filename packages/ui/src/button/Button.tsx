import type { ReactNode } from "react";
import type { ActionVariant, ComponentSize } from "../shared/types.js";

import { Fragment, forwardRef, useId } from "react";
import { Button as AriaButton } from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";

export type ButtonProps = {
  readonly children: ReactNode;
  readonly variant?: ActionVariant;
  readonly size?: ComponentSize;
  readonly type?: "button" | "submit" | "reset";
  readonly isDisabled?: boolean;
  readonly isPending?: boolean;
  readonly fullWidth?: boolean;
  readonly className?: string;
  readonly accessibleLabel?: string;
  readonly form?: string;
  readonly name?: string;
  readonly value?: string;
  readonly onAction?: () => void;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    type = "button",
    isDisabled = false,
    isPending = false,
    fullWidth = false,
    className,
    accessibleLabel,
    form,
    name,
    value,
    onAction
  },
  ref
) {
  const isUnavailable = isDisabled || isPending;
  const pendingStatusId = useId();

  return (
    <Fragment>
      <AriaButton
        ref={ref}
        type={type}
        {...(form === undefined ? {} : { form })}
        {...(name === undefined ? {} : { name })}
        {...(value === undefined ? {} : { value })}
        isDisabled={isDisabled}
        isPending={isPending}
        {...(accessibleLabel === undefined ? {} : { "aria-label": accessibleLabel })}
        {...(isPending ? { "aria-describedby": pendingStatusId } : {})}
        data-om-component="button"
        data-om-variant={variant}
        data-om-size={size}
        data-om-full-width={fullWidth || undefined}
        data-om-pending={isPending || undefined}
        className={joinClassNames("om-button", className) ?? "om-button"}
        onPress={() => {
          if (!isUnavailable) {
            onAction?.();
          }
        }}
      >
        <span className="om-button__content" data-om-pending-content={isPending || undefined}>
          {children}
        </span>
        {isPending ? (
          <span className="om-button__pending" aria-hidden="true">
            Pending
          </span>
        ) : null}
      </AriaButton>
      {isPending ? (
        <span id={pendingStatusId} role="status" className="om-sr-only">
          Pending
        </span>
      ) : null}
    </Fragment>
  );
});
