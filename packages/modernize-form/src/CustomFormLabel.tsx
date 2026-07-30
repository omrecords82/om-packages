import type React from 'react';
'use client'

import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

const CustomFormLabel: React.ComponentType<any> = styled((props: any) => (
  <Typography
    variant="subtitle1"
    fontWeight={600}
    {...props}
    component="label"
    htmlFor={props.htmlFor}
  />
))(() => ({
  marginBottom: '5px',
  marginTop: '25px',
  display: 'block',
}));

export default CustomFormLabel;
