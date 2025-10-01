// src/components/LaboratoryNotebookV2/RichTextEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
  Box,
  Typography,
  IconButton,
  Popover,
  Tooltip,
  ButtonBase,
} from '@mui/material';
import { Functions as FunctionsIcon } from '@mui/icons-material';
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
  const [mathAnchor, setMathAnchor] = useState<HTMLButtonElement | null>(null);
  const [greekAnchor, setGreekAnchor] = useState<HTMLButtonElement | null>(null);
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

    // Close popovers and focus editor
    setMathAnchor(null);
    setGreekAnchor(null);
    editor.focus();
  };

  const handleMathOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMathAnchor(event.currentTarget);
    setGreekAnchor(null); // Close Greek if open
  };

  const handleGreekOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGreekAnchor(event.currentTarget);
    setMathAnchor(null); // Close Math if open
  };

  const handleClose = () => {
    setMathAnchor(null);
    setGreekAnchor(null);
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
          gap: spacing[1],
          mb: spacing[2],
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            mr: spacing[1],
          }}
        >
          Insert:
        </Typography>

        {/* Math Symbols Button */}
        <Tooltip title="Math Symbols" placement="top">
          <IconButton
            onClick={handleMathOpen}
            disabled={disabled}
            size="small"
            sx={{
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: borderRadius.md,
              backgroundColor: mathAnchor ? colors.primary[50] : colors.background.primary,
              '&:hover': {
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[400],
              },
            }}
          >
            <FunctionsIcon sx={{ fontSize: 18, color: colors.primary[600] }} />
          </IconButton>
        </Tooltip>

        {/* Greek Letters Button */}
        <Tooltip title="Greek Letters" placement="top">
          <IconButton
            onClick={handleGreekOpen}
            disabled={disabled}
            size="small"
            sx={{
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: borderRadius.md,
              backgroundColor: greekAnchor ? colors.primary[50] : colors.background.primary,
              fontWeight: typography.fontWeight.bold,
              fontSize: typography.fontSize.lg,
              color: colors.primary[600],
              '&:hover': {
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[400],
              },
            }}
          >
            Ω
          </IconButton>
        </Tooltip>
      </Box>

      {/* Math Symbols Popover */}
      <Popover
        open={Boolean(mathAnchor)}
        anchorEl={mathAnchor}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: borderRadius.lg,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            mt: spacing[1],
          },
        }}
      >
        <Box sx={{ p: spacing[2], maxWidth: 320 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[2],
            }}
          >
            Math Symbols
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: spacing[1],
            }}
          >
            {mathOperators.map((symbol) => (
              <ButtonBase
                key={symbol}
                onClick={() => insertSymbol(symbol)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.neutral[200]}`,
                  backgroundColor: colors.background.primary,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[400],
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {symbol}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Popover>

      {/* Greek Letters Popover */}
      <Popover
        open={Boolean(greekAnchor)}
        anchorEl={greekAnchor}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: borderRadius.lg,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            mt: spacing[1],
          },
        }}
      >
        <Box sx={{ p: spacing[2], maxWidth: 360 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: spacing[2],
            }}
          >
            Greek Letters
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: spacing[1],
            }}
          >
            {greekLetters.map((letter) => (
              <ButtonBase
                key={letter}
                onClick={() => insertSymbol(letter)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.neutral[200]}`,
                  backgroundColor: colors.background.primary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[400],
                    transform: 'scale(1.15)',
                  },
                }}
              >
                {letter}
              </ButtonBase>
            ))}
          </Box>
        </Box>
      </Popover>

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

