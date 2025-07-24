// src/components/SimpleTextEditor.tsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({ content, onChange }) => {
  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    onChange(data);
  };

  return (
    <CKEditor
      editor={ClassicEditor as any}
      data={content}
      onChange={handleChange}
      config={{
        toolbar: [
          'heading', '|', 
          'bold', 'italic', '|', 
          'blockQuote', 'numberedList', 'bulletedList', '|',
          'link'
        ],

      }}
    />
  );
};

export default SimpleTextEditor;