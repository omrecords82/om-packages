// material-ui
import { Theme } from '@mui/material/styles';

// project imports
import { getColors } from '@om/mantis-shared';

// types
import { ExtendedStyleProps } from '@om/mantis-shared/types/extended';

const CHIP_COLORS = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

// ==============================|| CHIP - COLORS ||============================== //

function getColor({ color, theme }: ExtendedStyleProps) {
  const colors = getColors(theme, color);
  const { dark } = colors;

  return {
    '&.Mui-focusVisible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2
    }
  };
}

function getColorStyle({ color, theme }: ExtendedStyleProps) {
  const colors = getColors(theme, color);
  const { light, lighter, main, darker } = colors;

  return {
    color: main,
    backgroundColor: lighter,
    borderColor: light,
    ...theme.applyStyles('dark', { color: darker }),
    '& .MuiChip-deleteIcon': {
      color: main,
      '&:hover': {
        color: light
      }
    }
  };
}

/**
 * Generate color variant styles for a given variant type
 * @param theme - MUI theme object
 * @param variantType - Type of variant ('root' or 'light' or 'combined')
 * @returns Object with color-specific selectors and their styles
 */
function generateColorVariants(theme: Theme, variantType: 'root' | 'light' | 'combined') {
  const styleBuilder = variantType === 'root' ? getColor : getColorStyle;

  return CHIP_COLORS.reduce(
    (acc, color) => {
      acc[`&.MuiChip-color${color.charAt(0).toUpperCase() + color.slice(1)}`] = styleBuilder({
        color: color as any,
        theme
      });
      return acc;
    },
    {} as Record<string, any>
  );
}

// ==============================|| OVERRIDES - CHIP ||============================== //

export default function Chip(theme: Theme) {
  const defaultLightChip = getColorStyle({ color: 'secondary', theme });
  const colorVariants = generateColorVariants(theme, 'light');

  return {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&:active': {
            boxShadow: 'none'
          },
          ...generateColorVariants(theme, 'root')
        },
        sizeLarge: {
          fontSize: '1rem',
          height: 40
        },
        light: {
          ...defaultLightChip,
          ...colorVariants
        },
        combined: {
          border: '1px solid',
          ...defaultLightChip,
          ...colorVariants
        }
      }
    }
  };
}
