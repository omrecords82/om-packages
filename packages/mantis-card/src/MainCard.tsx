import { CSSProperties, ReactNode, Ref } from "react";

import { useColorScheme } from "@mui/material/styles";
import Card, { CardProps } from "@mui/material/Card";
import CardContent, { CardContentProps } from "@mui/material/CardContent";
import CardHeader, { CardHeaderProps } from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";

export interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactNode;
  subheader?: ReactNode | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps["sx"];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps["sx"];
  secondary?: CardHeaderProps["action"];
  shadow?: string;
  elevation?: number;
  title?: ReactNode | string;
  modal?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLDivElement>;
}

/** Mantis MainCard without demo Highlighter chrome. */
export default function MainCard({
  border = true,
  boxShadow,
  children,
  subheader,
  content = true,
  contentSX = {},
  darkTitle,
  divider = true,
  elevation,
  secondary,
  shadow,
  sx = {},
  title,
  modal = false,
  ref,
  ...others
}: MainCardProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Card
      elevation={elevation || 0}
      sx={(theme) => ({
        position: "relative",
        ...(border && { border: `1px solid ${theme.vars.palette.grey["A800"]}` }),
        borderRadius: 1,
        boxShadow: boxShadow && !border ? shadow || theme.vars.customShadows.z1 : "inherit",
        ":hover": { boxShadow: boxShadow ? shadow || theme.vars.customShadows.z1 : "inherit" },
        ...(colorScheme === "dark" && {
          borderColor: theme.vars.palette.divider,
          boxShadow: shadow || theme.vars.customShadows.z1,
          ":hover": { boxShadow: shadow || theme.vars.customShadows.z1 },
        }),
        ...(modal && {
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: `calc(100% - 50px)`, sm: "auto" },
          maxWidth: 768,
        }),
        ...(typeof sx === "function" ? sx(theme) : sx || {}),
      })}
      ref={ref}
      {...others}
    >
      {title && (
        <CardHeader
          sx={{ p: 2.5 }}
          slotProps={{
            title: { variant: darkTitle ? "h4" : "subtitle1" },
            action: { sx: { m: "0px auto", alignSelf: "center" } },
          }}
          title={title}
          action={secondary}
          subheader={subheader}
        />
      )}

      {title && divider && <Divider />}

      {content && (
        <CardContent
          sx={contentSX}
          {...(modal && {
            slotProps: {
              root: {
                sx: { overflowY: "auto", minHeight: "auto", maxHeight: `calc(100vh - 200px)` },
              },
            },
          })}
        >
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
}
