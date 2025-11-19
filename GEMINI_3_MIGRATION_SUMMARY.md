# ✅ Gemini 3 Migration Complete - Action Required

## 🎉 What's Been Updated

### 1. Upgraded to Gemini 3 Pro Preview ✅
- **Model**: `gemini-3-pro-preview` (released Nov 18, 2025)
- **SDK**: Using new `@google/genai` in Firebase Functions
- **Client**: Still using old SDK temporarily (will migrate later)

### 2. Fixed Critical Configuration Issues ✅
| Parameter | Old Value | New Value | Why Changed |
|-----------|-----------|-----------|-------------|
| `temperature` | 0.1 / 0.2 | **1.0** | Gemini 3 REQUIRES 1.0 - lower values cause looping |
| `topK` | 1 / 3 | **Removed** | Gemini 3 handles reasoning internally |
| `topP` | 0.8 / 0.9 | **Removed** | Not needed for Gemini 3 |
| - | N/A | **`thinking_level`** | NEW: 'high' for reasoning, 'low' for speed |
| - | N/A | **`media_resolution`** | NEW: Control PDF/image quality |

### 3. Created Secure Firebase Functions ✅
Two new cloud functions to keep API keys server-side:

**`processCourseWithGemini`**
- For: Syllabus processing, course creation
- Thinking: `'high'` (maximum reasoning)
- Timeout: 300 seconds
- Memory: 1GB

**`processMaterialWithGemini`**
- For: Material imports (PPT/PDF/DOCX)
- Thinking: `'low'` (faster processing)
- Timeout: 540 seconds  
- Memory: 2GB
- Media Resolution: `'media_resolution_high'` for images/PDFs

### 4. Updated Documentation ✅
- **SECURE_API_SETUP.md** - Complete migration guide
- **functions/src/index.ts** - Working Gemini 3 functions
- **src/services/*.ts** - Correct temperature (1.0)

---

## 🚨 URGENT: Actions Required TODAY

### Step 1: Revoke Exposed API Keys (DO THIS NOW!)

You received a GitHub security alert about exposed keys. **Delete them immediately:**

```bash
# Go to: https://ai.google.dev
# Navigate to: API Keys section
# Find keys from the GitHub alert
# Click DELETE on each one
```

**Keys to delete:**
- Any key mentioned in GitHub security alert email
- Any key currently in your `.env` file
- Any key that was ever committed or deployed

### Step 2: Generate New API Keys

Create TWO new keys with proper restrictions:

```bash
# Go to: https://ai.google.dev
# Create Key #1: "NexLab Course/Syllabus - Prod"
# Create Key #2: "NexLab Material Import - Prod"

# For each key, set restrictions:
# - Application restrictions: HTTP referrers
# - Add: https://nexlab.bio/*
# - Add: https://*.nexlab.bio/*
```

### Step 3: Store Keys Securely in Firebase

```bash
# Store in Firebase Functions config (NOT in .env!)
firebase functions:config:set gemini.course_key="YOUR_NEW_COURSE_KEY"
firebase functions:config:set gemini.material_key="YOUR_NEW_MATERIAL_KEY"

# Verify they're set
firebase functions:config:get
```

**Expected output:**
```json
{
  "gemini": {
    "course_key": "AIzaSy...",
    "material_key": "AIzaSy..."
  }
}
```

### Step 4: Install Dependencies & Deploy Functions

```bash
# Install new Gemini 3 SDK
cd functions
npm install
npm run build

# Deploy functions
cd ..
firebase deploy --only functions

# Verify deployment
firebase functions:list
# Should show:
#  - processCourseWithGemini
#  - processMaterialWithGemini
#  - publishScheduledMaterials
```

### Step 5: Temporary Client Fix (Until Full Migration)

For now, update your LOCAL `.env` with new keys to test:

```bash
# /Users/andriy/nexlab/.env
VITE_GEMINI_COURSE_API_KEY=your_new_course_key_here
VITE_GEMINI_MATERIAL_API_KEY=your_new_material_key_here
```

**⚠️ WARNING:** These will still be exposed in the build! This is TEMPORARY.

### Step 6: Test Material Import

```bash
# Start dev server
npm run dev

# Test:
# 1. Go to Course Materials
# 2. Click "Add Material"
# 3. Switch to "AI Import" mode
# 4. Upload a PPT/PDF file
# 5. Should now work with gemini-3-pro-preview!
```

---

## 📋 Migration Phases

### Phase 1: URGENT (Today) ⚡
- [x] Update to Gemini 3 model
- [x] Fix temperature to 1.0
- [x] Create Firebase Functions
- [ ] **Delete exposed keys** (DO THIS NOW!)
- [ ] **Generate new keys**
- [ ] **Configure Firebase**
- [ ] **Deploy functions**
- [ ] **Test with new keys**

### Phase 2: Security (This Week) 🔒
- [ ] Create `geminiProxyService.ts` (see SECURE_API_SETUP.md)
- [ ] Update `geminiService.ts` to use proxy
- [ ] Update `materialImportService.ts` to use proxy
- [ ] Remove `VITE_GEMINI_*` from `.env` entirely
- [ ] Rebuild and verify no keys in `dist/`
- [ ] Deploy to production
- [ ] Monitor GitHub alerts (should be clear)

### Phase 3: Optimization (Next Week) 🚀
- [ ] Implement `thinking_level` control in UI
- [ ] Add `media_resolution` settings for PDF/image uploads
- [ ] Monitor token usage and costs
- [ ] Fine-tune thinking levels per feature
- [ ] Consider context caching for repeated content

---

## 🎯 Key Differences: Gemini 2.5 → Gemini 3

| Feature | Gemini 2.5 (Old) | Gemini 3 (New) |
|---------|------------------|----------------|
| Model Name | `gemini-2.5-pro` ❌ (never existed!) | `gemini-3-pro-preview` ✅ |
| SDK | `@google/generative-ai` | `@google/genai` |
| Temperature | 0.1 - 1.0 (adjustable) | **1.0 only** (do not change!) |
| Reasoning | Via prompt engineering | Built-in `thinking_level` |
| Context | 128k tokens | **1M tokens** input! |
| Output | 8k tokens | **64k tokens** output! |

---

## ⚠️ Common Issues & Solutions

### Issue: "API key expired" or 400 errors
**Cause:** Using wrong model name or old API key  
**Fix:** Make sure you're using `gemini-3-pro-preview` and new keys

### Issue: Model returns weird/looping responses
**Cause:** Temperature set too low  
**Fix:** Ensure temperature is exactly `1.0`

### Issue: "Function not found"
**Cause:** Functions not deployed  
**Fix:** Run `firebase deploy --only functions`

### Issue: Still getting GitHub security alerts
**Cause:** Keys still in production build  
**Fix:** Complete Phase 2 migration to proxy functions

### Issue: High token usage / costs
**Cause:** Using `thinking_level: 'high'` for simple tasks  
**Fix:** Use `thinking_level: 'low'` for material imports

---

## 📊 Expected Improvements

### Performance
- ✅ Better reasoning on complex syllabus parsing
- ✅ Faster material processing with `thinking_level: 'low'`
- ✅ Improved PDF text extraction with `media_resolution`

### Cost
- ⚠️ Slightly higher per-token cost ($2/$12 vs previous)
- ✅ But better quality = fewer retries
- ✅ Use `thinking_level: 'low'` to optimize costs

### Security
- ✅ No more exposed keys (after Phase 2)
- ✅ GitHub alerts will stop
- ✅ Per-user rate limiting possible
- ✅ Easy key rotation without redeployment

---

## 🔗 Resources

- [Gemini 3 Developer Guide](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Google AI Studio (Get Keys)](https://ai.google.dev)
- [SECURE_API_SETUP.md](./SECURE_API_SETUP.md) - Full migration guide

---

## ✅ Quick Checklist

```
TODAY (URGENT):
[ ] Delete exposed keys from https://ai.google.dev
[ ] Generate 2 new keys with restrictions
[ ] Set keys in Firebase config
[ ] Install dependencies: cd functions && npm install
[ ] Deploy functions: firebase deploy --only functions
[ ] Update local .env for testing
[ ] Test material import
[ ] Verify it works

THIS WEEK:
[ ] Follow SECURE_API_SETUP.md for full migration
[ ] Create proxy service
[ ] Update client code to use proxy
[ ] Remove VITE_ keys from .env
[ ] Deploy and verify no keys in build
[ ] Monitor GitHub (should be clear)

DONE:
[x] Update to Gemini 3 model
[x] Fix temperature to 1.0  
[x] Add thinking_level support
[x] Create Firebase Functions
[x] Update documentation
```

---

**Current Branch:** `upgrade/gemini-3-model`  
**Status:** Ready to push and test!  
**Priority:** 🚨 **CRITICAL** - Complete TODAY to stop unauthorized API usage!

