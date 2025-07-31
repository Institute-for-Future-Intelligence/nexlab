import { useState, useEffect } from 'react';
import { messageService, Message } from '../services/messageService';
import { useErrorHandler } from '../utils/errorHandling';
import { useNotificationStore } from '../stores/notificationStore';

export interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  deleteMessage: (id: string) => Promise<void>;
  togglePinMessage: (messageId: string, currentPinStatus: boolean) => Promise<void>;
  clearError: () => void;
}

export const useMessages = (): UseMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();
  const { showError, showSuccess } = useNotificationStore();

  useEffect(() => {
    // Try to load cached messages first
    const cachedMessages = messageService.getCachedMessages();
    if (cachedMessages) {
      setMessages(cachedMessages);
      setLoading(false);
    }

    // Subscribe to real-time updates
    const unsubscribe = messageService.subscribeToMessages((newMessages) => {
      setMessages(newMessages);
      setError(null);
      // Hide loading only if we didn't have cached messages
      if (!cachedMessages) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const deleteMessage = async (id: string): Promise<void> => {
    try {
      await messageService.deleteMessage(id);
      showSuccess('Message deleted successfully');
      // Real-time listener will update the UI automatically
    } catch (err) {
      const appError = handleError(err, { operation: 'delete_message', messageId: id });
      setError(appError.message);
      showError(appError);
    }
  };

  const togglePinMessage = async (messageId: string, currentPinStatus: boolean): Promise<void> => {
    try {
      await messageService.togglePinMessage(messageId, currentPinStatus);
      const action = currentPinStatus ? 'unpinned' : 'pinned';
      showSuccess(`Message ${action} successfully`);
      // Real-time listener will update the UI automatically
    } catch (err) {
      const appError = handleError(err, { 
        operation: 'toggle_pin_message', 
        messageId, 
        currentPinStatus 
      });
      setError(appError.message);
      showError(appError);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    deleteMessage,
    togglePinMessage,
    clearError
  };
}; 