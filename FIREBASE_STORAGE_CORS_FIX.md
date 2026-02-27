# Firebase Storage CORS Configuration Fix

**Issue:** Images upload successfully to Firebase Storage but fail to load in browser due to CORS policy blocking.

**Status:** 🔴 **CRITICAL** - Blocking image display across the application

---

## Problem Description

### Symptoms
- ✅ Images upload successfully to Firebase Storage
- ✅ Download URLs are valid and accessible via curl/direct browser access
- ❌ Images fail to load when embedded in `<img>` tags or Canvas API
- ❌ Browser console shows CORS policy errors

### Root Cause
Firebase Storage default CORS configuration doesn't allow cross-origin requests from web applications. When JavaScript tries to load images (especially for Canvas operations or when `crossOrigin="anonymous"` is set), the browser enforces CORS policy and blocks the request.

### Affected Features
- Course material images (ImageGallery component)
- PDF generation (generatePDF.ts - requires canvas access)
- Lab Notebook images (designs, builds, tests)
- Material import images from AI extraction

---

## Solution

### Step 1: Apply CORS Configuration to Firebase Storage

**Prerequisites:**
- Google Cloud SDK (`gcloud`) installed
- Authenticated with project permissions

**Instructions:**

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   ```

3. **Set your Firebase project:**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   # Example: gcloud config set project nexlab-prod
   ```

4. **Get your Storage Bucket name:**
   
   Option A - From Firebase Console:
   - Go to https://console.firebase.google.com/
   - Select your project (nexlab-prod)
   - Navigate to Storage
   - Copy the bucket name (e.g., `nexlab-prod.appspot.com` or `nexlab-prod.firebasestorage.app`)
   
   Option B - From .env file:
   ```bash
   grep VITE_STORAGE_BUCKET .env
   # Output: VITE_STORAGE_BUCKET=nexlab-prod.appspot.com
   ```

5. **Apply CORS configuration:**
   ```bash
   gsutil cors set firebase-storage-cors.json gs://YOUR_BUCKET_NAME
   
   # Example:
   # gsutil cors set firebase-storage-cors.json gs://nexlab-prod.appspot.com
   ```

6. **Verify CORS configuration:**
   ```bash
   gsutil cors get gs://YOUR_BUCKET_NAME
   ```
   
   **Expected output:**
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
     }
   ]
   ```

---

### Step 2: Code Changes (Already Applied in This Branch)

**File:** `src/components/Supplemental/ImageGallery.tsx`

**Before:**
```typescript
// Lines 77-81 (commented out)
// Skip crossOrigin to avoid CORS issues for now
// TODO: Fix Firebase Storage CORS configuration
// if (retryAttempt === 0) {
//   img.crossOrigin = 'anonymous';
// }
```

**After:**
```typescript
// Enable CORS for Firebase Storage images
img.crossOrigin = 'anonymous';
```

**Why This Change?**
- `crossOrigin = 'anonymous'` allows JavaScript to access image data (required for Canvas API, PDF generation)
- Without proper CORS headers from Firebase Storage, this attribute causes browsers to block the request
- With CORS properly configured, this enables full image functionality

---

## Testing

### Manual Testing Steps

1. **Apply CORS configuration** (Step 1 above)

2. **Deploy code changes:**
   ```bash
   git checkout fix/firebase-storage-cors-configuration
   npm run build
   firebase deploy --only hosting
   ```

3. **Test image loading:**
   
   **Test A: Course Material Images**
   - Navigate to any course material with images
   - Open browser DevTools → Network tab
   - Verify images load successfully
   - Check for `Access-Control-Allow-Origin: *` header in response
   
   **Test B: Lab Notebook Images**
   - Create/edit a Design, Build, or Test
   - Upload an image
   - Verify image displays correctly in the grid
   - Check browser console for no CORS errors
   
   **Test C: PDF Generation**
   - View a course material with images
   - Click "Download PDF" button
   - Verify PDF includes images (not blank placeholders)
   
   **Test D: AI Material Import**
   - Import a PDF/PPTX with images
   - Save material
   - View material
   - Verify all images display correctly

4. **Check browser console:**
   - Should see: `✅ SmartImage loaded: https://firebasestorage...`
   - Should NOT see: `❌ SmartImage failed to load` or CORS errors

5. **Verify CORS headers in Network tab:**
   ```
   Response Headers:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Methods: GET, HEAD
   - Access-Control-Max-Age: 3600
   ```

---

## Rollback Plan

If CORS configuration causes issues:

1. **Remove CORS configuration:**
   ```bash
   gsutil cors set /dev/null gs://YOUR_BUCKET_NAME
   ```

2. **Revert code changes:**
   ```bash
   git revert HEAD
   git push origin main
   firebase deploy --only hosting
   ```

3. **Alternative: Restrict origins** (more secure but requires listing all domains):
   ```json
   [
     {
       "origin": [
         "https://nexlab.app",
         "https://www.nexlab.app",
         "http://localhost:3000",
         "http://localhost:5173"
       ],
       "method": ["GET", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
     }
   ]
   ```

---

## Security Considerations

### Current Configuration (Permissive)
```json
"origin": ["*"]
```
- **Pros:** Works from any domain (dev, staging, production)
- **Cons:** Any website can embed your Firebase Storage images
- **Risk Level:** Low (images are public, no sensitive data)

### Recommended for Production (Restrictive)
```json
"origin": [
  "https://nexlab.app",
  "https://www.nexlab.app"
]
```
- **Pros:** Only your domains can access images
- **Cons:** Must update when adding new domains (dev, staging, etc.)
- **Risk Level:** Minimal

### Decision
Start with permissive (`*`) for simplicity. If bandwidth abuse becomes an issue, switch to restrictive origins.

---

## Troubleshooting

### Issue: "gsutil: command not found"
**Fix:**
```bash
# Install Google Cloud SDK
brew install google-cloud-sdk

# Or follow manual installation:
# https://cloud.google.com/sdk/docs/install
```

### Issue: "AccessDeniedException: 403"
**Fix:**
```bash
# Re-authenticate
gcloud auth login

# Verify you have Storage Admin role
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL"
```

### Issue: Images still don't load after applying CORS
**Checklist:**
1. ✅ CORS configuration applied (`gsutil cors get` shows config)
2. ✅ Code changes deployed (check browser source)
3. ✅ Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
4. ✅ Clear browser cache
5. ✅ Check bucket name is correct (case-sensitive)
6. ✅ Wait 5-10 minutes for CDN cache to clear

### Issue: CORS works for new images but not old images
**Cause:** CDN/browser caching old responses without CORS headers

**Fix:**
```bash
# Clear browser cache
# Or open in incognito/private window

# Force CDN cache invalidation (wait 24 hours, or contact Firebase Support)
```

---

## Alternative: Firebase Storage Rules (Not Recommended)

Firebase Storage security rules control authentication, not CORS. Changing rules won't fix this issue.

**Why rules don't help:**
```javascript
// This controls WHO can read, not CORS headers
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null; // ❌ Doesn't add CORS headers
    }
  }
}
```

**Correct approach:** Use `gsutil cors set` as described above.

---

## Next Steps After Applying Fix

1. ✅ Apply CORS configuration to Firebase Storage
2. ✅ Test image loading in browser
3. ✅ Merge this PR to main
4. ✅ Deploy to production
5. ✅ Monitor for any CORS-related errors in Sentry/logs
6. ✅ Update documentation for future developers

---

## Reference Links

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)
- [Google Cloud Storage CORS](https://cloud.google.com/storage/docs/cross-origin)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [HTML `<img>` crossOrigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#crossorigin)

---

**Status:** Ready for deployment  
**Priority:** 🔴 Critical - Deploy ASAP  
**Estimated Impact:** Fixes image display for 100% of course materials  
**Rollback Risk:** Low (can revert CORS config instantly)
