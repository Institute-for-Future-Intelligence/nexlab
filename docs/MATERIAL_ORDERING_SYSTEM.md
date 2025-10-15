# Material Ordering System

## Overview
Materials use a `sequenceNumber` field to maintain consistent ordering across the application. This system is designed to be scalable, bug-free, and adaptable to future changes.

## How It Works

### 1. **Initial Creation from Syllabus**
When materials are created from a syllabus import, they receive sequential numbers:
```typescript
materials.forEach((material, index) => {
  const materialData = {
    // ... other fields
    sequenceNumber: index, // 0, 1, 2, 3, ...
  };
});
```

### 2. **Ordering in Queries**
To display materials in the correct order, query with `orderBy`:

```typescript
// Firestore query
const q = query(
  collection(db, 'materials'),
  where('course', '==', courseId),
  orderBy('sequenceNumber', 'asc'),  // Primary sort
  orderBy('timestamp', 'asc')        // Fallback for materials without sequenceNumber
);
```

### 3. **Handling Edge Cases**

#### Materials Without sequenceNumber
- **Old materials** (created before this feature): No `sequenceNumber` field
- **Manually added materials**: May not have `sequenceNumber`
- **Solution**: Fall back to `timestamp` ordering

#### Deleted Materials
- Deleting material #5 doesn't affect other materials
- Remaining materials keep their sequence numbers: 0, 1, 2, 3, 4, 6, 7, 8...
- **No gaps problem** - gaps are fine and expected!

#### New Materials Added Later
**Option A: Append to end**
```typescript
const maxSequence = Math.max(...existingMaterials.map(m => m.sequenceNumber || 0));
newMaterial.sequenceNumber = maxSequence + 1;
```

**Option B: Insert at specific position**
```typescript
// Insert between position 4 and 5
newMaterial.sequenceNumber = 4.5;  // 0, 1, 2, 3, 4, 4.5, 5, 6...
```

**Option C: Resequence all materials**
```typescript
// If you want clean integers again
materials.forEach((material, index) => {
  material.sequenceNumber = index;
});
```

### 4. **Manual Reordering**
When educators manually reorder materials:

```typescript
const reorderMaterials = async (materialId: string, newPosition: number) => {
  // Get current materials
  const materials = await getMaterials(courseId);
  
  // Update sequence numbers
  const batch = writeBatch(db);
  
  materials.forEach((material, index) => {
    let newSeq = index;
    if (material.id === materialId) {
      newSeq = newPosition;
    } else if (index >= newPosition) {
      newSeq = index + 1;
    }
    
    batch.update(doc(db, 'materials', material.id), {
      sequenceNumber: newSeq
    });
  });
  
  await batch.commit();
};
```

## Best Practices

### ✅ DO:
- Always include `sequenceNumber` when creating materials from syllabus
- Use `orderBy('sequenceNumber', 'asc')` for consistent display order
- Include fallback ordering: `orderBy('timestamp', 'asc')`
- Accept gaps in sequence numbers (0, 1, 3, 7, 10... is fine!)
- Use decimal numbers for insertions if needed (4.5, 10.25, etc.)

### ❌ DON'T:
- Don't rely solely on `timestamp` for ordering (materials can be created simultaneously)
- Don't try to "fix" gaps in sequence numbers automatically
- Don't update all materials' sequence numbers when deleting one
- Don't use strings for sequenceNumber (use numbers for proper sorting)

## Migration Strategy

### For Existing Materials
Materials created before this feature don't have `sequenceNumber`:

```typescript
// Optional: Add sequence numbers to existing materials
const addSequenceToExisting = async (courseId: string) => {
  const materials = await getDocs(
    query(
      collection(db, 'materials'),
      where('course', '==', courseId),
      orderBy('timestamp', 'asc')
    )
  );
  
  const batch = writeBatch(db);
  materials.docs.forEach((doc, index) => {
    if (!doc.data().sequenceNumber) {
      batch.update(doc.ref, { sequenceNumber: index });
    }
  });
  
  await batch.commit();
};
```

## Example Queries

### Get All Materials in Order
```typescript
const getMaterialsInOrder = async (courseId: string) => {
  const q = query(
    collection(db, 'materials'),
    where('course', '==', courseId),
    orderBy('sequenceNumber', 'asc'),
    orderBy('timestamp', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Get Only Published Materials in Order
```typescript
const getPublishedMaterials = async (courseId: string) => {
  const q = query(
    collection(db, 'materials'),
    where('course', '==', courseId),
    where('published', '==', true),
    orderBy('sequenceNumber', 'asc'),
    orderBy('timestamp', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

## Future Enhancements

### Drag-and-Drop Reordering
When implementing UI for reordering:
1. Get current materials with their sequence numbers
2. User drags material #3 to position #7
3. Update affected materials' sequence numbers
4. Use batch writes for atomic updates

### Section-Based Ordering
For courses with sections/modules:
```typescript
{
  sequenceNumber: 100,  // Section 1, Material 1
  sectionNumber: 1,
  sectionSequence: 0
}
{
  sequenceNumber: 101,  // Section 1, Material 2
  sectionNumber: 1,
  sectionSequence: 1
}
{
  sequenceNumber: 200,  // Section 2, Material 1
  sectionNumber: 2,
  sectionSequence: 0
}
```

### Scheduled Release with Ordering
Materials can have both scheduled timestamps AND sequence numbers:
- `sequenceNumber`: Logical order in course
- `scheduledTimestamp`: When material becomes available
- Display order: By `sequenceNumber`
- Visibility: Controlled by `scheduledTimestamp`

## Database Indexes

**Required Firestore Indexes:**
```
Collection: materials
- course (Ascending) + sequenceNumber (Ascending) + timestamp (Ascending)
- course (Ascending) + published (Ascending) + sequenceNumber (Ascending)
```

## Testing Checklist

- [ ] Materials from syllabus import display in correct order
- [ ] Deleting a material doesn't break ordering
- [ ] Adding new material appears in correct position
- [ ] Materials without sequenceNumber still display (fallback to timestamp)
- [ ] Reordering materials updates sequence numbers correctly
- [ ] Published/unpublished materials maintain order
- [ ] Multiple courses don't interfere with each other's ordering

---

**Implemented:** October 15, 2025  
**Branch:** `feat/syllabus-import-improvements`

