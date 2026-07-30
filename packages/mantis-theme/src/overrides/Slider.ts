// material-ui
import { Theme } from '@mui/material/styles';

// project imports
import { getColors } from '@om/mantis-shared';

// types
import { ExtendedStyleProps } from '@om/mantis-shared/types/extended';

// ==============================|| OVERRIDES - TAB ||============================== //

function getColorStyle({ color, theme }: ExtendedStyleProps) {
  const colors = getColors(theme, color);
  const { main } = colors;

  return { border: '2px solid', borderColor: main };
}

export default function Slider(theme: Theme) {
  return {
    MuiSlider: {
      styleOverrides: {
        track: {
          height: '1px'
        },
        thumb: {
          width: 14,
          height: 14,
          border: '2px solid',
          borderColor: theme.vars.palette.primary.main,
          backgroundColor: theme.vars.palette.background.paper,
          variants: [
            { props: { color: 'primary' }, style: getColorStyle({ color: 'primary', theme }) },
            { props: { color: 'secondary' }, style: getColorStyle({ color: 'secondary', theme }) },
            { props: { color: 'success' }, style: getColorStyle({ color: 'success', theme }) },
            { props: { color: 'warning' }, style: getColorStyle({ color: 'warning', theme }) },
            { props: { color: 'info' }, style: getColorStyle({ color: 'info', theme }) },
            { props: { color: 'error' }, style: getColorStyle({ color: 'error', theme }) }
          ]
        },
        mark: {
          width: 4,
          height: 4,
          borderRadius: '50%',
          border: '1px solid',
          borderColor: theme.vars.palette.secondary.light,
          backgroundColor: theme.vars.palette.background.paper,
          '&.MuiSlider-markActive': {
            opacity: 1,
            borderColor: 'inherit',
            borderWidth: 2
          }
        },
        rail: {
          color: theme.vars.palette.secondary.light
        },
        root: {
          '&.Mui-disabled': {
            '.MuiSlider-rail': {
              opacity: 0.25
            },
            '.MuiSlider-track': {
              color: theme.vars.palette.secondary.lighter
            },
            '.MuiSlider-thumb': {
              border: '2px solid',
              borderColor: theme.vars.palette.secondary.lighter
            }
          }
        },
        valueLabel: {
          backgroundColor: theme.vars.palette.grey[600],
          color: theme.vars.palette.grey[0]
        }
      }
    }
  };
}
