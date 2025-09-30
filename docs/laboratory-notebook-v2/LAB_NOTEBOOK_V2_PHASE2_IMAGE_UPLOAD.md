# Laboratory Notebook V2 - Phase 2: Image Upload Implementation

## Overview
Phase 2 implements comprehensive image upload, storage, and display functionality for Laboratory Notebook V2 designs, builds, and tests.

## What Was Implemented

### 1. **ImageUploadSection Component** (`src/components/LaboratoryNotebookV2/ImageUploadSection.tsx`)
- **Full image upload functionality** with drag-and-drop support
- **Automatic image compression** for files > 1MB (max 1920px, using `browser-image-compression`)
- **Firebase Storage integration** with unique filenames using UUID
- **Progress indicators** during upload
- **Image title editing** - users can add custom titles to each image
- **Delete functionality** - removes images from both UI and Firebase Storage
- **Fullscreen preview** - click any image to view in full size
- **Responsive grid layout** - adapts to different screen sizes
- **Error handling** with user-friendly messages

### 2. **ImageGallery Component** (`src/components/LaboratoryNotebookV2/ImageGallery.tsx`)
- **Read-only image display** for DetailPanel views
- **Grid layout** with hover effects
- **Fullscreen preview** with image titles
- **Empty state** when no images are present
- **Responsive design** (4 columns on desktop, 2 on tablet, 1 on mobile)

### 3. **Integration into Panels**

#### EditPanel & ExpandedEditPanel
- Image upload section added after description field
- Images are loaded from node data on panel open
- Images are saved to Firestore when user clicks "Save Changes"
- Upload is disabled while form is submitting

#### DetailPanel & ExpandedDetailPanel
- Images section displays all images in read-only gallery
- Click any image to preview in fullscreen
- Shows image count

## Firebase Storage Structure

Images are stored in Firebase Storage with the following paths:

```
/designs/{designId}/{timestamp}_{uuid}.{ext}
/builds/{buildId}/{timestamp}_{uuid}.{ext}
/tests/{testId}/{timestamp}_{uuid}.{ext}
```

**Example:**
```
/designs/abc123/1735689234567_a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.jpg
```

## Firestore Data Structure

Images are stored as arrays in Firestore documents:

```typescript
interface Image {
  url: string;      // Firebase Storage download URL
  path: string;     // Firebase Storage path for deletion
  title: string;    // User-provided title/caption
}

// In Firestore documents
{
  // ... other fields
  images: [
    {
      url: "https://firebasestorage.googleapis.com/...",
      path: "designs/abc123/1735689234567_uuid.jpg",
      title: "Circuit Diagram"
    }
  ]
}
```

## What Needs to be Tested

### 1. **Image Upload Testing**
- [ ] Upload single image to a design
- [ ] Upload multiple images at once (2-5 images)
- [ ] Upload large images (>1MB) - verify compression works
- [ ] Add custom titles to images
- [ ] Edit existing image titles
- [ ] Delete individual images
- [ ] Verify images persist after page refresh

### 2. **Build & Test Image Upload**
- [ ] Upload images to a build
- [ ] Upload images to a test
- [ ] Verify each entity (design/build/test) has separate storage

### 3. **Panel Navigation**
- [ ] Open EditPanel → upload image → Save → verify image shows in DetailPanel
- [ ] Open ExpandedEditPanel → upload image → Save → verify persistence
- [ ] Click fullscreen icon in small EditPanel → verify images transfer to expanded view
- [ ] Upload in expanded view → minimize → verify images are retained

### 4. **Image Gallery (Read-only)**
- [ ] View images in DetailPanel
- [ ] View images in ExpandedDetailPanel
- [ ] Click image to open fullscreen preview
- [ ] Close fullscreen preview
- [ ] Verify image titles display correctly

### 5. **Error Handling**
- [ ] Upload non-image file (should be rejected by file input)
- [ ] Upload very large file (should compress automatically)
- [ ] Test network failure during upload
- [ ] Delete image that doesn't exist (should fail gracefully)

### 6. **Concurrent Operations**
- [ ] Upload multiple images simultaneously
- [ ] Upload images while form is submitting (should be disabled)
- [ ] Edit image titles while another image is uploading

### 7. **Data Persistence**
- [ ] Create design with images → navigate away → return → verify images are there
- [ ] Edit design → add images → save → refresh page → verify images persist
- [ ] Delete design → verify associated images are cleaned up (manual check in Firebase Console)

## Firebase Configuration Requirements

### Firebase Storage Rules
Ensure Firebase Storage rules allow authenticated users to:
1. **Upload** to `designs/`, `builds/`, and `tests/` paths
2. **Read** their own uploaded images
3. **Delete** their own uploaded images

**Recommended Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Laboratory Notebook V2 paths
    match /designs/{designId}/{filename} {
      allow read, write: if request.auth != null;
    }
    match /builds/{buildId}/{filename} {
      allow read, write: if request.auth != null;
    }
    match /tests/{testId}/{filename} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firestore Security Rules
Ensure Firestore rules allow:
1. **Writing** `images` array field to designs, builds, and tests documents
2. **Reading** `images` field from own documents

**Check existing rules for:**
```javascript
match /designs/{designId} {
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && request.resource.data.images is list; // Allow images array
}
// Similar for /builds and /tests
```

## Known Limitations

1. **No batch delete** - images must be deleted individually
2. **No image reordering** - images appear in upload order
3. **No image editing** - can't crop, rotate, or filter images (client-side only compression)
4. **Storage cleanup** - when a design/build/test is deleted, images should be cleaned up (service layer handles this, but verify)

## Dependencies

All required dependencies are already installed:
- ✅ `firebase` (Storage SDK)
- ✅ `browser-image-compression`
- ✅ `uuid`
- ✅ `@mui/material` (UI components)

## Next Steps (Phase 3 & 4)

After testing Phase 2, we'll implement:
- **Phase 3:** File upload/attachment functionality (PDFs, data files, etc.)
- **Phase 4:** Rich text editor for descriptions with math symbols and Greek letters

## Troubleshooting

### Images not uploading
1. Check browser console for errors
2. Verify Firebase Storage rules allow writes
3. Check network tab for failed requests
4. Verify user is authenticated

### Images not displaying
1. Check Firestore console - verify `images` array exists
2. Check browser console for download URL errors
3. Verify Storage rules allow reads
4. Check if CORS is configured in Firebase Storage

### Images not deleting
1. Verify delete function is being called (console logs)
2. Check Firebase Storage rules
3. Verify image path is correct
4. Check if image was already deleted

## Testing Checklist

Before merging to main:
- [ ] All upload tests pass
- [ ] All display tests pass
- [ ] No console errors
- [ ] Images persist across sessions
- [ ] Firebase Storage shows correct file structure
- [ ] Firestore documents have correct `images` arrays
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Mobile responsive (test on small screen)
- [ ] Performance is acceptable (upload < 5 seconds per image)

