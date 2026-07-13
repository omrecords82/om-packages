import type { ReactElement, ReactNode } from "react";
import type {
  AlertDialogConfirmBehavior,
  AlertDialogInitialFocus,
  AlertDialogIntent,
  DialogSize
} from "../shared/dialog-types.js";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Text as AriaText
} from "react-aria-components";

import { Button } from "../button/Button.js";
import { joinClassNames } from "../shared/class-names.js";
import { isPresentNode } from "../shared/dialog-types.js";
import { validateAlertDialogConfiguration } from "./alert-dialog-validation.js";

export type AlertDialogProps = {
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly children?: ReactNode;
  readonly trigger?: ReactElement;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly intent?: AlertDialogIntent;
  readonly initialFocus?: AlertDialogInitialFocus;
  readonly confirmBehavior?: AlertDialogConfirmBehavior;
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly onConfirm: () => void;
  readonly onCancel?: () => void;
  readonly isConfirmDisabled?: boolean;
  readonly isConfirmPending?: boolean;
  readonly size?: DialogSize;
  readonly className?: string;
  readonly overlayClassName?: string;
  readonly surfaceClassName?: string;
  readonly bodyClassName?: string;
  readonly actionsClassName?: string;
};

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(function AlertDialog(
  {
    title,
    description,
    children,
    trigger,
    confirmLabel,
    cancelLabel = "Cancel",
    intent = "confirmation",
    initialFocus = "cancel",
    confirmBehavior = "close",
    isOpen,
    defaultOpen,
    onOpenChange,
    onConfirm,
    onCancel,
    isConfirmDisabled = false,
    isConfirmPending = false,
    size = "md",
    className,
    overlayClassName,
    surfaceClassName,
    bodyClassName,
    actionsClassName
  },
  ref
) {
  validateAlertDialogConfiguration({ confirmLabel, cancelLabel, description });

  const surfaceRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const suppressCancelRef = useRef(false);
  const descriptionId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen === true);
  const currentOpen = isOpen ?? uncontrolledOpen;

  useImperativeHandle(ref, () => getSurfaceRef(surfaceRef.current), []);

  useEffect(() => {
    if (!currentOpen || isConfirmPending) {
      return;
    }

    const focusTarget = initialFocus === "confirm" ? confirmRef.current : cancelRef.current;
    focusTarget?.focus();
  }, [currentOpen, initialFocus, isConfirmPending]);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen && isConfirmPending) {
      onOpenChange?.(true);
      return;
    }

    if (!nextOpen && !suppressCancelRef.current) {
      onCancel?.();
    }

    suppressCancelRef.current = false;
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
      isDismissable={false}
      isKeyboardDismissDisabled={isConfirmPending}
      data-om-component="alert-dialog-overlay"
      data-om-confirm-pending={isConfirmPending || undefined}
      className={
        joinClassNames("om-dialog__overlay", "om-alert-dialog__overlay", overlayClassName) ??
        "om-dialog__overlay om-alert-dialog__overlay"
      }
    >
      <AriaModal
        ref={surfaceRef}
        data-om-component="alert-dialog-surface"
        data-om-size={size}
        data-om-intent={intent}
        data-om-confirm-pending={isConfirmPending || undefined}
        data-om-initial-focus={initialFocus}
        className={
          joinClassNames("om-dialog__surface", "om-alert-dialog__surface", surfaceClassName) ??
          "om-dialog__surface om-alert-dialog__surface"
        }
      >
        <AriaDialog
          role="alertdialog"
          aria-describedby={descriptionId}
          className={
            joinClassNames("om-dialog", "om-alert-dialog", className) ?? "om-dialog om-alert-dialog"
          }
        >
          {({ close }) => (
            <>
              <div className="om-dialog__header">
                <div className="om-dialog__heading">
                  <AriaHeading slot="title" className="om-dialog__title">
                    {title}
                  </AriaHeading>
                  <AriaText
                    id={descriptionId}
                    slot="description"
                    className="om-dialog__description"
                  >
                    {description}
                  </AriaText>
                </div>
                <span className="om-alert-dialog__intent" aria-hidden="true" />
              </div>
              {isPresentNode(children) ? (
                <div
                  className={
                    joinClassNames("om-dialog__body", "om-alert-dialog__body", bodyClassName) ??
                    "om-dialog__body om-alert-dialog__body"
                  }
                >
                  {children}
                </div>
              ) : null}
              <div
                className={
                  joinClassNames(
                    "om-dialog__footer",
                    "om-alert-dialog__actions",
                    actionsClassName
                  ) ?? "om-dialog__footer om-alert-dialog__actions"
                }
              >
                <Button
                  ref={cancelRef}
                  className="om-alert-dialog__cancel"
                  isDisabled={isConfirmPending}
                  onAction={() => {
                    if (isConfirmPending) {
                      return;
                    }
                    onCancel?.();
                    suppressCancelRef.current = true;
                    close();
                  }}
                  variant="secondary"
                >
                  {cancelLabel}
                </Button>
                <Button
                  ref={confirmRef}
                  className="om-alert-dialog__confirm"
                  isDisabled={isConfirmDisabled || isConfirmPending}
                  isPending={isConfirmPending}
                  onAction={() => {
                    if (isConfirmDisabled || isConfirmPending) {
                      return;
                    }
                    onConfirm();
                    if (confirmBehavior === "close") {
                      suppressCancelRef.current = true;
                      close();
                    }
                  }}
                  variant={intent === "destructive" ? "destructive" : "primary"}
                >
                  {confirmLabel}
                </Button>
              </div>
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
    throw new Error("AlertDialog surface ref is unavailable.");
  }

  return element;
}
