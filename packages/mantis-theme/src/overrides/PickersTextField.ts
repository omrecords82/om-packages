// material-ui
import { Theme } from '@mui/material/styles';

// project imports
import { getColors } from '@om/mantis-shared';
import { getShadow } from '@om/mantis-shared';

// types
import { ColorProps } from '@om/mantis-shared/types/extended';
import { PickersTextFieldProps } from '@mui/x-date-pickers';

interface Props {
  variant: ColorProps;
  theme: Theme;
}

// ==============================|| OVERRIDES - INPUT BORDER & SHADOWS ||============================== //

function getColor({ variant, theme }: Props) {
  const colors = getColors(theme, variant);
  const { light } = colors;

  const shadows = getShadow(theme, `${variant}`);

  return {
    '&:hover .MuiPickersOutlinedInput-notchedOutline': { borderColor: light },
    '&.Mui-focused': { boxShadow: shadows, '& .MuiPickersOutlinedInput-notchedOutline': { border: '1px solid', borderColor: light } }
  };
}

// ==============================|| OVERRIDES - PICKERS TEXT FIELD ||============================== //

export default function PickersTextField(theme: Theme) {
  return {
    MuiPickersTextField: {
      defaultProps: {
        variant: 'outlined',
        color: 'primary'
      },
      styleOverrides: {
        root: {
          '& .MuiPickersInputBase-sectionsContainer': {
            padding: '10.5px 14px 10.5px 0px'
          },
          '& .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: theme.vars.palette.grey[300],
            ...theme.applyStyles('dark', { borderColor: theme.vars.palette.grey[200] })
          },
          variants: [
            {
              props: { variant: 'outlined' },
              style: ({ color }: PickersTextFieldProps) => {
                return {
                  '& .MuiPickersInputBase-root': {
                    ...getColor({ variant: color, theme })
                  }
                };
              }
            },
            {
              props: { size: 'small' },
              style: {
                '& .MuiPickersInputBase-sectionsContainer': {
                  padding: '7.5px 8px 7.5px 0px'
                }
              }
            }
          ]
        }
      }
    }
  };
}
