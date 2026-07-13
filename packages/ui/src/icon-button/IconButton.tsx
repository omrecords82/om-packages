import type { ReactNode } from "react";
import type { ButtonProps } from "../button/index.js";

import { forwardRef } from "react";

import { assertNonEmptyAccessibleLabel } from "../shared/class-names.js";
import { Button } from "../button/index.js";

export type IconButtonProps = Omit<ButtonProps, "children" | "accessibleLabel"> & {
  readonly icon: ReactNode;
  readonly accessibleLabel: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, accessibleLabel, className, ...buttonProps },
  ref
) {
  assertNonEmptyAccessibleLabel(accessibleLabel, "IconButton");

  return (
    <Button
      {...buttonProps}
      ref={ref}
      accessibleLabel={accessibleLabel}
      className={["om-icon-button", className].filter(Boolean).join(" ")}
    >
      <span className="om-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </Button>
  );
});
