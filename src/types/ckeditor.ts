// src/types/ckeditor.ts

/**
 * Comprehensive types for CKEditor integration
 * Based on actual usage patterns found in the codebase
 */

// CKEditor Editor instance type (covers the common methods we use)
export interface CKEditorInstance {
  getData: () => string;
  setData: (data: string) => void;
  model: {
    document: {
      selection: {
        getFirstPosition: () => CKEditorPosition; // CKEditor's internal position type
      };
    };
    change: (callback: (writer: CKEditorWriter) => void) => void;
  };
}

// CKEditor Position type (for cursor/selection positions)
export interface CKEditorPosition {
  path: number[];
  offset: number;
}

// CKEditor Writer type (for model changes)
export interface CKEditorWriter {
  insertText: (text: string, position: CKEditorPosition) => void; // CKEditor's internal position type
  // Add other writer methods as needed
}

// Event handler types for CKEditor - use library's actual types
export type CKEditorChangeHandler = (event: CKEditorEvent, editor: CKEditorInstance) => void;
export type CKEditorReadyHandler = (editor: CKEditorInstance) => void;

// CKEditor Event type
export interface CKEditorEvent {
  name: string;
  source: CKEditorInstance;
  [key: string]: unknown;
}

// Configuration type for CKEditor
export interface CKEditorConfig {
  toolbar?: string[];
  [key: string]: unknown; // CKEditor config accepts various types
}

// Props interfaces for our TextEditor components
export interface TextEditorProps {
  onChange: (data: string) => void;
  initialValue?: string;
}

export interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
} 