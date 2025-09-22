import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';

import { 
  TextEditorProps,
  QuillInstance
} from '../../types/textEditor';

const TextEditor: React.FC<TextEditorProps> = ({ onChange, initialValue }) => {
  const [editorData, setEditorData] = useState<string>(DOMPurify.sanitize(initialValue || ''));
  const isMounted = useRef(false);
  const quillRef = useRef<ReactQuill>(null);

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  
  // Effect for initializing and responding to changes in initialValue
  useEffect(() => {
    if (isMounted.current) {
      setEditorData(DOMPurify.sanitize(initialValue || ''));
    } else {
      isMounted.current = true;
    }
  }, [initialValue]);

  const handleEditorChange = (content: string, delta: any, source: string, editor: any) => {
    const cleanData = DOMPurify.sanitize(content);
    setEditorData(cleanData);
    onChange(cleanData);
  };

  const insertSymbol = (symbol: string) => {
    if (!quillRef.current) {
      console.warn("Editor not initialized");
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
    
    setSelectedSymbol("");
    editor.focus();
  };

  const handleSymbolChange = (event: SelectChangeEvent<string>) => {
    insertSymbol(event.target.value as string);
  };

  const greekLetters = [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 
    'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'
  ];

  const mathOperators = [
    '°', '+', '-', '=', '~', '≥', '≤', '≠', '>', '<', '*', '/', '%'
  ];

  // ReactQuill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', { 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic',
    'list',
    'blockquote', 'indent',
    'link'
  ];

  return (
    <div>
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginBottom: 2,
      }}>
        <InputLabel id="insert-symbols-label" sx={{ fontSize: '0.8rem' }}>Insert Symbols: </InputLabel>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 40 }}>
          <Select
            labelId="math-operators-label"
            id="math-operators"
            value={selectedSymbol}
            onChange={handleSymbolChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Math</MenuItem>
            {mathOperators.map(op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 40 }}>
          <Select
            labelId="greek-letters-label"
            id="greek-letters"
            value={selectedSymbol}
            onChange={handleSymbolChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Greek</MenuItem>
            {greekLetters.map(letter => (
                <MenuItem key={letter} value={letter}>{letter}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {/* ReactQuill instance */}
      <ReactQuill
        ref={quillRef}
        value={editorData}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        theme="snow"
        placeholder="Start writing..."
        style={{
          backgroundColor: 'white',
          borderRadius: '4px',
          minHeight: '200px'
        }}
      />
    </div>
  );
}

export default TextEditor;