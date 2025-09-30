# Laboratory Notebook V2 - UX Restructure

## Changes Made

Based on user feedback, we've restructured the UX flow to provide a more intuitive two-level navigation system.

## New User Flow

### Before (Original Design)
- Single page showing ALL designs, builds, and tests in one giant mind-map
- Overwhelming for users with many designs
- No clear way to focus on a single design

### After (Improved Design)
1. **Main Page** (`/laboratory-notebook`)
   - Table view listing all designs
   - Summary statistics (build count, test count) for each design
   - Search and filter capabilities
   - Click on any design to drill down

2. **Design Detail Page** (`/laboratory-notebook/:designId`)
   - Mind-map view showing ONLY that specific design
   - Displays the design node + its builds + its tests
   - Breadcrumb navigation back to main page
   - Focused view for working on one experiment at a time

## Files Created/Modified

### New Files Created
1. **`DesignsTable.tsx`** (282 lines)
   - Table component showing all designs
   - Columns: Title, Description, Build Count, Test Count, Date, Actions
   - Click row to navigate to design detail
   - Responsive design (hides columns on mobile)
   - Shows course chips
   - Counts builds/tests dynamically

2. **`DesignDetailPage.tsx`** (197 lines)
   - Full-page view for a single design
   - Breadcrumb navigation (Home → Lab Notebook → Design Name)
   - Back button to return to table
   - React Flow canvas showing only that design's hierarchy
   - Design info header with title and description
   - DetailPanel for viewing node details

### Modified Files
1. **`index.tsx`** (main page)
   - Removed ReactFlowProvider (moved to design detail)
   - Replaced canvas with table view
   - Added summary stats card
   - Filtered designs based on search/course
   - Kept Create Panel for adding new designs

2. **`LabCanvas.tsx`**
   - Added `designIdFilter` prop
   - Filters nodes to show only specified design
   - Filters edges to match filtered nodes
   - Works for both full view and filtered view

3. **`routing.tsx`**
   - Added route: `/laboratory-notebook/:designId`
   - Lazy loads DesignDetailPage

## UI Components

### Main Page Table
```
┌─────────────────────────────────────────────────────────────────────┐
│ Laboratory Notebook                                                  │
│ Manage your experimental designs, builds, and tests                 │
├─────────────────────────────────────────────────────────────────────┤
│ [New Design] [🔍 Search] [Course ▼] [Graph View] [List View] [⚙]  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐                                                     │
│ │  Total: 5   │                                                     │
│ │  Designs    │                                                     │
│ └─────────────┘                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ Title            │ Description  │ Builds │ Tests │ Date     │ Actions│
│──────────────────┼──────────────┼────────┼───────┼──────────┼────────│
│ Design 1         │ Testing...   │   3    │   5   │ Jan 15   │  👁    │
│ Course: CHEM 315 │              │        │       │          │        │
│──────────────────┼──────────────┼────────┼───────┼──────────┼────────│
│ Design 2         │ Experiment.. │   2    │   3   │ Jan 10   │  👁    │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Detail Page
```
┌─────────────────────────────────────────────────────────────────────┐
│ Home › Laboratory Notebook › Design 1                               │
│                                                                      │
│ [← Back to Designs]  Design 1                                       │
│                      Testing new protocol                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     ┌──────────┐                                                    │
│     │ Design 1 │───┐                                                │
│     └──────────┘   │                                                │
│                    ↓                                                │
│             ┌──────────┐         ┌──────────┐                       │
│             │ Build 1  │────────→│  Test 1  │                       │
│             └──────────┘         └──────────┘                       │
│                    │                                                │
│                    ↓                                                │
│             ┌──────────┐                                            │
│             │ Build 2  │                                            │
│             └──────────┘                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Benefits of New Structure

### 1. **Better Organization**
- Clear separation between overview and detail
- Easy to see all designs at a glance
- Focused workspace when editing one design

### 2. **Improved Performance**
- Only loads nodes for one design at a time (detail view)
- Table view is much lighter than full graph
- Faster rendering and interactions

### 3. **Enhanced Usability**
- Users know exactly where they are (breadcrumbs)
- Easy navigation between designs
- Summary stats help users prioritize work

### 4. **Scalability**
- Works with 1 design or 100 designs
- Table pagination can be added easily
- Mind-map remains clean and focused

### 5. **Mobile Friendly**
- Table adapts by hiding columns
- Detail page works well on smaller screens
- Touch-friendly navigation

## Technical Implementation

### Filtering Logic
```typescript
// LabCanvas.tsx
const filteredStoreNodes = React.useMemo(() => {
  if (!designIdFilter) return storeNodes;

  return storeNodes.filter(node => {
    if (node.type === 'designNode') {
      return node.data.designId === designIdFilter;
    }
    if (node.type === 'buildNode') {
      return node.data.designId === designIdFilter;
    }
    if (node.type === 'testNode') {
      return node.data.designId === designIdFilter;
    }
    return false;
  });
}, [storeNodes, designIdFilter]);
```

### Routing
```typescript
// Main table view
/laboratory-notebook

// Design detail view (mind-map)
/laboratory-notebook/abc123 (where abc123 is the designId)
```

### Navigation Flow
```
Main Page (Table)
    │
    │ Click Row / View Button
    ↓
Design Detail Page (Mind-map)
    │
    │ Back Button / Breadcrumb
    ↓
Main Page (Table)
```

## Summary Statistics

### Table Features
- ✅ Shows all designs in organized table
- ✅ Build count per design
- ✅ Test count per design
- ✅ Date created
- ✅ Course chip
- ✅ Description preview (truncated)
- ✅ Click to view detail
- ✅ Search across all designs
- ✅ Filter by course
- ✅ Responsive layout

### Detail Page Features
- ✅ Shows only selected design's hierarchy
- ✅ Breadcrumb navigation
- ✅ Back button
- ✅ Full mind-map visualization
- ✅ All canvas features (pan, zoom, drag)
- ✅ Node click for detail panel
- ✅ Design info header

## User Testing Checklist

### Main Page
- [ ] Navigate to /laboratory-notebook
- [ ] See table of all designs
- [ ] See build/test counts
- [ ] Use search to filter
- [ ] Use course dropdown to filter
- [ ] Click row to navigate to design detail
- [ ] Click "New Design" to create

### Design Detail Page
- [ ] See breadcrumb navigation
- [ ] See design title and description
- [ ] See mind-map with only that design's nodes
- [ ] Click nodes to see details
- [ ] Drag nodes to reposition
- [ ] Use zoom and pan
- [ ] Click back button to return to table
- [ ] Click breadcrumb to navigate

## Future Enhancements

1. **Table Sorting**
   - Sort by title, date, build count, test count
   - Ascending/descending

2. **Table Pagination**
   - Show 10/25/50 designs per page
   - Performance improvement for large datasets

3. **Bulk Actions**
   - Select multiple designs
   - Delete, export, or move to different course

4. **Quick Stats**
   - Total builds across all designs
   - Total tests across all designs
   - Average builds per design

5. **Design Cards View**
   - Alternative to table
   - Card layout with thumbnails
   - Better for visual learners

## Status: ✅ Complete

The restructured UX is now fully implemented and ready for testing!

**Key Improvement**: Users now have a clear, intuitive workflow from overview (table) to focused work (mind-map), matching common UX patterns from tools like Notion, Trello, and Figma.

