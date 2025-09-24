import { useMediaQuery, useTheme } from '@mui/material';
import { useSidebarStore } from '../stores/sidebarStore';

export const useSidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarStore = useSidebarStore();

  return {
    ...sidebarStore,
    isMobile,
  };
};
