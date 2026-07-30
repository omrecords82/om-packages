// material-ui
import MuiGlobalStyles from '@mui/material/GlobalStyles';

// ==============================|| THEME - GLOBAL STYLE ||============================== //

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        // tap highlight color
        '*': {
          WebkitTapHighlightColor: `transparent`
        },

        // apex-chart custom style
        '.apexcharts-canvas': {
          '.apexcharts-legend-series': {
            gap: theme.spacing(1)
          },
          '.apexcharts-tooltip-marker': {
            marginBottom: 2
          },
          '.apexcharts-tooltip-series-group': {
            '&.apexcharts-active, &:last-child': {
              paddingBottom: 0
            }
          },
          '.apexcharts-toolbar': {
            '.apexcharts-menu-icon, .apexcharts-reset-icon, .apexcharts-zoom-icon, .apexcharts-zoomin-icon, .apexcharts-zoomout-icon': {
              svg: {
                fill: theme.vars.palette.text.secondary
              },
              '&.apexcharts-selected svg': {
                fill: `${theme.vars.palette.primary.main} !important`
              }
            },
            '.apexcharts-pan-icon': {
              svg: {
                stroke: theme.vars.palette.text.secondary
              },
              '&.apexcharts-selected svg': {
                stroke: theme.vars.palette.primary.main
              },
              '&:hover:not(.apexcharts-selected) svg': {
                stroke: theme.vars.palette.primary.main
              }
            },
            'div:hover:not(.apexcharts-selected):not(.apexcharts-pan-icon) svg': {
              fill: theme.vars.palette.grey[600]
            }
          }
        },

        // apexchart custom class
        '.tooltip-light': {
          '.apexcharts-tooltip, .apexcharts-tooltip *': { color: '#fff' }
        },

        // apex-chart dark mode
        [theme.getColorSchemeSelector('dark')]: {
          '.apexcharts-menu': {
            background: `${theme.vars.palette.background.default} !important`,
            borderColor: theme.vars.palette.grey[200]
          },
          '.apexcharts-menu-item:hover': {
            backgroundColor: theme.vars.palette.divider
          }
        }
      })}
    />
  );
}
