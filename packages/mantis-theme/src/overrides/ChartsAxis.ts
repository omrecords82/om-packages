// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - CHART AXIS ||============================== //

export default function ChartsAxis(theme: Theme) {
  return {
    MuiChartsAxis: {
      styleOverrides: {
        root: {
          '& .MuiChartsAxis-line': {
            stroke: theme.vars.palette.grey[300],
            strokeWidth: 1
          },
          '& .MuiChartsAxis-tick': {
            stroke: theme.vars.palette.grey[300]
          },
          '&.MuiChartsAxis-directionX .MuiChartsAxis-tick': {
            stroke: theme.vars.palette.grey[300]
          },
          '&.MuiChartsAxis-directionY .MuiChartsAxis-tick': {
            stroke: theme.vars.palette.grey[300]
          },
          '& .MuiChartsAxis-tickLabel': {
            fontSize: 12,
            fill: theme.vars.palette.text.secondary
          }
        }
      }
    }
  };
}
