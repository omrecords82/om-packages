'use client';
import type React from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const CustomDisabledButton: React.ComponentType<React.ComponentProps<typeof Button>> = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100]
}));

export default CustomDisabledButton;
