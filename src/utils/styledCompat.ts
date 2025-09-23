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
  (window as any).styled = muiStyled;
}

// Also ensure it's available in the global scope for module resolution
if (typeof global !== 'undefined') {
  (global as any).styled_default = muiStyled;
  (global as any).styled = muiStyled;
}
