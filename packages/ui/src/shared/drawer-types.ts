import type { ReactElement, ReactNode } from "react";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type DrawerPlacement = "start" | "end" | "top" | "bottom";

export type DrawerSize = "sm" | "md" | "lg" | "xl";

export interface DrawerProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly trigger?: ReactElement;
  readonly isOpen?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (isOpen: boolean) => void;
  readonly placement?: DrawerPlacement;
  readonly size?: DrawerSize;
  readonly isDismissable?: boolean;
  readonly isKeyboardDismissDisabled?: boolean;
  readonly hideCloseButton?: boolean;
  readonly closeLabel?: string;
  readonly className?: string;
  readonly overlayClassName?: string;
  readonly surfaceClassName?: string;
  readonly bodyClassName?: string;
  readonly footerClassName?: string;
}
