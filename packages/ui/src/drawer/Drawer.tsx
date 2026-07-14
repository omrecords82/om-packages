import type { DrawerProps } from "../shared/drawer-types.js";

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
import { validateDrawerConfiguration } from "./drawer-validation.js";

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    title,
    description,
    children,
    footer,
    trigger,
    isOpen,
    defaultOpen,
    onOpenChange,
    placement = "end",
    size = "md",
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    hideCloseButton = false,
    closeLabel = "Close drawer",
    className,
    overlayClassName,
    surfaceClassName,
    bodyClassName,
    footerClassName
  },
  ref
) {
  const { placement: resolvedPlacement, size: resolvedSize } = validateDrawerConfiguration({
    trigger,
    isOpen,
    defaultOpen,
    isDismissable,
    isKeyboardDismissDisabled,
    hideCloseButton,
    placement,
    size
  });

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
      data-om-component="drawer-overlay"
      data-om-dismissible={isDismissable || undefined}
      data-om-keyboard-dismiss-disabled={isKeyboardDismissDisabled || undefined}
      className={joinClassNames("om-drawer__overlay", overlayClassName) ?? "om-drawer__overlay"}
    >
      <AriaModal
        ref={surfaceRef}
        data-om-component="drawer-surface"
        data-om-open={currentOpen || undefined}
        data-om-placement={resolvedPlacement}
        data-om-size={resolvedSize}
        className={joinClassNames("om-drawer__surface", surfaceClassName) ?? "om-drawer__surface"}
      >
        <AriaDialog
          role="dialog"
          {...(hasDescription ? { "aria-describedby": descriptionId } : {})}
          className={joinClassNames("om-drawer", className) ?? "om-drawer"}
        >
          {({ close }) => (
            <>
              <div className="om-drawer__header">
                <div className="om-drawer__heading">
                  <AriaHeading slot="title" className="om-drawer__title">
                    {title}
                  </AriaHeading>
                  {hasDescription ? (
                    <AriaText
                      id={descriptionId}
                      slot="description"
                      className="om-drawer__description"
                    >
                      {description}
                    </AriaText>
                  ) : null}
                </div>
                {hideCloseButton ? null : (
                  <IconButton
                    ref={closeRef}
                    accessibleLabel={closeLabel}
                    className="om-drawer__close"
                    icon={<span aria-hidden="true">×</span>}
                    onAction={close}
                    size="sm"
                    variant="quiet"
                  />
                )}
              </div>
              <div
                className={joinClassNames("om-drawer__body", bodyClassName) ?? "om-drawer__body"}
              >
                {children}
              </div>
              {isPresentNode(footer) ? (
                <div
                  className={
                    joinClassNames("om-drawer__footer", footerClassName) ?? "om-drawer__footer"
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
    throw new Error("Drawer surface ref is unavailable.");
  }

  return element;
}
