// src/types/textEditor.ts

/**
 * Comprehensive types for ReactQuill text editor integration
 * Migrated from CKEditor to ReactQuill for license-free usage
 */

import ReactQuill from 'react-quill-new';

// ReactQuill Editor instance type (covers the common methods we use)
export interface ReactQuillInstance {
  getEditor: () => any;
  getEditingArea: () => Element;
  focus: () => void;
  blur: () => void;
}

// Quill Editor instance (the underlying Quill.js editor)
export interface QuillInstance {
  getText: (index?: number, length?: number) => string;
  getContents: (index?: number, length?: number) => any;
  setContents: (delta: any) => void;
  insertText: (index: number, text: string, formats?: any) => void;
  getSelection: (focus?: boolean) => { index: number; length: number } | null;
  setSelection: (index: number, length?: number) => void;
  focus: () => void;
  blur: () => void;
}

// Event handler types for ReactQuill
export type ReactQuillChangeHandler = (content: string, delta: any, source: string, editor: any) => void;
export type ReactQuillReadyHandler = (editor: QuillInstance) => void;

// Configuration type for ReactQuill
export interface ReactQuillConfig {
  modules?: {
    toolbar?: any;
    [key: string]: any;
  };
  formats?: string[];
  theme?: string;
  placeholder?: string;
  readOnly?: boolean;
  [key: string]: unknown;
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

export interface StandardTextEditorProps {
  content: string;
  onChange: (content: string) => void;
} 