import { useState, useEffect } from 'react';
import { messageService, Message } from '../services/messageService';

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
      // Real-time listener will update the UI automatically
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  };

  const togglePinMessage = async (messageId: string, currentPinStatus: boolean): Promise<void> => {
    try {
      await messageService.togglePinMessage(messageId, currentPinStatus);
      // Real-time listener will update the UI automatically
    } catch (err) {
      setError('Failed to update pin status');
      console.error('Error toggling pin status:', err);
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