// src/types/dashboard.ts
import { FirebaseTimestamp } from './firebase';
import { Image, FileDetails } from './types';
import { DataAnalysisSection } from './dataAnalysis';

/**
 * Types for Dashboard Edit component
 * Based on actual usage patterns for builds, tests, and update operations
 */

// Build data structure (from Firestore)
export interface Build {
  id: string;
  title: string;
  description: string;
  design_ID: string;
  dateCreated: FirebaseTimestamp;
  dateModified: FirebaseTimestamp;
  userId: string;
  images: Image[];
  files: FileDetails[];
  dataAnalysis?: DataAnalysisSection;
}

// Test data structure (from Firestore)  
export interface Test {
  id: string;
  title: string;
  description: string;
  results: string;
  conclusions: string;
  build_ID: string;
  design_ID: string;
  dateCreated: FirebaseTimestamp;
  dateModified: FirebaseTimestamp;
  userId: string;
  images: Image[];
  files: FileDetails[];
  dataAnalysis?: DataAnalysisSection;
}

// Update objects for partial updates
export interface BuildUpdateData {
  title?: string;
  description?: string;
  images?: Array<{ url: string; title: string; path: string }>;
  files?: Array<{ id: string; url: string; name: string; path: string }>;
}

export interface TestUpdateData {
  title?: string;
  description?: string;
  results?: string;
  conclusions?: string;
  images?: Array<{ url: string; title: string; path: string }>;
  files?: Array<{ id: string; url: string; name: string; path: string }>;
}

// State management types for the Edit component
export interface EditableContentState {
  [id: string]: string;
}

export interface VisibilityState {
  [id: string]: boolean;
}

export interface CollapsedState {
  [buildId: string]: boolean;
}

export interface TestsByBuildState {
  [buildId: string]: Test[];
}

export interface ImagesByTestState {
  [testId: string]: Image[];
}

export interface FilesByTestState {
  [testId: string]: FileDetails[];
}

// Snackbar severity type
export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info'; 