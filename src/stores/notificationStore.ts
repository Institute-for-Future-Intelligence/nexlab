import { create } from 'zustand';
import { AppError, ErrorType } from '../utils/errorHandling';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  error?: AppError;
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Enhanced methods for error handling
  showError: (error: AppError, actions?: NotificationAction[]) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const getErrorTypeIcon = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return '🌐';
    case ErrorType.AUTHENTICATION:
      return '🔒';
    case ErrorType.AUTHORIZATION:
      return '⛔';
    case ErrorType.VALIDATION:
      return '⚠️';
    case ErrorType.NOT_FOUND:
      return '🔍';
    case ErrorType.SERVER_ERROR:
      return '🚨';
    default:
      return '❌';
  }
};

const getErrorTypeDuration = (errorType: ErrorType): number => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 8000; // Longer for network errors (user might retry)
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
      return 10000; // Longer for auth errors (important)
    case ErrorType.VALIDATION:
      return 6000; // Standard for validation
    case ErrorType.NOT_FOUND:
      return 5000; // Shorter for not found
    default:
      return 7000; // Default duration
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  showError: (error, actions) => {
    const errorIcon = getErrorTypeIcon(error.type);
    const duration = getErrorTypeDuration(error.type);
    
    // Create retry action for network errors
    const defaultActions: NotificationAction[] = [];
    if (error.type === ErrorType.NETWORK) {
      defaultActions.push({
        label: 'Retry',
        action: () => {
          // This would be handled by the calling component
          console.log('Retry requested for:', error);
        },
        primary: true
      });
    }

    get().addNotification({
      type: 'error',
      title: `${errorIcon} ${error.type.replace('_', ' ')} Error`,
      message: error.message,
      duration,
      actions: actions || defaultActions,
      error
    });
  },

  showSuccess: (message, title) => {
    get().addNotification({
      type: 'success',
      title: title || '✅ Success',
      message,
      duration: 4000
    });
  },

  showWarning: (message, title) => {
    get().addNotification({
      type: 'warning',
      title: title || '⚠️ Warning',
      message,
      duration: 6000
    });
  },

  showInfo: (message, title) => {
    get().addNotification({
      type: 'info',
      title: title || 'ℹ️ Info',
      message,
      duration: 5000
    });
  }
})); 