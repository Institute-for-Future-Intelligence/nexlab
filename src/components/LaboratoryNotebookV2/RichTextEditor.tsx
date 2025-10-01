// src/components/LaboratoryNotebookV2/RichTextEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';
import { QuillInstance } from '../../types/textEditor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = 200,
  disabled = false,
}) => {
  const [editorValue, setEditorValue] = useState<string>(DOMPurify.sanitize(value || ''));
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const quillRef = useRef<ReactQuill>(null);
  const isMounted = useRef(false);

  // Update editor when value prop changes
  useEffect(() => {
    if (isMounted.current) {
      const sanitized = DOMPurify.sanitize(value || '');
      if (sanitized !== editorValue) {
        setEditorValue(sanitized);
      }
    } else {
      isMounted.current = true;
    }
  }, [value]);

  const handleEditorChange = (content: string) => {
    const cleanData = DOMPurify.sanitize(content);
    setEditorValue(cleanData);
    onChange(cleanData);
  };

  const insertSymbol = (symbol: string) => {
    if (!quillRef.current) {
      console.warn('Editor not initialized');
      return;
    }

    const editor = quillRef.current.getEditor() as QuillInstance;
    const selection = editor.getSelection();

    if (selection) {
      // Insert at current cursor position
      editor.insertText(selection.index, symbol);
      // Move cursor after the inserted symbol
      editor.setSelection(selection.index + symbol.length);
    } else {
      // If no selection, append to the end
      const length = editor.getText().length;
      editor.insertText(length, symbol);
      editor.setSelection(length + symbol.length);
    }

    setSelectedSymbol('');
    editor.focus();
  };

  const handleSymbolChange = (event: SelectChangeEvent<string>) => {
    const symbol = event.target.value;
    if (symbol) {
      insertSymbol(symbol);
    }
  };

  const greekLetters = [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
    'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ',
    'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
  ];

  const mathOperators = [
    '°', '±', '×', '÷', '≈', '≠', '≤', '≥', '∞', '∑', '∫', '√',
    'π', 'Δ', '∂', '∇', '∈', '∉', '⊂', '⊃', '∩', '∪', '∅',
  ];

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'script',
    'indent',
    'blockquote',
    'code-block',
    'link',
  ];

  return (
    <Box>
      {/* Symbol Insertion Controls */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: spacing[2],
          mb: spacing[2],
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          Insert Symbols:
        </Typography>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={selectedSymbol}
            onChange={handleSymbolChange}
            displayEmpty
            disabled={disabled}
            sx={{
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.neutral[300],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[400],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[500],
              },
            }}
          >
            <MenuItem value="" disabled>
              Math
            </MenuItem>
            {mathOperators.map((op) => (
              <MenuItem key={op} value={op}>
                {op}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={selectedSymbol}
            onChange={handleSymbolChange}
            displayEmpty
            disabled={disabled}
            sx={{
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.neutral[300],
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[400],
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary[500],
              },
            }}
          >
            <MenuItem value="" disabled>
              Greek
            </MenuItem>
            {greekLetters.map((letter) => (
              <MenuItem key={letter} value={letter}>
                {letter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ReactQuill Editor */}
      <Box
        sx={{
          '& .quill': {
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.neutral[300]}`,
            backgroundColor: colors.background.primary,
          },
          '& .ql-toolbar': {
            borderTopLeftRadius: borderRadius.lg,
            borderTopRightRadius: borderRadius.lg,
            borderBottom: `1px solid ${colors.neutral[200]}`,
            backgroundColor: colors.background.secondary,
          },
          '& .ql-container': {
            borderBottomLeftRadius: borderRadius.lg,
            borderBottomRightRadius: borderRadius.lg,
            minHeight: `${minHeight}px`,
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.body,
          },
          '& .ql-editor': {
            minHeight: `${minHeight}px`,
            color: colors.text.primary,
          },
          '& .ql-editor.ql-blank::before': {
            color: colors.text.tertiary,
            fontStyle: 'normal',
          },
        }}
      >
        <ReactQuill
          ref={quillRef}
          value={editorValue}
          onChange={handleEditorChange}
          modules={modules}
          formats={formats}
          theme="snow"
          placeholder={placeholder}
          readOnly={disabled}
        />
      </Box>
    </Box>
  );
};

export default RichTextEditor;

