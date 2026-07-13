import type { ReactElement, ReactNode } from "react";
import type { DialogSize } from "../shared/dialog-types.js";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Text as AriaText
} from "react-aria-components";

import { IconButton } from "../icon-button/IconButton.js";
import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/dialog-types.js";
import { validateDialogConfiguration } from "./dialog-validation.js";

export type DialogProps = {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly trigger?: ReactElement;
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly size?: DialogSize;
  readonly isDismissable?: boolean;
  readonly isKeyboardDismissDisabled?: boolean;
  readonly hideCloseButton?: boolean;
  readonly closeLabel?: string;
  readonly className?: string;
  readonly overlayClassName?: string;
  readonly surfaceClassName?: string;
  readonly bodyClassName?: string;
  readonly footerClassName?: string;
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    title,
    description,
    children,
    footer,
    trigger,
    isOpen,
    defaultOpen,
    onOpenChange,
    size = "md",
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    hideCloseButton = false,
    closeLabel = "Close dialog",
    className,
    overlayClassName,
    surfaceClassName,
    bodyClassName,
    footerClassName
  },
  ref
) {
  validateDialogConfiguration({ trigger, isOpen, defaultOpen });

  const surfaceRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();
  const hasDescription = isPresentNode(description);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen === true);
  const currentOpen = isOpen ?? uncontrolledOpen;
  useImperativeHandle(ref, () => getSurfaceRef(surfaceRef.current), []);

  useEffect(() => {
    if (!currentOpen) {
      return;
    }

    const focusTarget = hideCloseButton ? surfaceRef.current : closeRef.current;
    focusTarget?.focus();
  }, [currentOpen, hideCloseButton]);

  const handleOpenChange = (nextOpen: boolean): void => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const openProps = {
    ...(isOpen === undefined ? {} : { isOpen }),
    ...(defaultOpen === undefined ? {} : { defaultOpen }),
    onOpenChange: handleOpenChange
  };

  const overlay = (
    <AriaModalOverlay
      {...(trigger === undefined ? openProps : {})}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      data-om-component="dialog-overlay"
      data-om-dismissible={isDismissable || undefined}
      data-om-keyboard-dismiss-disabled={isKeyboardDismissDisabled || undefined}
      className={joinClassNames("om-dialog__overlay", overlayClassName) ?? "om-dialog__overlay"}
    >
      <AriaModal
        ref={surfaceRef}
        data-om-component="dialog-surface"
        data-om-size={size}
        className={joinClassNames("om-dialog__surface", surfaceClassName) ?? "om-dialog__surface"}
      >
        <AriaDialog
          role="dialog"
          {...(hasDescription ? { "aria-describedby": descriptionId } : {})}
          className={joinClassNames("om-dialog", className) ?? "om-dialog"}
        >
          {({ close }) => (
            <>
              <div className="om-dialog__header">
                <div className="om-dialog__heading">
                  <AriaHeading slot="title" className="om-dialog__title">
                    {title}
                  </AriaHeading>
                  {hasDescription ? (
                    <AriaText
                      id={descriptionId}
                      slot="description"
                      className="om-dialog__description"
                    >
                      {description}
                    </AriaText>
                  ) : null}
                </div>
                {hideCloseButton ? null : (
                  <IconButton
                    ref={closeRef}
                    accessibleLabel={closeLabel}
                    className="om-dialog__close"
                    icon={<span aria-hidden="true">×</span>}
                    onAction={close}
                    size="sm"
                    variant="quiet"
                  />
                )}
              </div>
              <div
                className={joinClassNames("om-dialog__body", bodyClassName) ?? "om-dialog__body"}
              >
                {children}
              </div>
              {isPresentNode(footer) ? (
                <div
                  className={
                    joinClassNames("om-dialog__footer", footerClassName) ?? "om-dialog__footer"
                  }
                >
                  {footer}
                </div>
              ) : null}
            </>
          )}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );

  if (trigger === undefined) {
    return overlay;
  }

  return (
    <AriaDialogTrigger {...openProps}>
      {trigger}
      {overlay}
    </AriaDialogTrigger>
  );
});

function getSurfaceRef(element: HTMLDivElement | null): HTMLDivElement {
  if (element === null) {
    throw new Error("Dialog surface ref is unavailable.");
  }

  return element;
}
