# Laboratory Notebook V2 - Enhancements Implementation Plan

## Overview
Adding three major feature sets to Lab Notebook V2:
1. Full-screen/expand view for detail panels
2. Image upload/display with custom titles
3. File upload/attachment with preview
4. Rich text editor with math/Greek symbols

## Existing Components (to reuse/adapt)
- `Dashboard/ImageUpload.tsx` - Image compression, Firebase upload, titles, full-screen view
- `Dashboard/FileUpload.tsx` - File upload with size limits, Firebase Storage
- `Dashboard/TextEditor.tsx` - ReactQuill with Greek letters and math operators
- Using `react-quill-new`, `browser-image-compression`, `dompurify`

## Architecture Principles
- **Modularity**: Separate concerns (upload logic, UI, state management)
- **Reusability**: Create generic components usable across Lab Notebook V2
- **Scalability**: Clean interfaces, proper TypeScript typing
- **Maintainability**: Clear component structure, well-documented
- **State Management**: Zustand for global state, local state for UI

---

## Phase 1: Full-Screen View for Detail Panel

### Components to Create
1. `LaboratoryNotebookV2/Panels/ExpandedDetailPanel.tsx`
   - Full-screen overlay panel
   - All detail panel content in expanded view
   - Close/minimize button
   - Better layout for large content

### Implementation
- Add `isExpanded` state to Zustand store
- Add expand/collapse actions
- Create FullScreen button in DetailPanel header
- Render ExpandedDetailPanel when `isExpanded === true`

---

## Phase 2: Image Upload & Display

### Components to Create
1. `LaboratoryNotebookV2/common/ImageUploadV2.tsx`
   - Modernized version matching design system
   - Image compression
   - Custom titles per image
   - Grid layout for thumbnails
   - Full-screen preview modal
   - Delete functionality

2. `LaboratoryNotebookV2/common/ImageGallery.tsx`
   - Display images in grid
   - Click to view full-screen
   - Show titles
   - Lightbox navigation

### Integration Points
- Add to CreatePanel (designs)
- Add to AddBuildPanel
- Add to AddTestPanel
- Add to EditPanel
- Display in DetailPanel and ExpandedDetailPanel

### State Management
- Images stored in Zustand: `designs.images[]`, `builds.images[]`, `tests.images[]`
- Actions: `addImage`, `removeImage`, `updateImageTitle`
- Firebase paths: `designs/{designId}/images`, `builds/{buildId}/images`, `tests/{testId}/images`

---

## Phase 3: File Upload & Attachment

### Components to Create
1. `LaboratoryNotebookV2/common/FileUploadV2.tsx`
   - Modernized file upload matching design system
   - File size validation (5MB limit)
   - Upload progress indicator
   - File list with download/preview

2. `LaboratoryNotebookV2/common/FilePreview.tsx`
   - Preview different file types
   - Download button
   - Delete button (if editable)

### Integration Points
- Add to CreatePanel (designs)
- Add to AddBuildPanel
- Add to AddTestPanel
- Add to EditPanel
- Display in DetailPanel and ExpandedDetailPanel

### State Management
- Files stored in Zustand: `designs.files[]`, `builds.files[]`, `tests.files[]`
- Actions: `addFile`, `removeFile`
- Firebase paths: `designs/{designId}/files`, `builds/{buildId}/files`, `tests/{testId}/files`

---

## Phase 4: Rich Text Editor

### Components to Create
1. `LaboratoryNotebookV2/common/RichTextEditor.tsx`
   - ReactQuill integration
   - Greek letters dropdown
   - Math operators dropdown
   - Standard formatting toolbar
   - Matches Lab Notebook V2 design system

### Integration Points
Replace plain TextFields with RichTextEditor for:
- Design description (CreatePanel, EditPanel)
- Build description (AddBuildPanel, EditPanel)
- Test description, results, conclusions (AddTestPanel, EditPanel)

### Display
- DetailPanel: Render HTML safely with DOMPurify
- ExpandedDetailPanel: Render HTML safely
- Node cards: Show plain text excerpt

---

## File Structure

```
src/components/LaboratoryNotebookV2/
├── common/
│   ├── ImageUploadV2.tsx          # NEW
│   ├── ImageGallery.tsx            # NEW
│   ├── FileUploadV2.tsx            # NEW
│   ├── FilePreview.tsx             # NEW
│   └── RichTextEditor.tsx          # NEW
├── Panels/
│   ├── DetailPanel.tsx             # UPDATE
│   ├── ExpandedDetailPanel.tsx     # NEW
│   ├── CreatePanel.tsx             # UPDATE
│   ├── EditPanel.tsx               # UPDATE
│   ├── AddBuildPanel.tsx           # UPDATE
│   └── AddTestPanel.tsx            # UPDATE
```

---

## Implementation Order

### Week 1: Core Infrastructure
1. ✅ Create RichTextEditor component
2. ✅ Update CreatePanel to use RichTextEditor
3. ✅ Create ImageUploadV2 component
4. ✅ Create ImageGallery component

### Week 2: File Handling
5. ✅ Create FileUploadV2 component
6. ✅ Create FilePreview component
7. ✅ Integrate images/files into CreatePanel
8. ✅ Integrate images/files into AddBuildPanel
9. ✅ Integrate images/files into AddTestPanel

### Week 3: Display & Edit
10. ✅ Update EditPanel with rich text, images, files
11. ✅ Update DetailPanel to display images/files
12. ✅ Create ExpandedDetailPanel
13. ✅ Add expand/collapse functionality

### Week 4: Testing & Polish
14. ✅ Test all upload/download/delete flows
15. ✅ Ensure Firebase storage cleanup
16. ✅ Add loading states and error handling
17. ✅ Responsive design testing
18. ✅ Performance optimization

---

## Dependencies Required
- `react-quill-new` (already installed)
- `browser-image-compression` (already installed)  
- `dompurify` (already installed)
- `@types/dompurify` (check if installed)

---

## Notes
- Keep all existing functionality working
- Maintain consistent design system usage
- Ensure proper TypeScript typing throughout
- Add proper error handling and user feedback
- Follow existing patterns from Dashboard components
- Ensure Firebase Storage cleanup on deletions

