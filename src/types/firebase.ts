// src/types/firebase.ts
import { FieldValue } from 'firebase/firestore';

/**
 * Comprehensive type for Firestore timestamp data
 * Handles all actual formats found in the codebase:
 * - Firestore Timestamp objects (has toDate method)
 * - Legacy plain objects (has seconds/nanoseconds)  
 * - FieldValue (when writing with serverTimestamp())
 */
export type FirebaseTimestamp = 
  | { toDate: () => Date }                           // Firestore Timestamp object
  | { seconds: number; nanoseconds: number }         // Legacy format
  | FieldValue                                       // When writing with serverTimestamp()
  | undefined;                                       // Optional field

/**
 * Helper function to safely format Firebase timestamps
 * Handles all timestamp formats consistently
 */
export const formatFirebaseTimestamp = (timestamp?: FirebaseTimestamp): string => {
  if (!timestamp) return 'No data available';
  
  // Firestore Timestamp object (most common)
  if (typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate().toLocaleString();
  }
  
  // Legacy format (plain object with seconds)
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  
  // FieldValue case (when writing)
  return 'N/A';
};

/**
 * Helper to check if timestamp has seconds format (for CSV export etc.)
 */
export const hasSecondsFormat = (timestamp?: FirebaseTimestamp): timestamp is { seconds: number; nanoseconds: number } => {
  return typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp;
};

/**
 * Helper to safely get Date from Firebase timestamp
 */
export const getDateFromTimestamp = (timestamp?: FirebaseTimestamp): Date | null => {
  if (!timestamp) return null;
  
  if (typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate();
  }
  
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return null;
}; 