import type { ReactNode } from "react";

export type TabsOrientation = "horizontal" | "vertical";

export type TabsActivationMode = "automatic" | "manual";

export type TabsPanelMounting = "active" | "all";

export type TabItem = {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
  readonly isDisabled?: boolean;
};

export type TabsProps = {
  readonly accessibleLabel: string;
  readonly items: readonly TabItem[];
  readonly selectedId?: string | null;
  readonly defaultSelectedId?: string | null;
  readonly onSelectionChange?: (id: string) => void;
  readonly orientation?: TabsOrientation;
  readonly activationMode?: TabsActivationMode;
  readonly panelMounting?: TabsPanelMounting;
  readonly isDisabled?: boolean;
  readonly className?: string;
  readonly tabListClassName?: string;
  readonly tabClassName?: string;
  readonly panelClassName?: string;
};
