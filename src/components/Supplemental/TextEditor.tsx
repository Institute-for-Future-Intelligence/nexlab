// src/components/TextEditor.tsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ content, onChange }) => {
    // const handleOnReady = (editor: any) => {
    //     // Log available toolbar items
    //     const toolbarItems = editor.ui.componentFactory.names();
    //     console.log('Available toolbar items:', toolbarItems);

    //     // Log loaded plugins
    //     const loadedPlugins = editor.plugins._availablePlugins.keys();
    //     console.log('Loaded plugins:', Array.from(loadedPlugins));
    //     };

  return (
    <CKEditor
      editor={ClassicEditor}
      data={content}
      onChange={(event: any, editor: any) => {
        const data = editor.getData();
        onChange(data);
      }}
      // onReady={handleOnReady}
      config={{
        toolbar: [
          'undo', 'redo', '|',
          'heading', '|',
          'bold', 'italic', '|', 
          'blockQuote', 'numberedList', 'bulletedList', '|',
          'insertTable', 'link', '|' // Exclude 'imageUpload' from the array
        ],
      } as any}
    />
  );
};

export default TextEditor;