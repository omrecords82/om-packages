import type { ReactElement, Ref } from "react";

export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export type TooltipDelay = "immediate" | "standard";

type TooltipElement = ReactElement<{
  readonly ref?: Ref<HTMLElement> | undefined;
  readonly className?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly isDisabled?: boolean | undefined;
  readonly accessibleLabel?: string | undefined;
  readonly "aria-label"?: string | undefined;
  readonly "aria-labelledby"?: string | undefined;
}>;

export type TooltipProps = {
  readonly trigger: TooltipElement;
  readonly content: string;
  readonly placement?: TooltipPlacement;
  readonly delay?: TooltipDelay;
  readonly isDisabled?: boolean;
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly showArrow?: boolean;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly tooltipClassName?: string;
  readonly arrowClassName?: string;
};
