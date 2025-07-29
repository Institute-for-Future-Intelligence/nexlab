// src/components/TextEditor.tsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
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
          'undo', 'redo', '|',
          'heading', '|',
          'bold', 'italic', '|', 
          'blockQuote', 'numberedList', 'bulletedList', '|',
          'insertTable', 'link', '|' // Exclude 'imageUpload' from the array
        ],
      }}
    />
  );
};

export default TextEditor;