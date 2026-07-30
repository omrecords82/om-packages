// material-ui
import { Theme } from '@mui/material/styles';
import { PaginationProps } from '@mui/material/Pagination';

// project imports
import { getColors } from '@om/mantis-shared';

// ==============================|| PAGINATION ITEM - COLORS ||============================== //

const PAGINATION_COLORS = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

function getColorStyle({ variant, color, theme }: { variant: PaginationProps['variant']; color: any; theme: Theme }) {
  const colors = getColors(theme, color);
  const { lighter, light, dark, main, contrastText } = colors;
  const focusStyle = {
    '&:focus-visible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2,
      ...(variant === 'text' && {
        backgroundColor: theme.vars.palette.background.paper
      })
    }
  };
  switch (variant) {
    case 'combined':
      return {
        borderColor: main,
        backgroundColor: lighter,
        '&:hover': {
          borderColor: light
        },
        ...focusStyle
      };
    case 'contained':
      return {
        color: contrastText,
        backgroundColor: main,
        '&:hover': {
          backgroundColor: light
        },
        ...focusStyle
      };
    case 'outlined':
      return {
        borderColor: main,
        '&:hover': {
          backgroundColor: lighter,
          borderColor: light
        },
        ...focusStyle
      };
    case 'text':
    default:
      return {
        color: main,
        '&:hover': {
          backgroundColor: main,
          color: lighter
        },
        ...focusStyle
      };
  }
}

function generateColorVariants(theme: Theme, variant: PaginationProps['variant']) {
  return PAGINATION_COLORS.reduce(
    (acc, color) => {
      acc[`&.MuiPaginationItem-color${color.charAt(0).toUpperCase() + color.slice(1)}`] = getColorStyle({ variant, color, theme });
      return acc;
    },
    {} as Record<string, any>
  );
}

// ==============================|| OVERRIDES - PAGINATION ITEM ||============================== //

export default function PaginationItem(theme: Theme) {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${theme.vars.palette.secondary.dark}`,
            outlineOffset: 2
          }
        },
        text: {
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            fontSize: '1rem',
            fontWeight: 500,
            ...generateColorVariants(theme, 'text')
          }
        },
        contained: {
          '&.Mui-selected': {
            ...generateColorVariants(theme, 'contained')
          }
        },
        combined: {
          border: '1px solid',
          borderColor: theme.vars.palette.divider,
          '&.MuiPaginationItem-ellipsis': {
            border: 'none'
          },
          '&.Mui-selected': {
            ...generateColorVariants(theme, 'combined')
          }
        },
        outlined: {
          borderColor: theme.vars.palette.divider,
          '&.Mui-selected': {
            backgroundColor: 'transparent',
            ...generateColorVariants(theme, 'outlined')
          }
        }
      }
    }
  };
}
