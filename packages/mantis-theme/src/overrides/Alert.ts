// material-ui
import { Palette, PaletteColor, Theme } from '@mui/material/styles';
import { AlertProps } from '@mui/material/Alert';

// project imports
import { withAlpha } from '@om/mantis-shared';
import { getColors } from '@om/mantis-shared';

// types
import { ExtendedStyleProps } from '@om/mantis-shared/types/extended';

const ALERT_COLORS = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

// ==============================|| ALERT - COLORS ||============================== //

function getColorStyle({ color, theme }: ExtendedStyleProps) {
  const colors = getColors(theme, color);
  const { lighter, light, main } = colors;

  return {
    borderColor: withAlpha(light, 0.5),
    backgroundColor: lighter,
    '& .MuiAlert-icon': { color: main }
  };
}

/**
 * Generate color variant styles for border variant type
 * @param theme - MUI theme object
 * @returns Object with color-specific selectors and their styles
 */
function generateColorVariants(theme: Theme) {
  return ALERT_COLORS.reduce(
    (acc, color) => {
      acc[`&.MuiAlert-color${color.charAt(0).toUpperCase() + color.slice(1)}`] = getColorStyle({
        color: color as any,
        theme
      });
      return acc;
    },
    {} as Record<string, any>
  );
}

// ==============================|| OVERRIDES - ALERT ||============================== //

export default function Alert(theme: Theme) {
  const primaryDashed = getColorStyle({ color: 'primary', theme });

  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          color: theme.vars.palette.text.primary,
          fontSize: '0.875rem',
          variants: [
            {
              props: { variant: 'standard' },
              style: ({ ownerState }: { ownerState: AlertProps }) => {
                const paletteColor = theme.palette[ownerState.color as keyof Palette] as PaletteColor;
                return {
                  position: 'relative',
                  backgroundColor: paletteColor.lighter,
                  '& .MuiAlert-icon': {
                    color: paletteColor.main
                  },
                  ...theme.applyStyles('dark', {
                    backgroundColor: withAlpha(theme.vars.palette.background.default, 0.99),
                    '&:before': {
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      content: '""',
                      backgroundColor: paletteColor.main,
                      top: 0,
                      left: 0,
                      opacity: 0.05
                    }
                  })
                };
              }
            },
            {
              props: { variant: 'filled' },
              style: ({ ownerState }: { ownerState: AlertProps }) => {
                const paletteColor = theme.palette[ownerState.color as keyof Palette] as PaletteColor;
                return {
                  color: theme.vars.palette.grey[0],
                  backgroundColor: paletteColor.main,
                  ...theme.applyStyles('dark', {
                    backgroundColor: paletteColor.dark,
                    ...(ownerState.color === 'secondary' && { backgroundColor: paletteColor.main })
                  })
                };
              }
            }
          ]
        },
        icon: {
          fontSize: '1rem'
        },
        message: {
          padding: 0,
          marginTop: 3
        },
        border: {
          padding: '10px 16px',
          border: '1px solid',
          ...primaryDashed,
          ...generateColorVariants(theme)
        },
        action: {
          '& .MuiButton-root': {
            padding: 2,
            height: 'auto',
            fontSize: '0.75rem',
            marginTop: -2
          },
          '& .MuiIconButton-root': {
            width: 'auto',
            height: 'auto',
            padding: 2,
            marginRight: 6,
            '& .MuiSvgIcon-root': {
              fontSize: '1rem'
            }
          }
        }
      }
    }
  };
}
