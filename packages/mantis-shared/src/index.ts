// Barrel for @om/mantis-shared
export { default as config } from "./config";
export * from "./config";
export type { ConfigStates, ConfigContextValue } from "./types/config";
export type { PaletteThemeProps } from "./types/theme";
export type * from "./types/extended";
export { default as useConfig } from "./hooks/useConfig";
export { useLocalStorage } from "./hooks/useLocalStorage";
export { ConfigProvider, ConfigContext } from "./contexts/ConfigContext";
export * from "./utils/colorUtils";
export { default as getColors } from "./utils/getColors";
export { default as getShadow } from "./utils/getShadow";
