import type { ReactNode } from "react";
import type { LinkVariant } from "../shared/types.js";

import { forwardRef } from "react";
import { Link as AriaLink } from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";

export type LinkProps = {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: LinkVariant;
  readonly isDisabled?: boolean;
  readonly target?: "_self" | "_blank" | "_parent" | "_top";
  readonly rel?: string;
  readonly download?: boolean | string;
  readonly className?: string;
  readonly accessibleLabel?: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    children,
    variant = "inline",
    isDisabled = false,
    target,
    rel,
    download,
    className,
    accessibleLabel
  },
  ref
) {
  const safeRel = target === "_blank" ? ensureSafeBlankRel(rel) : rel;

  return (
    <AriaLink
      ref={ref}
      {...(isDisabled ? {} : { href })}
      {...(target === undefined ? {} : { target })}
      {...(safeRel === undefined ? {} : { rel: safeRel })}
      {...(download === undefined ? {} : { download })}
      isDisabled={isDisabled}
      {...(accessibleLabel === undefined ? {} : { "aria-label": accessibleLabel })}
      aria-disabled={isDisabled || undefined}
      data-om-component="link"
      data-om-variant={variant}
      className={joinClassNames("om-link", className) ?? "om-link"}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </AriaLink>
  );
});

function ensureSafeBlankRel(rel: string | undefined): string {
  const values = new Set((rel ?? "").split(/\s+/u).filter(Boolean));
  values.add("noopener");
  values.add("noreferrer");
  return [...values].join(" ");
}
