// src/types/events.ts
import { DocumentData } from 'firebase/firestore';
import { FirebaseTimestamp } from './firebase';

/**
 * Common event handler types for forms and UI interactions
 */

// Form submission events
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

// Generic form event handler  
export type FormEventHandler = (event: React.FormEvent) => void | Promise<void>;

/**
 * Firestore document data types
 * Provides type-safe access to common document structures
 */

// Design document from Firestore (based on usage in Dashboard/index.tsx)
export interface DesignDocumentData extends DocumentData {
  title: string;
  description: string;
  course: string;
  dateCreated: FirebaseTimestamp; // Properly typed timestamp
  dateModified: FirebaseTimestamp; // Properly typed timestamp
  userId: string;
  images: Array<{ url: string; title: string; path: string }>;
  files: Array<{ id: string; url: string; name: string; path: string }>;
  isAdmin?: boolean;
}

// Generic document data helper - provides fallback for unknown structures
export const getDocumentField = <T>(data: DocumentData, field: string, fallback: T): T => {
  return (data[field] as T) ?? fallback;
}; 