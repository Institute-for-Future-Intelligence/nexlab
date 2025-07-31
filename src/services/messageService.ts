import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Unsubscribe,
  Firestore,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

export interface Message {
  id: string;
  title: string;
  description: string;
  postedOn: any; // Firebase timestamp
  lastUpdatedOn?: any; // Firebase timestamp
  author: string;
  course: string;
  isPinned?: boolean;
  links: { title: string; url: string }[];
  [key: string]: any; // For additional fields
}

export interface MessageService {
  subscribeToMessages: (callback: (messages: Message[]) => void) => Unsubscribe;
  getCachedMessages: () => Message[] | null;
  setCachedMessages: (messages: Message[]) => void;
  clearCache: () => void;
  togglePinMessage: (messageId: string, currentPinStatus: boolean) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

class FirestoreMessageService implements MessageService {
  private db: Firestore | null = null;
  private readonly cacheKey = 'messages';

  constructor() {
    // Do nothing - lazy initialization
  }

  private initialize() {
    if (!this.db) {
      // Import Firebase config to ensure initialization
      import('../config/firestore');
      this.db = getFirestore();
    }
  }

  subscribeToMessages(callback: (messages: Message[]) => void): Unsubscribe {
    this.initialize();
    const q = query(
      collection(this.db!, 'messages'), 
      orderBy('postedOn', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      
      // Update callback with new messages
      callback(messagesList);
      
      // Update cache
      this.setCachedMessages(messagesList);
    }, (error) => {
      console.error('Error listening to messages:', error);
      // Try to use cached messages on error
      const cachedMessages = this.getCachedMessages();
      if (cachedMessages) {
        callback(cachedMessages);
      }
    });
  }

  getCachedMessages(): Message[] | null {
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached messages:', error);
      return null;
    }
  }

  setCachedMessages(messages: Message[]): void {
    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  clearCache(): void {
    try {
      sessionStorage.removeItem(this.cacheKey);
    } catch (error) {
      console.error('Error clearing message cache:', error);
    }
  }

  async togglePinMessage(messageId: string, currentPinStatus: boolean): Promise<void> {
    this.initialize();
    try {
      const messageRef = doc(this.db!, 'messages', messageId);
      await updateDoc(messageRef, { 
        isPinned: !currentPinStatus 
      });
    } catch (error) {
      console.error('Error toggling pin status:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const messageService = new FirestoreMessageService(); 