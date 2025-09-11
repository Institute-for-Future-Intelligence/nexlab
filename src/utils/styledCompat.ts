/**
 * Styled compatibility layer for React 19 + MUI
 * This helps resolve the styled_default is not a function error
 */

import { styled as muiStyled } from '@mui/material/styles';

// Re-export the styled function to ensure proper module resolution
export const styled = muiStyled;
export default muiStyled;

// Ensure the styled function is available globally if needed
if (typeof window !== 'undefined') {
  (window as any).styled_default = muiStyled;
}
