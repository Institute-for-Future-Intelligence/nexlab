# Custom Domain Configuration for nexlab.bio

This document outlines the steps taken to migrate from GitHub Pages subdirectory URL to the custom domain `nexlab.bio`.

## Code Changes Completed

### 1. Vite Configuration
- ✅ Updated `vite.config.ts` to use base path `/` instead of `/nexlab/`
- ✅ Removed conditional base path logic for production builds

### 2. Package Configuration
- ✅ Updated `package.json` homepage URL from GitHub Pages to `https://nexlab.bio/`
- ✅ Updated author URL to `https://nexlab.bio/`

### 3. GitHub Pages Configuration
- ✅ Created `public/CNAME` file with `nexlab.bio` domain
- ✅ Updated `public/404.html` to use root path routing (removed `/nexlab/` path handling)

### 4. React Router Configuration
- ✅ Updated `src/App.tsx` to use undefined basename (root path) instead of `/nexlab`

### 5. Hardcoded URL Updates
Updated all hardcoded URLs in the following files:
- ✅ `src/components/common/EmailTemplates.tsx` (3 instances)
- ✅ `src/components/UserAccount/RequestEducatorPermissionsForm.tsx`
- ✅ `src/components/CourseRequests/CourseRequestsAdminPage.tsx`
- ✅ `src/components/CourseManagement/RequestNewCourseForm.tsx`
- ✅ `src/components/Chatbot/ChatbotRequestPage.tsx`
- ✅ `src/components/common/MaterialHyperlink.tsx`
- ✅ `src/components/common/CourseHyperlink.tsx`
- ✅ `src/components/ChatbotConversations/ChatbotConversationsPage.tsx`
- ✅ `src/components/ChatbotConversations/ChatbotDetails.tsx`

### 6. Documentation
- ✅ Updated `README.md` deployment URL to `https://nexlab.bio/`

## Firebase Configuration Required

⚠️ **IMPORTANT**: The following Firebase configurations must be updated in the Firebase Console:

### 1. Firebase Authentication - Authorized Domains

You must add `nexlab.bio` to Firebase Authentication's authorized domains:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `nexlab.bio`
6. Keep existing domains:
   - `localhost`
   - Your Firebase project domain (e.g., `your-project.firebaseapp.com`)
   - Optionally keep: `institute-for-future-intelligence.github.io` (for backward compatibility)

### 2. Firebase Storage - CORS Configuration

Update Firebase Storage CORS settings to allow requests from the new domain:

```json
[
  {
    "origin": ["https://nexlab.bio"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

To apply CORS configuration:

```bash
gsutil cors set cors.json gs://your-storage-bucket-name.appspot.com
```

Create a `cors.json` file with the configuration above, then run the gsutil command.

### 3. Environment Variables - GitHub Secrets

Verify that your GitHub repository secrets include the correct Firebase configuration:

- `VITE_API_KEY` - Firebase API key
- `VITE_AUTH_DOMAIN` - Should be your Firebase project auth domain (e.g., `your-project.firebaseapp.com`)
- `VITE_PROJECT_ID` - Firebase project ID
- `VITE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_APP_ID` - Firebase app ID
- `VITE_GOOGLE_ANALYTICS_ID` - Google Analytics ID (if used)
- `VITE_PUBLIC_COURSE_ID` - Public course ID
- `VITE_CHATBOT_DEFAULT_ID` - Default chatbot ID
- `VITE_GEMINI_API_KEY` - Gemini API key
- `VITE_GEMINI_MATERIAL_API_KEY` - Gemini Material API key

**Note**: The `VITE_AUTH_DOMAIN` should remain as your Firebase project's auth domain (e.g., `your-project.firebaseapp.com`), NOT `nexlab.bio`. Firebase Auth uses this for OAuth redirects.

## GitHub Pages Configuration

### Custom Domain Setup (Already Completed)

1. ✅ DNS records configured to point to GitHub Pages
2. ✅ Custom domain added in GitHub repository settings
3. ✅ HTTPS enforcement enabled

### Deployment Workflow

The existing GitHub Actions workflow (`.github/workflows/react-deploy.yml`) will continue to work without modifications. The CNAME file will be automatically deployed with each build.

## Testing Checklist

After deployment, verify the following:

- [ ] Homepage loads at `https://nexlab.bio/`
- [ ] All assets (CSS, JS, images) load correctly (no 404 errors)
- [ ] Deep links work (e.g., `https://nexlab.bio/view-material/[id]`)
- [ ] Google Sign-In works properly
- [ ] Firebase Storage images load correctly
- [ ] Email notifications contain correct URLs
- [ ] No console errors related to CORS or authentication

## Rollback Plan

If issues occur, you can quickly rollback by:

1. Remove the CNAME file from the repository
2. Revert to the previous commit with `/nexlab/` base path
3. Redeploy

## Additional Resources

- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Firebase Authentication Authorized Domains](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Firebase Storage CORS Configuration](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)

## Notes

- The old GitHub Pages URL (`institute-for-future-intelligence.github.io/nexlab/`) will automatically redirect to the custom domain if configured properly in GitHub
- Email links in the database that reference the old URL will need to be manually updated or will break
- Consider keeping the old domain in Firebase authorized domains for a transition period

## Summary of All Changes

**Total Files Modified:** 18 files  
**Date:** October 15, 2025  
**Branch:** `fix/custom-domain-configuration`  
**Build Status:** ✅ PASSING

### Technical Changes Made

#### Before (GitHub Pages Subdirectory)
```javascript
// vite.config.ts
base: command === 'build' ? '/nexlab/' : '/',

// App.tsx
const basename = import.meta.env.PROD ? '/nexlab' : undefined;

// URLs
https://institute-for-future-intelligence.github.io/nexlab/view-material/123
```

#### After (Custom Domain)
```javascript
// vite.config.ts
base: '/',

// App.tsx  
const basename = undefined;

// URLs
https://nexlab.bio/view-material/123
```

### URL Handling Pattern Updates

Changed from checking `github.io` to checking exact domain:

**Before:**
```typescript
const isProduction = window.location.hostname.includes('github.io');
```

**After:**
```typescript
const isProduction = window.location.hostname === 'nexlab.bio';
```

### Complete File List

#### Modified Files (18):
1. `vite.config.ts` - Base path changed to `/`
2. `package.json` - Homepage URLs updated to nexlab.bio
3. `src/App.tsx` - Removed `/nexlab` basename
4. `public/404.html` - Updated SPA redirect logic for root path
5. `public/CNAME` - Created with `nexlab.bio`
6. `README.md` - Updated deployment URL
7. `src/components/common/EmailTemplates.tsx` - Updated default appUrl (3 instances)
8. `src/components/UserAccount/RequestEducatorPermissionsForm.tsx` - Email link
9. `src/components/CourseRequests/CourseRequestsAdminPage.tsx` - Email link
10. `src/components/CourseManagement/RequestNewCourseForm.tsx` - Email link
11. `src/components/Chatbot/ChatbotRequestPage.tsx` - Email link
12. `src/components/common/MaterialHyperlink.tsx` - Hostname detection + baseUrl
13. `src/components/common/CourseHyperlink.tsx` - Hostname detection + baseUrl
14. `src/components/ChatbotConversations/ChatbotConversationsPage.tsx` - Material link
15. `src/components/ChatbotConversations/ChatbotDetails.tsx` - Material link
16. `src/components/SelectionPage.tsx` - Fixed hardcoded localhost URL
17. `src/utils/textExtraction.ts` - PDF.js worker path (removed `/nexlab`)
18. `docs/ARCHITECTURE_IMPROVEMENTS.md` - Updated example URLs

## Migration Completed

Date: October 15, 2025
Branch: `fix/custom-domain-configuration`

