import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  
  // Actions
  addNotification: (message: string, severity?: NotificationSeverity, autoHideDuration?: number) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Convenience methods
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],
      
      addNotification: (message, severity = 'info', autoHideDuration = 6000) => {
        const notification: Notification = {
          id: generateId(),
          message,
          severity,
          autoHideDuration,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          notifications: [...state.notifications, notification]
        }));
        
        // Auto-remove after duration
        if (autoHideDuration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, autoHideDuration);
        }
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(notification => notification.id !== id)
      })),
      
      clearAllNotifications: () => set({ notifications: [] }),
      
      // Convenience methods
      showSuccess: (message) => get().addNotification(message, 'success'),
      showError: (message) => get().addNotification(message, 'error', 8000),
      showWarning: (message) => get().addNotification(message, 'warning'),
      showInfo: (message) => get().addNotification(message, 'info'),
    })
  )
); 