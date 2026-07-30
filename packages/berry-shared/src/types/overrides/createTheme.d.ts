import "@mui/material/styles";
import type { CustomShadowProps } from "../theme";

declare module "@mui/material/styles" {
  interface Theme {
    customShadows: CustomShadowProps;
  }

  interface ThemeOptions {
    customShadows?: CustomShadowProps;
  }

  interface ThemeVars {
    customShadows: CustomShadowProps;
    typography: Theme["typography"];
    transitions: Theme["transitions"];
  }
}
