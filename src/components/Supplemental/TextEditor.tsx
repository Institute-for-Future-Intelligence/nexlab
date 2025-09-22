import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { StandardTextEditorProps } from '../../types/textEditor';

const TextEditor: React.FC<StandardTextEditorProps> = ({ content, onChange }) => {
  const handleChange = (value: string) => {
    onChange(value);
  };

  // ReactQuill modules configuration - standard toolbar
  const modules = {
    toolbar: [
      ['undo', 'redo'],
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic'],
      ['blockquote', { 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
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
        minHeight: '150px'
      }}
    />
  );
};

export default TextEditor;