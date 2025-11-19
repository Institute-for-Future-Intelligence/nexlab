# 🔒 Secure API Key Setup - Complete Guide

## The Problem

Your API keys are exposed in production JavaScript files because Vite bundles all `VITE_` prefixed environment variables into the client code. **Anyone can see them** in browser DevTools.

```
❌ Current (INSECURE):
Browser → Gemini API (with exposed key in JavaScript)

✅ Solution (SECURE):
Browser → Firebase Function → Gemini API (key stays server-side)
```

---

## 🎯 Complete Setup (Step-by-Step)

### Step 1: Install Dependencies in Functions

```bash
cd functions
npm install @google/genai@latest
cd ..
```

### Step 2: Configure API Keys Securely

**Store keys in Firebase Config (NOT in .env files):**

```bash
# Set your Gemini API keys securely in Firebase
firebase functions:config:set gemini.course_key="YOUR_COURSE_API_KEY_HERE"
firebase functions:config:set gemini.material_key="YOUR_MATERIAL_API_KEY_HERE"

# Verify they're set
firebase functions:config:get
```

**Output should show:**
```json
{
  "gemini": {
    "course_key": "AIzaSy...",
    "material_key": "AIzaSy..."
  }
}
```

### Step 3: Build and Deploy Functions

```bash
# Build TypeScript
cd functions
npm run build

# Deploy to Firebase
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:processCourseWithGemini,processMaterialWithGemini
```

### Step 4: Update Client Code

Create a new service file to call the Firebase Functions:

**File: `src/services/geminiProxyService.ts`**

```typescript
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '../config/firestore';

interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  useMaterialKey?: boolean;
}

interface GeminiResponse {
  success: boolean;
  text: string;
  usageMetadata?: any;
}

/**
 * Call Gemini for course/syllabus processing (server-side)
 */
export const callGeminiForCourse = async (
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> => {
  const processCourseWithGemini = httpsCallable<GeminiRequest, GeminiResponse>(
    functions,
    'processCourseWithGemini'
  );

  try {
    const result = await processCourseWithGemini({
      prompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    if (!result.data.success) {
      throw new Error('Gemini processing failed');
    }

    return result.data.text;
  } catch (error: any) {
    console.error('Gemini proxy error:', error);
    
    // Handle specific Firebase Function errors
    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to use AI features');
    }
    if (error.code === 'resource-exhausted') {
      throw new Error('API rate limit exceeded. Please try again in a few minutes.');
    }
    if (error.code === 'failed-precondition') {
      throw new Error(error.message || 'API key configuration error');
    }
    
    throw new Error(`AI processing failed: ${error.message}`);
  }
};

/**
 * Call Gemini for material import processing (server-side)
 */
export const callGeminiForMaterial = async (
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> => {
  const processMaterialWithGemini = httpsCallable<GeminiRequest, GeminiResponse>(
    functions,
    'processMaterialWithGemini'
  );

  try {
    const result = await processMaterialWithGemini({
      prompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      useMaterialKey: true,
    });

    if (!result.data.success) {
      throw new Error('Material processing failed');
    }

    return result.data.text;
  } catch (error: any) {
    console.error('Material proxy error:', error);
    
    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to use AI features');
    }
    if (error.code === 'resource-exhausted') {
      throw new Error('API rate limit exceeded. Please try again in a few minutes.');
    }
    if (error.code === 'failed-precondition') {
      throw new Error(error.message || 'API key configuration error');
    }
    
    throw new Error(`Material processing failed: ${error.message}`);
  }
};
```

### Step 5: Update Existing Services to Use Proxy

**Update `src/services/geminiService.ts`:**

```typescript
// OLD (INSECURE):
import { GoogleGenerativeAI } from '@google/generative-ai';

constructor(apiKey: string) {
  this.genAI = new GoogleGenerativeAI(apiKey);
  // ... direct API calls
}

// NEW (SECURE):
import { callGeminiForCourse } from './geminiProxyService';

async processSyllabusText(text: string) {
  const prompt = `Process this syllabus: ${text}`;
  const response = await callGeminiForCourse(prompt, {
    temperature: 0.1,
    maxTokens: 16384
  });
  return JSON.parse(response);
}
```

**Update `src/services/materialImportService.ts`:**

```typescript
// OLD (INSECURE):
constructor(apiKey: string) {
  this.genAI = new GoogleGenerativeAI(apiKey);
}

// NEW (SECURE):
import { callGeminiForMaterial } from './geminiProxyService';

async processSingleMaterial(text: string) {
  const prompt = `Process this material: ${text}`;
  const response = await callGeminiForMaterial(prompt, {
    temperature: 0.2,
    maxTokens: 16384
  });
  return JSON.parse(response);
}
```

### Step 6: Remove Client-Side API Keys

**Update `.env` file - REMOVE VITE_ prefix:**

```bash
# OLD (gets bundled into JavaScript):
VITE_GEMINI_COURSE_API_KEY=AIzaSy...  # ❌ EXPOSED
VITE_GEMINI_MATERIAL_API_KEY=AIzaSy...  # ❌ EXPOSED

# NEW (not bundled, but not needed anyway since we use Functions):
# Just remove these lines entirely, or keep without VITE_ for local dev only
GEMINI_COURSE_API_KEY=for_local_dev_only
GEMINI_MATERIAL_API_KEY=for_local_dev_only
```

### Step 7: Revoke Exposed Keys

**CRITICAL:** Delete the exposed keys from Google AI Studio:

1. Go to https://ai.google.dev
2. Find the keys that were exposed in the GitHub alert
3. **Delete them immediately**
4. Generate NEW keys
5. Set the NEW keys ONLY in Firebase config (Step 2)

### Step 8: Build and Deploy Client

```bash
# Build your app
npm run build

# Check that NO API keys are in the build
grep -r "AIzaSy" dist/
# Should return: No matches (or only Firebase config API key which is safe)

# Deploy
firebase deploy
```

---

## 🔍 Verification

### Check 1: No Keys in Build
```bash
npm run build
grep -r "AIzaSy" dist/assets/
# Should find ONLY Firebase config key (VITE_API_KEY for Firebase itself)
# Should NOT find Gemini keys
```

### Check 2: Functions Are Deployed
```bash
firebase functions:list
# Should show:
# - processCourseWithGemini
# - processMaterialWithGemini
```

### Check 3: Test in Browser
```javascript
// Open browser console on your deployed site
// Try to find API key (should fail)
window.location = 'view-source:' + window.location.href
// Search for "AIzaSy" - should only find Firebase API key, not Gemini keys
```

---

## 📊 Before vs After

### Before (INSECURE) ❌
```
src/services/geminiService.ts:
  const key = import.meta.env.VITE_GEMINI_COURSE_API_KEY

dist/assets/index-abc123.js:
  VITE_GEMINI_COURSE_API_KEY:"AIzaSyXXXXXX"  ← EXPOSED!

GitHub Security Alert: ⚠️ Secret detected!
```

### After (SECURE) ✅
```
functions/src/index.ts:
  const key = functions.config().gemini.course_key  ← Server-side only

dist/assets/index-abc123.js:
  (no Gemini keys present)

GitHub Security Alert: ✅ No secrets detected
```

---

## 🎯 Benefits

1. **🔒 Secure**: API keys never leave your server
2. **🛡️ Protected**: GitHub won't detect keys in your code
3. **📊 Trackable**: Monitor usage per user in Firebase Functions logs
4. **⚡ Rate Limiting**: Can add per-user rate limiting easily
5. **🔄 Rotatable**: Change keys without redeploying frontend
6. **✅ Compliant**: Follows security best practices

---

## 🆘 Troubleshooting

### Error: "Gemini API key not configured"
```bash
# Check Firebase config
firebase functions:config:get

# If empty, set the keys
firebase functions:config:set gemini.course_key="YOUR_KEY"
```

### Error: "Function not found"
```bash
# Make sure functions are deployed
firebase deploy --only functions

# Check they're live
firebase functions:list
```

### Error: "unauthenticated"
Make sure your user is signed in before calling AI features.

### Keys still showing in build
```bash
# Make sure you REMOVED VITE_ prefix
# Or better yet, remove the env variables entirely
```

---

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

---

## ✅ Checklist

- [ ] Install `@google/genai` in functions
- [ ] Set API keys in Firebase config (NOT .env)
- [ ] Deploy Firebase Functions
- [ ] Create `geminiProxyService.ts` 
- [ ] Update `geminiService.ts` to use proxy
- [ ] Update `materialImportService.ts` to use proxy
- [ ] Remove `VITE_GEMINI_*` from `.env`
- [ ] **Revoke exposed keys** from Google AI Studio
- [ ] Generate new keys
- [ ] Build and verify no keys in dist/
- [ ] Deploy to production
- [ ] Test in browser
- [ ] Monitor GitHub for security alerts (should be clear)

---

**Time to complete:** ~30 minutes  
**Difficulty:** Intermediate  
**Priority:** 🚨 **CRITICAL** - Do this ASAP to secure your API keys!

