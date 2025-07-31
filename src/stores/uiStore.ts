import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  // Loading states
  globalLoading: boolean;
  pageLoading: { [page: string]: boolean };
  
  // Modal/Dialog states
  openDialogs: { [dialogId: string]: boolean };
  
  // Navigation state
  currentPage: string;
  previousPage: string | null;
  
  // Navigation sections (collapsible)
  navigationSections: {
    educatorExpanded: boolean;
    superAdminExpanded: boolean;
  };
  
  // Layout preferences
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (page: string, loading: boolean) => void;
  
  openDialog: (dialogId: string) => void;
  closeDialog: (dialogId: string) => void;
  toggleDialog: (dialogId: string) => void;
  isDialogOpen: (dialogId: string) => boolean;
  
  setCurrentPage: (page: string) => void;
  
  // Navigation section actions
  toggleEducatorSection: () => void;
  toggleSuperAdminSection: () => void;
  setEducatorSectionExpanded: (expanded: boolean) => void;
  setSuperAdminSectionExpanded: (expanded: boolean) => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        globalLoading: false,
        pageLoading: {},
        openDialogs: {},
        currentPage: '/',
        previousPage: null,
        navigationSections: {
          educatorExpanded: false, // Start collapsed to reduce clutter
          superAdminExpanded: false,
        },
        sidebarCollapsed: false,
        theme: 'light',
        
        // Loading actions
        setGlobalLoading: (loading) => set({ globalLoading: loading }),
        setPageLoading: (page, loading) => set((state) => ({
          pageLoading: { ...state.pageLoading, [page]: loading }
        })),
        
        // Dialog actions
        openDialog: (dialogId) => set((state) => ({
          openDialogs: { ...state.openDialogs, [dialogId]: true }
        })),
        closeDialog: (dialogId) => set((state) => ({
          openDialogs: { ...state.openDialogs, [dialogId]: false }
        })),
        toggleDialog: (dialogId) => set((state) => ({
          openDialogs: { ...state.openDialogs, [dialogId]: !state.openDialogs[dialogId] }
        })),
        isDialogOpen: (dialogId) => !!get().openDialogs[dialogId],
        
        // Navigation actions
        setCurrentPage: (page) => set((state) => ({
          currentPage: page,
          previousPage: state.currentPage
        })),
        
        // Navigation section actions
        toggleEducatorSection: () => set((state) => ({
          navigationSections: {
            ...state.navigationSections,
            educatorExpanded: !state.navigationSections.educatorExpanded
          }
        })),
        toggleSuperAdminSection: () => set((state) => ({
          navigationSections: {
            ...state.navigationSections,
            superAdminExpanded: !state.navigationSections.superAdminExpanded
          }
        })),
        setEducatorSectionExpanded: (expanded) => set((state) => ({
          navigationSections: {
            ...state.navigationSections,
            educatorExpanded: expanded
          }
        })),
        setSuperAdminSectionExpanded: (expanded) => set((state) => ({
          navigationSections: {
            ...state.navigationSections,
            superAdminExpanded: expanded
          }
        })),
        
        // Layout actions
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      }),
      {
        name: 'ui-preferences',
        partialize: (state) => ({ 
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
          navigationSections: state.navigationSections
        })
      }
    )
  )
); 