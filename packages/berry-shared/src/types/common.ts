import type React from "react";
import type { FunctionComponent } from "react";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material/SvgIcon";

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string })
  | React.ComponentClass<any>
  | FunctionComponent<any>
  | any;

export interface GenericCardProps {
  title?: string;
  primary?: string | number | undefined;
  secondary?: string;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
}

export interface ColorProps {
  readonly [key: string]: string;
}
