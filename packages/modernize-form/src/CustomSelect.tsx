import type React from 'react';
'use client'

import { styled } from '@mui/material/styles';
import { Select } from '@mui/material';

const CustomSelect: React.ComponentType<any> = styled((props: any) => <Select {...props} />)(({ }) => ({}));

export default CustomSelect;
