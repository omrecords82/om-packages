import type { ReactElement, Ref } from "react";

export type MenuItemIntent = "default" | "destructive";

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export type MenuActionItem = {
  readonly type: "action";
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
  readonly intent?: MenuItemIntent;
};

export type MenuLinkItem = {
  readonly type: "link";
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly href: string;
  readonly target?: "_self" | "_blank" | "_parent" | "_top";
  readonly rel?: string;
  readonly isDisabled?: boolean;
};

export type MenuSeparator = {
  readonly type: "separator";
  readonly id: string;
};

export type MenuEntry = MenuActionItem | MenuLinkItem | MenuSeparator;

export type MenuTriggerElement = ReactElement<{
  readonly ref?: Ref<HTMLButtonElement> | undefined;
  readonly className?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly isDisabled?: boolean | undefined;
  readonly accessibleLabel?: string | undefined;
  readonly "aria-label"?: string | undefined;
}>;

export type MenuProps = {
  readonly trigger: MenuTriggerElement;
  readonly items: readonly MenuEntry[];
  readonly accessibleLabel?: string;
  readonly placement?: MenuPlacement;
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly onAction?: (id: string) => void;
  readonly isDisabled?: boolean;
  readonly className?: string;
  readonly triggerClassName?: string;
  readonly popoverClassName?: string;
  readonly menuClassName?: string;
};
