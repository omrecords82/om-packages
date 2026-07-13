import type { ReactElement, Ref } from "react";
import type { MenuEntry, MenuPlacement, MenuProps } from "../shared/menu-types.js";

import { cloneElement, forwardRef, useImperativeHandle, useRef } from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Separator as AriaSeparator
} from "react-aria-components";

import { joinClassNames } from "../shared/class-names.js";
import {
  getSafeRel,
  hasAvailableMenuItem,
  validateMenuEntries,
  validateMenuTrigger
} from "./menu-validation.js";

type TriggerProps = {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  readonly className?: string | undefined;
  readonly isDisabled?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly "aria-label"?: string | undefined;
  readonly "aria-disabled"?: boolean | undefined;
  readonly "data-om-component"?: string | undefined;
  readonly "data-om-disabled"?: boolean | undefined;
};

export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  {
    trigger,
    items,
    accessibleLabel,
    placement = "bottom-start",
    isOpen,
    defaultOpen,
    onOpenChange,
    onAction,
    isDisabled = false,
    className,
    triggerClassName,
    popoverClassName,
    menuClassName
  },
  ref
) {
  validateMenuEntries(items);
  validateMenuTrigger(trigger);

  const triggerRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => getTriggerRef(triggerRef.current), []);

  const hasAvailableItem = hasAvailableMenuItem(items);
  const isUnavailable = isDisabled || !hasAvailableItem;
  const triggerElement = cloneMenuTrigger(trigger, {
    accessibleLabel,
    isDisabled: isUnavailable,
    ref: triggerRef,
    triggerClassName
  });

  if (isUnavailable) {
    return (
      <span className={joinClassNames("om-menu", className) ?? "om-menu"}>{triggerElement}</span>
    );
  }

  return (
    <span className={joinClassNames("om-menu", className) ?? "om-menu"}>
      <AriaMenuTrigger
        {...(isOpen === undefined ? {} : { isOpen })}
        {...(defaultOpen === undefined ? {} : { defaultOpen })}
        {...(onOpenChange === undefined ? {} : { onOpenChange })}
      >
        {triggerElement}
        <AriaPopover
          data-om-component="menu-popover"
          data-om-placement={placement}
          className={joinClassNames("om-menu__popover", popoverClassName) ?? "om-menu__popover"}
          offset={4}
          placement={toAriaPlacement(placement)}
        >
          <AriaMenu className={joinClassNames("om-menu__list", menuClassName) ?? "om-menu__list"}>
            {items.map((item) => renderMenuEntry(item, onAction))}
          </AriaMenu>
        </AriaPopover>
      </AriaMenuTrigger>
    </span>
  );
});

function renderMenuEntry(
  item: MenuEntry,
  onAction: ((id: string) => void) | undefined
): ReactElement {
  if (item.type === "separator") {
    return (
      <AriaSeparator
        key={item.id}
        className="om-menu__separator"
        data-om-component="menu-separator"
        data-om-entry-type="separator"
      />
    );
  }

  const content = (
    <>
      <span className="om-menu__item-label">{item.label}</span>
      {item.description === undefined ? null : (
        <span className="om-menu__item-description">{item.description}</span>
      )}
    </>
  );

  if (item.type === "link") {
    const rel = getSafeRel(item);
    return (
      <AriaMenuItem
        key={item.id}
        id={item.id}
        textValue={item.label}
        href={item.href}
        {...(item.target === undefined ? {} : { target: item.target })}
        {...(rel === undefined ? {} : { rel })}
        {...(item.isDisabled === undefined ? {} : { isDisabled: item.isDisabled })}
        className="om-menu__item"
        data-om-component="menu-item"
        data-om-entry-type="link"
        data-om-disabled={item.isDisabled === true ? true : undefined}
      >
        {content}
      </AriaMenuItem>
    );
  }

  return (
    <AriaMenuItem
      key={item.id}
      id={item.id}
      textValue={item.label}
      {...(item.isDisabled === undefined ? {} : { isDisabled: item.isDisabled })}
      className="om-menu__item"
      data-om-component="menu-item"
      data-om-entry-type="action"
      data-om-disabled={item.isDisabled === true ? true : undefined}
      data-om-intent={item.intent ?? "default"}
      onAction={() => {
        if (item.isDisabled !== true) {
          onAction?.(item.id);
        }
      }}
    >
      {content}
    </AriaMenuItem>
  );
}

function cloneMenuTrigger(
  trigger: ReactElement,
  {
    accessibleLabel,
    isDisabled,
    ref,
    triggerClassName
  }: {
    readonly accessibleLabel?: string | undefined;
    readonly isDisabled: boolean;
    readonly ref: Ref<HTMLButtonElement>;
    readonly triggerClassName?: string | undefined;
  }
): ReactElement {
  const typedTrigger = trigger as ReactElement<TriggerProps>;
  const originalRef = typedTrigger.props.ref;
  const className = joinClassNames(
    "om-menu__trigger",
    typedTrigger.props.className,
    triggerClassName
  );
  return cloneElement(typedTrigger, {
    ref: mergeRefs(originalRef, ref),
    ...(className === undefined ? {} : { className }),
    ...(accessibleLabel === undefined ? {} : { "aria-label": accessibleLabel }),
    ...(isDisabled ? { "aria-disabled": true, disabled: true, isDisabled: true } : {}),
    "data-om-component": "menu-trigger",
    ...(isDisabled ? { "data-om-disabled": true } : {})
  });
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

function toAriaPlacement(
  placement: MenuPlacement
): "bottom start" | "bottom end" | "top start" | "top end" {
  switch (placement) {
    case "bottom-end":
      return "bottom end";
    case "top-start":
      return "top start";
    case "top-end":
      return "top end";
    case "bottom-start":
      return "bottom start";
  }
}

function getTriggerRef(element: HTMLButtonElement | null): HTMLButtonElement {
  if (element === null) {
    throw new Error("Menu trigger ref is unavailable.");
  }

  return element;
}
