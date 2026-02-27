# NexLAB Image Upload & Display Flow Analysis

**Date:** January 28, 2026  
**Purpose:** Comprehensive analysis of image upload, state management, and display logic for course materials

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Image Upload Flows](#image-upload-flows)
3. [State Management](#state-management)
4. [Display Logic](#display-logic)
5. [Identified Issues](#identified-issues)
6. [Recommendations](#recommendations)

---

## 1. System Overview

### Components Involved

```
┌─────────────────────────────────────────────────────────────┐
│                     Image Upload System                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌────────────────┐   ┌─────────────┐ │
│  │  Lab Notebook│    │ Material Import│   │  Firebase   │ │
│  │   (Manual)   │───>│   (AI-based)   │──>│   Storage   │ │
│  └──────────────┘    └────────────────┘   └─────────────┘ │
│         │                     │                    │        │
│         ↓                     ↓                    ↓        │
│  ┌──────────────┐    ┌────────────────┐   ┌─────────────┐ │
│  │ ImageUpload  │    │ imageUpload    │   │   Firestore │ │
│  │  Section.tsx │    │  Service.ts    │   │  (metadata) │ │
│  └──────────────┘    └────────────────┘   └─────────────┘ │
│         │                     │                    │        │
│         └─────────────────────┴────────────────────┘        │
│                             │                               │
│                             ↓                               │
│                    ┌────────────────┐                       │
│                    │ ImageGallery   │                       │
│                    │   (Display)    │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Image Upload Flows

### Flow A: Manual Upload (Lab Notebook - Designs/Builds/Tests)

**Component:** `src/components/LaboratoryNotebookV2/ImageUploadSection.tsx`

**Trigger:** User clicks "Upload Images" button

**Process:**

1. **File Selection**
   ```typescript
   // Line 52-54
   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(event.target.files || []);
     if (files.length === 0) return;
   ```

2. **Compression (if > 1MB)**
   ```typescript
   // Lines 68-76
   let fileToUpload = file;
   if (file.size > 1024 * 1024) {
     const options = {
       maxSizeMB: 1,
       maxWidthOrHeight: 1920,
       useWebWorker: true,
     };
     fileToUpload = await imageCompression(file, options);
   }
   ```

3. **Upload to Firebase Storage**
   ```typescript
   // Lines 78-84
   const uniqueFilename = `${Date.now()}_${uuidv4()}.${fileToUpload.type.split('/')[1]}`;
   const storageRefPath = `${storagePath}/${uniqueFilename}`;
   // Example: designs/abc123/1738123456789_uuid.jpg
   const uploadTask = uploadBytesResumable(storageRefInstance, fileToUpload);
   ```

4. **Progress Tracking**
   ```typescript
   // Lines 87-92
   uploadTask.on('state_changed',
     (snapshot) => {
       const progress = ((i + snapshot.bytesTransferred / snapshot.totalBytes) / files.length) * 100;
       setUploadProgress(progress);
     }
   );
   ```

5. **State Update**
   ```typescript
   // Line 111
   onImagesChange([...images, ...uploadedImages]);
   // This calls parent component's state setter, updating Zustand store
   ```

**Storage Path Structure:**
- Designs: `designs/{designId}/{timestamp}_{uuid}.{ext}`
- Builds: `builds/{buildId}/{timestamp}_{uuid}.{ext}`
- Tests: `tests/{testId}/{timestamp}_{uuid}.{ext}`

---

### Flow B: AI Material Import (Bulk Upload)

**Component:** `src/services/imageUploadService.ts`

**Trigger:** User imports PDF/DOCX/PPTX and clicks "Save Material"

**Process:**

1. **Detection of Blob URLs**
   ```typescript
   // AddMaterialFormModern.tsx lines 139-144
   const hasUnuploadedImages = sections.some(section => 
     section.images?.some(img => img.url.startsWith('blob:')) ||
     section.subsections?.some(sub => 
       sub.images?.some(img => img.url.startsWith('blob:'))
     )
   );
   ```
   **Why Blob URLs?** AI extraction creates temporary in-memory images that need Firebase upload.

2. **Material Creation (Without Images)**
   ```typescript
   // Lines 150-160
   const docRef = await addDoc(collection(db, 'materials'), {
     course,
     title,
     sections: [], // Empty sections
     published: false,
   });
   const materialId = docRef.id;
   ```

3. **Batch Image Upload**
   ```typescript
   // Lines 167-175
   const updatedSections = await convertMaterialWithImageUpload(
     course,
     userDetails?.uid,
     materialId,
     (completed, total) => {
       setImageUploadProgress({ completed, total });
     }
   );
   ```

4. **Image Upload Service Logic**
   ```typescript
   // imageUploadService.ts lines 247-278
   const imagesToUpload = images.filter(img => img.imageBlob);
   const shouldUseEnhancedService = 
     imageCount > 20 || imagesToUpload.some(img => img.imageBlob!.size > 2 * 1024 * 1024);
   
   if (shouldUseEnhancedService) {
     // Use enhanced service for large batches
     return await enhancedImageUploadService.uploadImagesWithProgress(...);
   } else {
     // Use standard batch upload
     return await batchUploadImages(...);
   }
   ```

5. **Compression & Upload**
   ```typescript
   // imageUploadService.ts lines 88-136
   export const uploadImageBlob = async (
     imageBlob: Blob,
     filename: string,
     sectionId: string,
     retryCount: number = 3,
     timeoutMs: number = 15000
   ) => {
     // Compress image
     const { blob: compressedBlob, format } = await compressImageBlob(imageBlob);
     
     // Generate unique filename
     const uniqueFilename = `${filename}_${uuidv4()}.${format}`;
     
     // Upload to Firebase Storage
     const storageRef = ref(storage, `materials/${sectionId}/${uniqueFilename}`);
     const snapshot = await uploadBytes(storageRef, compressedBlob);
     const downloadURL = await getDownloadURL(snapshot.ref);
     
     return { url: downloadURL, path: snapshot.ref.fullPath };
   };
   ```

6. **Update Material with Real URLs**
   ```typescript
   // Lines 177-182
   await updateDoc(docRef, {
     sections: updatedSections, // Now with Firebase URLs
     published: shouldPublish,
   });
   ```

**Storage Path Structure:**
- Materials: `materials/{materialId}/{filename}_{uuid}.{ext}`

---

### Flow C: Enhanced Batch Upload (Large Files/Many Images)

**Component:** `src/services/enhancedImageUploadService.ts`

**Trigger:** > 20 images OR any image > 2 MB

**Process:**

1. **Batching Logic**
   ```typescript
   // Lines 71-97
   const imagesToUpload = images.filter(img => img.imageBlob);
   const totalImages = imagesToUpload.length;
   
   // Adaptive batch sizing based on image count
   const batchSize = totalImages > 100 ? 5 : totalImages > 50 ? 8 : 10;
   
   for (let batchStart = 0; batchStart < totalImages; batchStart += batchSize) {
     const batch = imagesToUpload.slice(batchStart, batchEnd);
     // Process batch...
   }
   ```

2. **Optimization Logic**
   ```typescript
   // Lines 98-174
   // Optimize images before upload (resize, compress)
   const optimizedBlobs = await Promise.all(
     batch.map(img => this.optimizeImage(img.imageBlob, options))
   );
   
   // Upload in parallel with timeout protection
   const uploadPromises = optimizedBlobs.map((blob, index) => 
     this.uploadWithTimeout(blob, timeout)
   );
   
   const results = await Promise.allSettled(uploadPromises);
   ```

3. **Progress Reporting**
   ```typescript
   // Lines 85-92
   onProgress?.({
     completed: completedCount,
     total: totalImages,
     currentBatch: batchNumber,
     totalBatches: Math.ceil(totalImages / batchSize),
     currentOperation: `Uploading batch ${batchNumber}/${totalBatches}`,
   });
   ```

---

## 3. State Management

### State Flow Diagram

```
User Action → Component State → Service Layer → Firebase → Component State → UI Update
     ↓              ↓                ↓             ↓             ↓              ↓
  Upload       uploading=true    uploadBytes()  Storage    onImagesChange()  Display
  Button       progress=0%       compress()     Firestore  images=[...]      <img src>
```

### Key State Variables

#### A. ImageUploadSection (Manual Upload)

```typescript
// src/components/LaboratoryNotebookV2/ImageUploadSection.tsx lines 46-50
const [uploading, setUploading] = useState(false);           // Upload in progress?
const [uploadProgress, setUploadProgress] = useState(0);     // 0-100%
const [previewImage, setPreviewImage] = useState<Image | null>(null); // Fullscreen preview
const [error, setError] = useState<string | null>(null);     // Error messages
```

**Props (Parent -> Child):**
```typescript
images: Image[]              // Current images array
onImagesChange: (images: Image[]) => void  // State setter callback
storagePath: string          // Firebase Storage path (e.g., designs/abc123)
disabled?: boolean           // Form disabled state
```

**State Update Flow:**
```typescript
User uploads → handleImageUpload() → uploadBytesResumable() → 
  onImagesChange([...images, ...uploadedImages]) → 
    Parent state updates → Re-render with new images → 
      ImageGallery displays images
```

#### B. AddMaterialFormModern (AI Import)

```typescript
// src/components/Supplemental/AddMaterialFormModern.tsx lines 108-110
const [imageUploadProgress, setImageUploadProgress] = useState<{ 
  completed: number; 
  total: number 
} | null>(null);
const [isAIImported, setIsAIImported] = useState(false);
const [imageUploadError, setImageUploadError] = useState<string | null>(null);
```

**State Update Flow:**
```typescript
User saves AI material → hasUnuploadedImages check → 
  convertMaterialWithImageUpload() → 
    Progress callback: setImageUploadProgress({ completed, total }) →
      UI shows LinearProgress bar →
        Upload complete → sections updated with Firebase URLs →
          setIsAIImported(false) → resetImport() →
            Clean state for next import
```

#### C. materialImportStore (Zustand Global State)

```typescript
// src/stores/materialImportStore.ts lines 22-53
export interface MaterialImportState {
  isProcessing: boolean;                           // AI extraction in progress
  progress: MaterialProcessingProgress | null;     // AI extraction progress
  error: string | null;
  uploadedFile: File | null;                       // Original uploaded file
  extractedText: string | null;                    // Extracted text
  extractionResult: TextExtractionResult | null;   // Images, links, metadata
  originalFileUploadProgress: number | null;       // Original file upload %
  originalFileUrl: string | null;                  // Uploaded file URL
  aiExtractedData: AIExtractedMaterialInfo | null; // AI-parsed structure
  convertedMaterial: Omit<Material, 'id' | 'timestamp'> | null;
  processingOptions: MaterialProcessingOptions;
}
```

**State Lifecycle:**
```typescript
1. User uploads PDF → setUploadedFile(file)
2. Extract text → extractTextFromFile() → extractionResult with images (blob URLs)
3. AI processing → processWithAI() → aiExtractedData with sections/images
4. Save material → convertMaterialWithImageUpload() → uploads blob URLs to Firebase
5. Reset → resetImport() → clears all state for next import
```

---

## 4. Display Logic

### Component: SmartImage (ImageGallery.tsx)

**Purpose:** Intelligently load and display images with loading states, error handling, and smooth transitions.

```typescript
// src/components/Supplemental/ImageGallery.tsx lines 65-176
const SmartImage: React.FC<SmartImageProps> = ({ src, alt, title }) => {
  const [loaded, setLoaded] = useState(false);    // Image loaded successfully?
  const [error, setError] = useState(false);       // Image load failed?
  
  // Preload image with native Image API
  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      console.log(`✅ SmartImage loaded: ${src.substring(0, 50)}...`);
      setLoaded(true);
    };
    
    img.onerror = (error) => {
      console.error(`❌ SmartImage failed to load: ${src}`, error);
      setError(true);
    };
  }, [src]);
  
  // Render states
  if (error) return <ErrorPlaceholder />;
  if (!loaded) return <Skeleton />;
  return <FadeIn><StyledImage src={src} /></FadeIn>;
};
```

**Display States:**

1. **Loading State**
   ```typescript
   {!loaded && (
     <Skeleton variant="rectangular" width="100%" height={300} />
   )}
   ```

2. **Loaded State**
   ```typescript
   <Fade in={loaded} timeout={500}>
     <StyledImage src={src} alt={alt} loading="lazy" />
   </Fade>
   ```

3. **Error State**
   ```typescript
   <Box sx={{ bgcolor: '#ffebee', border: '1px dashed #f44336' }}>
     <Typography color="error">Image failed to load</Typography>
     <Typography variant="caption">{title}</Typography>
     <Typography variant="caption">URL: {src.substring(0, 60)}...</Typography>
   </Box>
   ```

---

## 5. Identified Issues

### 🚨 Issue 1: CORS Configuration Problem

**Location:** `ImageGallery.tsx` lines 78-102

**Problem:**
```typescript
// Lines 90-103
img.onerror = (error) => {
  console.error(`❌ SmartImage failed to load: ${src}`, error);
  console.error(`Image load failed. URL accessible via curl but blocked in browser.`);
  console.error(`This is likely a Firebase Storage CORS configuration issue.`);
  console.error(`Fix: Configure CORS to allow ${window.location.origin}`);
  setError(true);
};
```

**Symptoms:**
- Images upload successfully to Firebase Storage
- URLs are valid and accessible (curl works)
- Browser blocks image loading due to CORS policy
- Error state displayed instead of images

**Why It Happens:**
Firebase Storage default CORS policy doesn't allow cross-origin requests from your app's domain.

**Evidence:**
```typescript
// Lines 77-81 - CORS handling commented out
// Skip crossOrigin to avoid CORS issues for now
// TODO: Fix Firebase Storage CORS configuration
// if (retryAttempt === 0) {
//   img.crossOrigin = 'anonymous';
// }
```

**Fix Required:**
Configure Firebase Storage CORS to allow your domain:

```json
// cors.json
[
  {
    "origin": ["https://nexlab.app", "http://localhost:3000"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

```bash
# Apply CORS configuration
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

---

### 🚨 Issue 2: Blob URL State Synchronization

**Location:** `AddMaterialFormModern.tsx` lines 139-145

**Problem:**
```typescript
const hasUnuploadedImages = sections.some(section => 
  section.images?.some(img => img.url.startsWith('blob:')) ||
  section.subsections?.some(sub => 
    sub.images?.some(img => img.url.startsWith('blob:'))
  )
);
```

**Scenario:**
1. User imports PDF with images → `blob:` URLs created
2. User clicks Save → `blob:` URLs detected → upload triggered
3. If user navigates away or clicks Save again → **Blob URLs may be revoked**
4. Re-save attempt fails because `blob:` URLs no longer valid

**Potential Race Condition:**
```typescript
// If user clicks Save multiple times rapidly:
1st Save: Creates Firestore doc → uploads images (async)
2nd Save: Detects blob URLs again → creates DUPLICATE Firestore doc
```

**Fix Required:**
Add debouncing and blob URL validation:

```typescript
const [isSavingMaterial, setIsSavingMaterial] = useState(false);

const handleSubmit = async () => {
  if (isSavingMaterial) return; // Prevent duplicate saves
  setIsSavingMaterial(true);
  
  try {
    // Validate blob URLs still exist
    const validBlobUrls = await Promise.all(
      blobUrls.map(url => fetch(url).then(() => true).catch(() => false))
    );
    
    if (validBlobUrls.some(v => !v)) {
      throw new Error('Some images are no longer available. Please re-import.');
    }
    
    // Proceed with save...
  } finally {
    setIsSavingMaterial(false);
  }
};
```

---

### 🚨 Issue 3: Image Compression Timeout

**Location:** `imageUploadService.ts` lines 56-59

**Problem:**
```typescript
const compressionTimeout = setTimeout(() => {
  reject(new Error('Image compression timed out after 10 seconds'));
}, 10000); // 10 second timeout
```

**Scenario:**
- User uploads very large image (e.g., 20 MB high-res photo)
- Compression takes > 10 seconds
- Upload aborted with timeout error
- User sees "Image upload failed" but doesn't know why

**Evidence:**
```typescript
// Lines 53-54 - Aggressive compression settings
const quality = shouldCompress ? 60 : 75;
const maxDimension = shouldCompress ? 600 : 800; // Very small!
```

**Issue:** 600px max dimension may be too small for presentation materials (slides, diagrams).

**Fix Required:**
Increase timeout and adjust compression settings:

```typescript
// Increase timeout to 30 seconds
const compressionTimeout = setTimeout(() => {
  reject(new Error('Image compression timed out after 30 seconds'));
}, 30000);

// Better compression settings for educational materials
const quality = shouldCompress ? 75 : 85;  // Higher quality
const maxDimension = shouldCompress ? 1200 : 1920; // Larger dimensions
```

---

### 🚨 Issue 4: Upload Progress State Not Cleared on Error

**Location:** `ImageUploadSection.tsx` lines 112-121

**Problem:**
```typescript
} catch (err) {
  console.error('Error uploading images:', err);
  setError('Failed to upload images. Please try again.');
} finally {
  setUploading(false);
  setUploadProgress(0); // ✅ Progress cleared
  if (fileInputRef.current) {
    fileInputRef.current.value = ''; // ✅ File input cleared
  }
}
// ❌ But partially uploaded images NOT removed from state!
```

**Scenario:**
1. User uploads 5 images
2. First 2 upload successfully → added to `images` array
3. Third image fails → error thrown
4. `finally` block runs → UI shows "Upload failed"
5. **Problem:** First 2 images remain in state, third+ are lost
6. User doesn't know which images uploaded successfully

**Fix Required:**
Track successful uploads and rollback on error:

```typescript
const uploadedImages: Image[] = [];
const successfulUploads: string[] = []; // Track paths for rollback

try {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // ... upload logic ...
    uploadedImages.push({ url: downloadURL, path: storageRefPath });
    successfulUploads.push(storageRefPath);
  }
  onImagesChange([...images, ...uploadedImages]);
} catch (err) {
  console.error('Upload failed, rolling back successful uploads:', err);
  
  // Rollback: delete successfully uploaded images
  await Promise.all(
    successfulUploads.map(path => 
      deleteObject(firebaseRef(storage, path)).catch(e => 
        console.warn('Rollback failed for', path, e)
      )
    )
  );
  
  setError(`Failed to upload ${files.length - successfulUploads.length} of ${files.length} images`);
} finally {
  setUploading(false);
  setUploadProgress(0);
}
```

---

### 🚨 Issue 5: Retry Logic Complexity

**Location:** `imageUploadService.ts` lines 97-150

**Problem:**
```typescript
for (let attempt = 1; attempt <= retryCount; attempt++) {
  try {
    // Compress
    const { blob, format } = await compressImageBlob(imageBlob);
    
    // Upload with timeout
    const uploadPromise = async () => { /* upload logic */ };
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );
    const result = await Promise.race([uploadPromise(), timeoutPromise]);
    
    return result;
  } catch (error) {
    // Retry with exponential backoff
    const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}
```

**Issues:**
1. **Compression happens on EVERY retry** (wasteful)
2. **Exponential backoff may be too aggressive** (1s → 2s → 4s)
3. **No distinction between temporary vs. permanent failures**
4. **Logs don't indicate retry reason** (timeout? network? auth?)

**Example Log Confusion:**
```
Upload attempt 1/3 failed for image.jpg: Upload timeout after 15000ms
Waiting 1000ms before retry...
Upload attempt 2/3 failed for image.jpg: Upload timeout after 15000ms
Waiting 2000ms before retry...
Upload attempt 3/3 failed for image.jpg: Upload timeout after 15000ms
All 3 upload attempts failed for image.jpg
```
User sees: "Failed after 3 attempts" but doesn't know **why** (slow network? server issue? file too large?).

**Fix Required:**
Compress once, better error categorization:

```typescript
// Compress ONCE before retry loop
const { blob: compressedBlob, format } = await compressImageBlob(imageBlob);
const uniqueFilename = `${filename}_${uuidv4()}.${format}`;

for (let attempt = 1; attempt <= retryCount; attempt++) {
  try {
    const uploadPromise = async () => {
      const storageRef = ref(storage, `materials/${sectionId}/${uniqueFilename}`);
      const snapshot = await uploadBytes(storageRef, compressedBlob);
      // ...
    };
    
    const result = await Promise.race([uploadPromise(), timeoutPromise]);
    return result;
    
  } catch (error) {
    const errorType = categorizeError(error);
    
    // Don't retry permanent failures
    if (errorType === 'PERMISSION_DENIED' || errorType === 'INVALID_FILE') {
      throw error;
    }
    
    // Only retry temporary failures
    if (errorType === 'NETWORK_ERROR' || errorType === 'TIMEOUT') {
      console.warn(`Retrying due to ${errorType} (attempt ${attempt}/${retryCount})`);
      const waitTime = 1000 + (attempt * 500); // Linear backoff
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
```

---

### 🚨 Issue 6: State Not Reset After Error

**Location:** `AddMaterialFormModern.tsx` lines 184-189

**Problem:**
```typescript
setImageUploadProgress(null);
setIsAIImported(false);

const { resetImport } = useMaterialImportStore.getState();
resetImport(); // ✅ Clears import store

// ❌ But local state `sections` still contains blob: URLs!
```

**Scenario:**
1. User imports PDF → sections with `blob:` URLs
2. Save fails due to upload error
3. `resetImport()` clears global store
4. Local `sections` state still has `blob:` URLs
5. User clicks Save again → **detects blob URLs again** → tries to re-upload already-failed blobs

**Fix Required:**
Clear local state on error:

```typescript
} catch (error) {
  console.error('Material save failed:', error);
  
  // Reset all state
  setImageUploadProgress(null);
  setIsAIImported(false);
  resetImport();
  
  // Clear sections with blob URLs
  const cleanSections = sections.map(section => ({
    ...section,
    images: section.images?.filter(img => !img.url.startsWith('blob:')) || [],
    subsections: section.subsections?.map(sub => ({
      ...sub,
      images: sub.images?.filter(img => !img.url.startsWith('blob:')) || []
    }))
  }));
  
  setSections(cleanSections); // Update local state
  
  setError('Failed to save material. Please re-import your file.');
}
```

---

### ⚠️ Issue 7: No Image Load Retry Mechanism

**Location:** `ImageGallery.tsx` lines 70-111

**Current Behavior:**
```typescript
useEffect(() => {
  const img = new Image();
  img.src = src;
  
  img.onload = () => setLoaded(true);
  img.onerror = (error) => {
    console.error(`❌ Image failed to load`);
    setError(true); // Immediately shows error, no retry
  };
}, [src]);
```

**Problem:**
- Network hiccup → image load fails → error displayed
- User has to refresh entire page to retry
- No automatic retry for transient failures

**Fix Required:**
Add exponential retry with max attempts:

```typescript
const [retryAttempt, setRetryAttempt] = useState(0);
const MAX_RETRIES = 3;

useEffect(() => {
  const img = new Image();
  img.src = src;
  
  img.onload = () => setLoaded(true);
  img.onerror = () => {
    if (retryAttempt < MAX_RETRIES) {
      const delay = 1000 * Math.pow(2, retryAttempt); // 1s, 2s, 4s
      console.log(`Retry ${retryAttempt + 1}/${MAX_RETRIES} after ${delay}ms`);
      
      setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
      }, delay);
    } else {
      console.error(`Failed after ${MAX_RETRIES} retries`);
      setError(true);
    }
  };
}, [src, retryAttempt]);
```

---

## 6. Recommendations

### Priority 1: Critical Fixes (Deploy ASAP)

1. **Fix CORS Configuration** ✅ **HIGHEST PRIORITY**
   - Apply Firebase Storage CORS rules
   - Test image loading from production domain
   - Add error logging for CORS failures

2. **Prevent Duplicate Saves**
   - Add `isSavingMaterial` flag
   - Disable Save button during upload
   - Show loading spinner

3. **Rollback Failed Uploads**
   - Track successful uploads
   - Delete partial uploads on error
   - Show clear error messages

### Priority 2: User Experience Improvements

4. **Better Error Messages**
   - Categorize errors (network, permissions, file size, etc.)
   - Show actionable fix suggestions
   - Add retry button for failed images

5. **Increase Compression Timeout**
   - 10s → 30s for large images
   - Show compression progress
   - Allow skipping compression for small images

6. **Add Image Load Retry**
   - Automatic retry with exponential backoff
   - Show loading/retrying states
   - Manual retry button

### Priority 3: Performance Optimizations

7. **Optimize Compression Settings**
   - Current: 600px max dimension (too small)
   - Recommended: 1200-1920px for educational materials
   - Quality: 75-85% (current 60% too low)

8. **Compress Once, Retry Upload**
   - Don't recompress on retry
   - Cache compressed blob
   - Only retry network operation

9. **Better Progress Reporting**
   - Show individual image status (uploaded/uploading/failed)
   - Display estimated time remaining
   - Allow canceling individual images

### Priority 4: State Management Improvements

10. **Clean Blob URL State**
    - Clear blob URLs after successful upload
    - Revoke blob URLs to free memory
    - Reset state on error

11. **Add State Validation**
    - Validate blob URLs before upload
    - Check Firebase URLs are accessible
    - Detect stale state

12. **Centralize Image State**
    - Single source of truth for image status
    - Consistent state updates
    - Better debugging

---

## 7. Testing Checklist

### Manual Upload (Lab Notebook)

- [ ] Upload single image (< 1 MB)
- [ ] Upload single image (> 1 MB, should compress)
- [ ] Upload multiple images (5+)
- [ ] Upload very large image (> 10 MB)
- [ ] Delete uploaded image
- [ ] Edit image title
- [ ] View fullscreen preview
- [ ] Upload fails (network off) → error shown
- [ ] Upload fails → no partial state

### AI Material Import

- [ ] Import PDF with images (< 20 images)
- [ ] Import PDF with many images (> 20 images, uses enhanced service)
- [ ] Import PPTX with images
- [ ] Save material → images upload successfully
- [ ] Save material → show progress bar
- [ ] Upload fails → clear error message
- [ ] Re-save after fail → doesn't duplicate
- [ ] Navigate away during upload → state cleaned
- [ ] Blob URLs replaced with Firebase URLs

### Image Display

- [ ] Images load correctly
- [ ] Loading skeleton shown before load
- [ ] Smooth fade-in transition
- [ ] Error placeholder for failed loads
- [ ] Lazy loading works (don't load off-screen images)
- [ ] Retry failed image loads
- [ ] CORS errors handled gracefully

---

## 8. Code Locations Reference

| Component/Service | Path | Purpose |
|-------------------|------|---------|
| **ImageUploadSection** | `src/components/LaboratoryNotebookV2/ImageUploadSection.tsx` | Manual image upload UI for Lab Notebook |
| **imageUploadService** | `src/services/imageUploadService.ts` | Batch image upload logic for AI materials |
| **enhancedImageUploadService** | `src/services/enhancedImageUploadService.ts` | Large batch uploads (>20 images) |
| **materialImportStore** | `src/stores/materialImportStore.ts` | Zustand state for AI material import |
| **AddMaterialFormModern** | `src/components/Supplemental/AddMaterialFormModern.tsx` | Material creation form with image upload |
| **ImageGallery** | `src/components/Supplemental/ImageGallery.tsx` | Image display with loading states |
| **SmartImage** | `src/components/Supplemental/ImageGallery.tsx` (lines 65-176) | Individual image component |
| **ViewMaterialModern** | `src/components/Supplemental/ViewMaterialModern.tsx` | Material viewing page |

---

## 9. Next Steps

1. **Immediate Action:** Fix CORS configuration (blocking image display)
2. **Short Term:** Implement Priority 1 & 2 fixes (prevent data loss)
3. **Medium Term:** Performance optimizations (better UX)
4. **Long Term:** Centralized state management refactor

---

**Document Version:** 1.0  
**Last Updated:** January 28, 2026  
**Status:** Analysis Complete - Ready for Implementation
