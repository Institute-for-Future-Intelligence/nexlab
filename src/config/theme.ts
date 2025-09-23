import { createTheme, Theme } from '@mui/material/styles';
import { createDesignSystemTheme } from './designSystem';

export const appTheme: Theme = createTheme(createDesignSystemTheme());

export default appTheme; 