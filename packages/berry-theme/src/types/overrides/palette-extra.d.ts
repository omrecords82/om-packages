import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeText {
    dark: string;
    hint: string;
    heading: string;
  }
  interface Palette {
    orange: PaletteColor;
    dark: PaletteColor;
  }
  interface PaletteOptions {
    orange?: PaletteColorOptions;
    dark?: PaletteColorOptions;
  }
}
