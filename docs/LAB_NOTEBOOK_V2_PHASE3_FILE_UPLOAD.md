# Laboratory Notebook V2 - Phase 3: File Upload and Attachment

## Overview
Phase 3 implements comprehensive file upload, management, and display functionality for Laboratory Notebook V2. Users can attach various file types (PDFs, Word docs, Excel sheets, data files, etc.) to designs, builds, and tests.

## What Was Implemented

### 1. **FileUploadSection Component** (`src/components/LaboratoryNotebookV2/FileUploadSection.tsx`)

#### Features:
- **Multi-file upload** - Upload multiple files simultaneously
- **File type validation** - Optional restrictions on allowed file types
- **File size validation** - Configurable max file size (default 10MB)
- **Firebase Storage integration** - Unique UUID-based filenames
- **Progress tracking** - Real-time upload progress for each file
- **File deletion** - Remove files from both UI and Storage
- **Smart file icons** - Different icons for PDFs, Word docs, Excel, code files, etc.
- **Empty state** - Clear messaging when no files are attached
- **Error handling** - User-friendly error messages

#### Supported File Types:
- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Spreadsheets**: XLS, XLSX, CSV
- **Code**: JSON, XML, HTML, CSS, JS, TS
- **Archives**: ZIP, RAR, 7Z
- **Any other file type** with generic icon

#### Technical Details:
```typescript
interface FileUploadSectionProps {
  files: FileDetails[];
  onFilesChange: (files: FileDetails[]) => void;
  storagePath: string;
  disabled?: boolean;
  maxFileSize?: number; // in MB
  allowedTypes?: string[]; // MIME types or extensions
}
```

#### Key Functions:
- `validateFile()` - Validates file size and type
- `getFileIcon()` - Returns appropriate icon based on file extension
- `formatFileSize()` - Converts bytes to human-readable format
- `handleFileUpload()` - Manages upload process with progress tracking
- `handleDeleteFile()` - Removes file from Storage and state

### 2. **FileAttachmentsList Component** (`src/components/LaboratoryNotebookV2/FileAttachmentsList.tsx`)

#### Features:
- **Read-only file display** - For DetailPanel views
- **Click to open** - Opens file in new tab
- **Download button** - Direct download link
- **Open in new tab button** - Preview in browser (works well for PDFs)
- **File type icons** - Visual indication of file type
- **Empty state** - When no files are attached
- **Hover effects** - Visual feedback on interaction

#### User Interactions:
- **Click file name/row** → Opens file in new tab
- **Click open icon** → Opens file in new tab (same as above)
- **Click download icon** → Downloads file

### 3. **Integration into Panels**

#### EditPanel & ExpandedEditPanel
- File upload section added after image upload section
- Files are loaded from node data on panel open
- Files persist to Firestore when user saves
- Upload disabled during form submission
- 10MB max file size enforced

#### DetailPanel & ExpandedDetailPanel
- File attachments list displays all files
- Files shown with appropriate icons
- Click any file to open/download
- Shows file count in section header

## Firebase Storage Structure

Files are stored with the following paths:

```
/designs/{designId}/files/{timestamp}_{uuid}.{ext}
/builds/{buildId}/files/{timestamp}_{uuid}.{ext}
/tests/{testId}/files/{timestamp}_{uuid}.{ext}
```

**Example:**
```
/designs/abc123/files/1735689234567_a1b2c3d4-e5f6.pdf
/builds/def456/files/1735689334891_b2c3d4e5-f6g7.xlsx
/tests/ghi789/files/1735689445678_c3d4e5f6-g7h8.csv
```

## Firestore Data Structure

Files are stored as arrays in Firestore documents:

```typescript
interface FileDetails {
  id: string;        // Unique identifier for the file
  url: string;       // Firebase Storage download URL
  name: string;      // Original filename
  path: string;      // Firebase Storage path for deletion
}

// In Firestore documents
{
  // ... other fields
  files: [
    {
      id: "uuid-1234",
      url: "https://firebasestorage.googleapis.com/...",
      name: "experimental-data.csv",
      path: "designs/abc123/files/1735689234567_uuid.csv"
    }
  ]
}
```

## Component Architecture (Best Practices)

### 1. **Modularity**
- Separate components for upload (edit mode) and display (read mode)
- Utility functions extracted for reusability (`getFileIcon`, `formatFileSize`)
- Clear separation of concerns

### 2. **Scalability**
- Configurable file size limits and allowed types
- Supports unlimited file types via extension mapping
- Easy to add new file type icons

### 3. **Maintainability**
- Well-documented code with clear comments
- TypeScript interfaces for type safety
- Consistent naming conventions
- Error handling at every level

### 4. **React Best Practices**
- `useCallback` for memoized validation function
- Proper state management with controlled components
- Clean component lifecycle with useEffect
- Proper event handling and cleanup

### 5. **User Experience**
- Real-time progress indicators
- Clear error messages
- Visual feedback (hover states, transitions)
- Accessible tooltips
- Empty states with helpful messaging

## Testing Checklist

### File Upload Testing
- [ ] Upload single file to design
- [ ] Upload multiple files at once (3-5 files)
- [ ] Upload PDF and verify correct icon
- [ ] Upload Excel/CSV and verify correct icon
- [ ] Upload Word doc and verify correct icon
- [ ] Upload code file (JSON, JS) and verify correct icon
- [ ] Upload archive (ZIP) and verify correct icon
- [ ] Try uploading file larger than 10MB - verify error
- [ ] Delete individual files
- [ ] Verify files persist after save
- [ ] Verify files persist after page refresh

### Build & Test File Upload
- [ ] Upload files to a build
- [ ] Upload files to a test
- [ ] Verify each entity has separate storage paths

### Panel Navigation
- [ ] EditPanel → upload file → save → verify shows in DetailPanel
- [ ] ExpandedEditPanel → upload file → save → verify persistence
- [ ] Click fullscreen in EditPanel → verify files transfer to expanded view
- [ ] Upload in expanded view → minimize → verify files retained

### File Display (Read-only)
- [ ] View files in DetailPanel
- [ ] View files in ExpandedDetailPanel
- [ ] Click file name to open in new tab
- [ ] Click download button to download file
- [ ] Click open button to open in new tab
- [ ] Verify PDF opens for preview in browser
- [ ] Verify correct file type icons display

### Error Handling
- [ ] Upload unsupported file type (if restrictions enabled)
- [ ] Upload file exceeding size limit
- [ ] Test network failure during upload
- [ ] Delete file that doesn't exist
- [ ] Verify error messages are user-friendly

### Validation Testing
- [ ] File size validation works correctly
- [ ] File type validation works (if enabled)
- [ ] Multiple validation errors handled gracefully

### Concurrent Operations
- [ ] Upload multiple files simultaneously
- [ ] Upload files while form submitting (should be disabled)
- [ ] Delete file while another is uploading

## Firebase Configuration

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Laboratory Notebook V2 file paths
    match /designs/{designId}/files/{filename} {
      allow read, write: if request.auth != null;
    }
    match /builds/{buildId}/files/{filename} {
      allow read, write: if request.auth != null;
    }
    match /tests/{testId}/files/{filename} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firestore Security Rules
Ensure `files` array field can be written:
```javascript
match /designs/{designId} {
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && request.resource.data.files is list;
}
// Similar for /builds and /tests
```

## Known Limitations

1. **No batch operations** - Files must be deleted individually
2. **No file preview for all types** - Only PDFs and images preview well in browser
3. **No file versioning** - Uploading same filename creates new file with UUID
4. **Storage cleanup on delete** - Manual verification recommended (implemented in service layer)
5. **Max file size** - Default 10MB (configurable, but be mindful of costs)

## Code Quality Metrics

### Component Sizes:
- **FileUploadSection**: ~385 lines (modular, single responsibility)
- **FileAttachmentsList**: ~170 lines (simple, focused)

### TypeScript Coverage:
- ✅ Full type safety with interfaces
- ✅ No `any` types (except for utility functions where appropriate)
- ✅ Proper null/undefined handling

### Performance:
- ✅ Memoized validation function with `useCallback`
- ✅ Efficient re-renders (controlled components)
- ✅ Progress tracking doesn't block UI

### Accessibility:
- ✅ Semantic HTML
- ✅ ARIA labels and tooltips
- ✅ Keyboard navigation support (via MUI components)
- ✅ Screen reader friendly

## Future Enhancements (Optional)

1. **Drag & drop** - Allow dragging files directly into the upload area
2. **File preview modal** - Built-in preview for common file types
3. **Batch delete** - Select multiple files to delete at once
4. **File organization** - Folders or tags for better organization
5. **File sharing** - Generate shareable links
6. **File versioning** - Track multiple versions of the same file
7. **Thumbnails** - For image files and PDFs

## Dependencies

All required dependencies are already installed:
- ✅ `firebase` (Storage SDK)
- ✅ `uuid` (Unique filenames)
- ✅ `@mui/material` (UI components)
- ✅ `@mui/icons-material` (File type icons)

## Troubleshooting

### Files not uploading
1. Check browser console for errors
2. Verify Firebase Storage rules
3. Check file size limits
4. Verify user authentication

### Files not displaying
1. Check Firestore - verify `files` array exists
2. Check download URLs are valid
3. Verify Storage rules allow reads
4. Check browser console for errors

### Files not opening/downloading
1. Verify download URL is accessible
2. Check browser popup blocker
3. Test in different browser
4. Verify CORS configuration in Firebase

### Upload progress stuck
1. Check network connection
2. Verify file isn't too large
3. Check Firebase Storage quota
4. Look for JavaScript errors in console

## Next Phase: Rich Text Editor (Phase 4)

After testing Phase 3, the final phase will implement:
- Rich text editing for descriptions
- Math symbols and equations support
- Greek letters and scientific notation
- Text formatting (bold, italic, lists, etc.)
- Similar to previous TextEditor implementation but integrated into panels

