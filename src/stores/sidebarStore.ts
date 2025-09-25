import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  messagesExpanded: boolean;
  setOpen: (open: boolean) => void;
  setMobile: (mobile: boolean) => void;
  toggleMessages: () => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isOpen: true,
      isMobile: false,
      messagesExpanded: false,
      
      setOpen: (open: boolean) => set({ isOpen: open }),
      
      setMobile: (mobile: boolean) => set({ isMobile: mobile }),
      
      toggleMessages: () => set((state) => ({ 
        messagesExpanded: !state.messagesExpanded 
      })),
      
      toggleSidebar: () => set((state) => ({ 
        isOpen: !state.isOpen 
      })),
    }),
    {
      name: 'nexlab-sidebar-storage',
      partialize: (state) => ({ 
        isOpen: state.isOpen,
        messagesExpanded: state.messagesExpanded 
      }),
    }
  )
);
