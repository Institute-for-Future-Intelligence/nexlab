import { useState, useEffect } from 'react';
import { messageService, Message } from '../services/messageService';

export interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  deleteMessage: (id: string) => void;
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

  const deleteMessage = (id: string) => {
    // Optimistically update the UI
    setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
  };

  const clearError = () => {
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    deleteMessage,
    clearError
  };
}; 