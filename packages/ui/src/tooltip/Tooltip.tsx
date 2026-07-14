import type { ReactElement, Ref } from "react";
import type { TooltipDelay, TooltipPlacement, TooltipProps } from "../shared/tooltip-types.js";

import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import { validateTooltipConfiguration } from "./tooltip-validation.js";

export const tooltipStandardDelayMs = 700;
export const tooltipImmediateDelayMs = 0;
export const tooltipCloseDelayMs = 120;
export const tooltipOffsetPx = 8;

type TriggerProps = {
  readonly ref?: Ref<HTMLElement> | undefined;
  readonly className?: string | undefined;
  readonly "data-om-component"?: string | undefined;
  readonly "data-om-disabled"?: boolean | undefined;
};

export const Tooltip = forwardRef<HTMLElement, TooltipProps>(function Tooltip(
  {
    trigger,
    content,
    placement = "top",
    delay = "standard",
    isDisabled = false,
    isOpen,
    defaultOpen,
    onOpenChange,
    showArrow = true,
    className,
    triggerClassName,
    tooltipClassName,
    arrowClassName
  },
  ref
) {
  validateTooltipConfiguration({ trigger, content, placement, delay });

  const triggerRef = useRef<HTMLElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isControlled = isOpen !== undefined;
  const controlledOpen = isOpen ?? false;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(Boolean(defaultOpen));
  const isTriggerUnavailable = isDisabled || isTriggerDisabled(trigger);
  const resolvedOpen = !isTriggerUnavailable && (isControlled ? controlledOpen : uncontrolledOpen);
  useImperativeHandle(ref, () => getTriggerRef(triggerRef.current), []);

  useEffect(() => {
    if (isTriggerUnavailable && isOpen === true) {
      onOpenChange?.(false);
    }
  }, [isTriggerUnavailable, isOpen, onOpenChange]);

  useEffect(
    () => () => {
      clearScheduledOpenChange(openTimerRef);
      clearScheduledOpenChange(closeTimerRef);
    },
    []
  );

  const requestOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isTriggerUnavailable && nextOpen) {
        return;
      }

      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, isTriggerUnavailable, onOpenChange]
  );

  const scheduleOpen = useCallback(() => {
    clearScheduledOpenChange(closeTimerRef);
    clearScheduledOpenChange(openTimerRef);
    const openDelay = toDelayMilliseconds(delay);
    if (openDelay === 0) {
      requestOpenChange(true);
      return;
    }

    openTimerRef.current = setTimeout(() => {
      requestOpenChange(true);
    }, openDelay);
  }, [delay, requestOpenChange]);

  const scheduleClose = useCallback(() => {
    clearScheduledOpenChange(openTimerRef);
    clearScheduledOpenChange(closeTimerRef);
    closeTimerRef.current = setTimeout(() => {
      requestOpenChange(false);
    }, tooltipCloseDelayMs);
  }, [requestOpenChange]);

  const triggerElement = cloneTooltipTrigger(trigger, {
    isDisabled,
    ref: triggerRef,
    triggerClassName
  });
  const rootClassName = joinClassNames("om-tooltip", className) ?? "om-tooltip";

  if (isTriggerUnavailable) {
    return (
      <span className={rootClassName} data-om-component="tooltip" data-om-disabled="true">
        {triggerElement}
      </span>
    );
  }

  return (
    <span
      className={rootClassName}
      data-om-component="tooltip"
      onBlur={() => {
        requestOpenChange(false);
      }}
      onFocus={() => {
        requestOpenChange(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          requestOpenChange(false);
        }
      }}
      onPointerEnter={() => {
        scheduleOpen();
      }}
      onPointerLeave={() => {
        scheduleClose();
      }}
    >
      <AriaTooltipTrigger
        isOpen={resolvedOpen}
        delay={toDelayMilliseconds(delay)}
        closeDelay={tooltipCloseDelayMs}
        onOpenChange={requestOpenChange}
      >
        {triggerElement}
        <AriaTooltip
          className={joinClassNames("om-tooltip__bubble", tooltipClassName) ?? "om-tooltip__bubble"}
          data-om-component="tooltip-bubble"
          data-om-placement={placement}
          data-om-delay={delay}
          data-om-arrow={showArrow ? true : undefined}
          offset={tooltipOffsetPx}
          placement={toAriaPlacement(placement)}
        >
          {showArrow ? (
            <OverlayArrow
              className={joinClassNames("om-tooltip__arrow", arrowClassName) ?? "om-tooltip__arrow"}
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 8 8">
                <path d="M0 0 L4 4 L8 0 Z" />
              </svg>
            </OverlayArrow>
          ) : null}
          <span className="om-tooltip__content">{content}</span>
        </AriaTooltip>
      </AriaTooltipTrigger>
    </span>
  );
});

function cloneTooltipTrigger(
  trigger: ReactElement,
  {
    isDisabled,
    ref,
    triggerClassName
  }: {
    readonly isDisabled: boolean;
    readonly ref: Ref<HTMLElement>;
    readonly triggerClassName?: string | undefined;
  }
): ReactElement {
  const typedTrigger = trigger as ReactElement<TriggerProps>;
  const originalRef = typedTrigger.props.ref;
  const className = joinClassNames(
    "om-tooltip__trigger",
    typedTrigger.props.className,
    triggerClassName
  );

  return cloneElement(typedTrigger, {
    ref: mergeRefs(originalRef, ref),
    ...(className === undefined ? {} : { className }),
    "data-om-component": "tooltip-trigger",
    ...(isDisabled ? { "data-om-disabled": true } : {})
  });
}

function clearScheduledOpenChange(timerRef: {
  current: ReturnType<typeof setTimeout> | null;
}): void {
  if (timerRef.current !== null) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

function mergeRefs<T>(...refs: readonly (Ref<T> | undefined)[]): Ref<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null && ref !== undefined) {
        ref.current = value;
      }
    }
  };
}

function toDelayMilliseconds(delay: TooltipDelay): number {
  switch (delay) {
    case "immediate":
      return tooltipImmediateDelayMs;
    case "standard":
      return tooltipStandardDelayMs;
  }
}

function toAriaPlacement(
  placement: TooltipPlacement
):
  | "top"
  | "top start"
  | "top end"
  | "bottom"
  | "bottom start"
  | "bottom end"
  | "left"
  | "left top"
  | "left bottom"
  | "right"
  | "right top"
  | "right bottom" {
  switch (placement) {
    case "top-start":
      return "top start";
    case "top-end":
      return "top end";
    case "bottom-start":
      return "bottom start";
    case "bottom-end":
      return "bottom end";
    case "left-start":
      return "left top";
    case "left-end":
      return "left bottom";
    case "right-start":
      return "right top";
    case "right-end":
      return "right bottom";
    case "top":
    case "bottom":
    case "left":
    case "right":
      return placement;
  }
}

function getTriggerRef(element: HTMLElement | null): HTMLElement {
  if (element === null) {
    throw new Error("Tooltip trigger ref is unavailable.");
  }

  return element;
}

function isTriggerDisabled(trigger: ReactElement): boolean {
  const props = trigger.props as {
    readonly disabled?: boolean;
    readonly isDisabled?: boolean;
  };
  return props.disabled === true || props.isDisabled === true;
}
