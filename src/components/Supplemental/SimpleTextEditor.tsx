import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { SimpleTextEditorProps } from '../../types/textEditor';

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({ content, onChange }) => {
  const handleChange = (value: string) => {
    onChange(value);
  };

  // ReactQuill modules configuration - minimal toolbar
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic'],
      ['blockquote', { 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic',
    'blockquote', 'list', 'bullet',
    'link'
  ];

  return (
    <ReactQuill
      value={content}
      onChange={handleChange}
      modules={modules}
      formats={formats}
      theme="snow"
      placeholder="Start writing..."
      style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        minHeight: '120px'
      }}
    />
  );
};

export default SimpleTextEditor;