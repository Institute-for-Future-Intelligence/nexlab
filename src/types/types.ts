// types.ts
import { Timestamp, FieldValue } from 'firebase/firestore';
import { DataAnalysisSection } from './dataAnalysis';

export interface NewDesign {
    title: string;
    description: string;
    course: string;
    dateCreated: FieldValue | Timestamp;
    dateModified: FieldValue | Timestamp;
    userId: string;
    images: Image[];
    files: FileDetails[];
    dataAnalysis?: DataAnalysisSection;
}

export interface Design {
  isAdmin?: boolean;
  id: string;
  title: string;
  course: string;
  description: string;
  dateCreated: FieldValue | Timestamp | null;
  dateModified: FieldValue | Timestamp | null;
  userId: string;
  images: Image[];
  files: FileDetails[];
  dataAnalysis?: DataAnalysisSection;
}

export interface Image {
  url: string;
  path: string;
  title: string;
  deleted?: boolean;
}

export interface FileDetails {
  id: string;
  url: string;
  name: string;
  path: string;
  deleted?: boolean;
}

// Utility functions
export const timestampToString = (timestamp: Timestamp | FieldValue | null): string => {
  return timestamp && timestamp instanceof Timestamp ? timestamp.toDate().toLocaleString() : '';
};