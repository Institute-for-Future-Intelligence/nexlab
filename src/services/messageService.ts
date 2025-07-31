import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Unsubscribe,
  Firestore 
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
}

class FirestoreMessageService implements MessageService {
  private db: Firestore;
  private readonly cacheKey = 'messages';

  constructor() {
    this.db = getFirestore();
  }

  subscribeToMessages(callback: (messages: Message[]) => void): Unsubscribe {
    const q = query(
      collection(this.db, 'messages'), 
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
}

// Export singleton instance
export const messageService = new FirestoreMessageService(); 