# Firestore Indexes for Teach Mode
**Required indexes for ChatbotWithTeachMode component**

---

## 🔥 **Required Index**

The teach mode component queries teach sessions with:
- Filter by `userId`
- Filter by `chatbotId`
- Order by `startedAt` descending
- Limit to 50 results

This requires a **composite index**.

---

## 📝 **Index Configuration**

### **Option 1: Add via Firebase Console (Recommended)**

1. **Navigate to:** [Firebase Console](https://console.firebase.google.com)
2. **Select your project:** `nexlab-prod`
3. **Go to:** Firestore Database → Indexes tab
4. **Click:** "Create Index"
5. **Configure:**
   - **Collection:** `teachSessions`
   - **Fields to index:**
     1. `userId` - Ascending
     2. `chatbotId` - Ascending
     3. `startedAt` - Descending
   - **Query scope:** Collection
6. **Click:** "Create"

**Build time:** ~2-5 minutes

---

### **Option 2: Add via firestore.indexes.json**

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "teachSessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "chatbotId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy with Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

---

## 📊 **Data Structure**

### **Collection:** `teachSessions`

```typescript
{
  sessionId: string;        // Unique session ID from teach component
  chatbotId: string;        // Chatbot ID (e.g., "abc123")
  userId: string;           // User UID from Firebase Auth
  startedAt: string;        // ISO timestamp (e.g., "2026-01-29T10:30:00Z")
  mode: 'teach';            // Always 'teach' for this collection
}
```

**Example document:**
```json
{
  "sessionId": "sess_xyz789",
  "chatbotId": "chatbot_abc123",
  "userId": "user_def456",
  "startedAt": "2026-01-29T10:30:00.000Z",
  "mode": "teach"
}
```

---

## 🔍 **Query Being Run**

```typescript
const sessionsRef = collection(db, 'teachSessions');
const q = query(
  sessionsRef,
  where('userId', '==', userDetails.uid),
  where('chatbotId', '==', chatbotId),
  orderBy('startedAt', 'desc'),
  limit(50)
);
```

**Purpose:** Load user's last 50 teach sessions for a specific chatbot.

---

## ⚠️ **What Happens Without Index**

### **Before Index is Built:**
- ❌ Query will fail with error: `"The query requires an index"`
- ✅ Component handles gracefully: Falls back to empty array
- ✅ User can still start new teach sessions
- ✅ Sessions are saved but not loaded from history

### **After Index is Built:**
- ✅ Query succeeds
- ✅ Users can resume previous teach sessions
- ✅ Session picker shows in teach mode UI

---

## 🧪 **Testing**

### **Step 1: Deploy Component (Works Without Index)**
```bash
npm run dev
```
- Open chatbot
- Switch to Teach mode
- Start a teach session
- ✅ Session saves to Firestore

### **Step 2: Create Index**
- Follow "Option 1" above
- Wait 2-5 minutes for index to build

### **Step 3: Test Session Loading**
- Refresh page
- Open chatbot
- Switch to Teach mode
- ✅ Should see previous sessions in picker

---

## 📈 **Index Status**

Check index status in Firebase Console:
- **Building:** Yellow indicator, wait 2-5 minutes
- **Enabled:** Green checkmark, ready to use
- **Error:** Red, check configuration

---

## 💾 **Storage Estimates**

### **Index Size:**
- ~100 bytes per session
- 1,000 sessions ≈ 100 KB
- 10,000 sessions ≈ 1 MB

### **Query Cost:**
- 1 read per session returned
- Loading 50 sessions = 50 reads
- At $0.06 per 100K reads = $0.00003 per load

**Cost:** Negligible for typical usage.

---

## 🔐 **Security Rules**

Ensure your `firestore.rules` includes:

```javascript
match /teachSessions/{sessionId} {
  // Users can read their own teach sessions
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  
  // Users can create teach sessions
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  
  // Users cannot update or delete teach sessions
  allow update, delete: if false;
}
```

---

## 📚 **Related Collections**

### **For comparison:**

| Collection | Mode | IDs | Resumable |
|------------|------|-----|-----------|
| `conversations` | Chat | Conversation IDs | ❌ No |
| `teachSessions` | Teach | Session IDs | ✅ Yes |

**Key Difference:** Teach sessions are persistent and resumable, conversations are not.

---

## 🚀 **Deployment Checklist**

Before going to production:
- [ ] Create Firestore index for teachSessions
- [ ] Wait for index to finish building (2-5 minutes)
- [ ] Test session loading in dev environment
- [ ] Verify Firestore security rules include teachSessions
- [ ] Deploy to production
- [ ] Monitor logs for any query errors

---

## 🐛 **Troubleshooting**

### **Error: "The query requires an index"**
**Solution:** Create the index (see "Option 1" above)

### **Error: "Missing or insufficient permissions"**
**Solution:** Update Firestore security rules (see "Security Rules" section)

### **Sessions don't appear in picker**
**Check:**
1. Index is built (green checkmark in console)
2. User has previous teach sessions saved
3. Browser console for errors
4. Firestore rules allow read access

---

**Created:** January 29, 2026  
**Status:** Index creation required before production  
**Priority:** Medium (feature works without, but history won't load)
