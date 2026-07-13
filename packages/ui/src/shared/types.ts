import type { ReactNode } from "react";

export type ComponentSize = "sm" | "md" | "lg";

export type ActionVariant = "primary" | "secondary" | "quiet" | "destructive";

export type LinkVariant = "inline" | "standalone" | "quiet";

export type AccessibleChildren = {
  readonly children: ReactNode;
};
