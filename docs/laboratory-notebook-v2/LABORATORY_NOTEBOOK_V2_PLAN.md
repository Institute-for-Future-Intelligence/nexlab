# Laboratory Notebook v2 - Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing Laboratory Notebook v2, a modern mind-map style interface for managing experimental designs, builds, and tests. The new implementation will provide a visual, intuitive way to understand the relationships between projects while maintaining the hierarchical data structure.

## Goals & Requirements

### Primary Goals
1. **Visual Mind-Map Interface**: Replace nested hierarchical view with an interactive node-based visualization
2. **Modern UX/UI**: Sleek, intuitive interface using the existing design system
3. **Scalable Architecture**: Modular, maintainable code following React and Zustand best practices
4. **Preserve Data Model**: Keep existing Firestore structure (designs, builds, tests)
5. **Non-Breaking**: Implement alongside existing Laboratory Notebook without disruption

### Key Features
- Interactive node-based canvas with pan/zoom
- Visual connectors showing Design → Build → Test relationships
- Inline editing capabilities on nodes
- Modal/panel system for detailed CRUD operations
- Real-time updates from Firestore
- Course filtering and organization
- Search and filter capabilities
- Responsive design for mobile/tablet/desktop

## Architecture Overview

### Technology Stack
```
├── React 18+ (with TypeScript)
├── React Flow (for node-based visualization)
├── Zustand (state management)
├── Firebase Firestore (database)
├── Material-UI (component library)
└── Existing Design System
```

### Component Hierarchy
```
LaboratoryNotebookV2/
├── index.tsx                          # Main container
├── components/
│   ├── Canvas/
│   │   ├── LabCanvas.tsx             # React Flow canvas wrapper
│   │   ├── CanvasControls.tsx       # Zoom, fit view, layout controls
│   │   └── CanvasBackground.tsx     # Grid/dot background
│   ├── Nodes/
│   │   ├── DesignNode.tsx           # Design visualization node
│   │   ├── BuildNode.tsx            # Build visualization node
│   │   ├── TestNode.tsx             # Test visualization node
│   │   └── NodeBase.tsx             # Shared node wrapper
│   ├── Panels/
│   │   ├── DetailPanel.tsx          # Sliding panel for details
│   │   ├── CreatePanel.tsx          # Create new entities
│   │   ├── EditPanel.tsx            # Edit existing entities
│   │   └── FilterPanel.tsx          # Filter and search
│   ├── Toolbar/
│   │   ├── LabToolbar.tsx           # Main toolbar
│   │   ├── ViewControls.tsx         # Layout/view options
│   │   └── CourseFilter.tsx         # Course selection
│   └── Modals/
│       ├── DeleteConfirmation.tsx   # Delete confirmation
│       └── BulkActions.tsx          # Batch operations
├── hooks/
│   ├── useLabNotebook.tsx           # Main data hook
│   ├── useNodeLayout.tsx            # Auto-layout logic
│   └── useNodeInteraction.tsx       # Node click/drag handlers
├── services/
│   └── labNotebookService.ts        # Firestore CRUD operations
├── stores/
│   └── labNotebookStore.ts          # Zustand store
├── types/
│   └── labNotebook.ts               # TypeScript types
└── utils/
    ├── layoutAlgorithm.ts           # Node positioning
    └── nodeHelpers.ts               # Node utility functions
```

## Data Model

### Existing Firestore Structure (Preserved)
```typescript
// Collection: designs
interface Design {
  id: string;
  title: string;
  description: string;
  course: string;
  dateCreated: Timestamp;
  dateModified: Timestamp;
  userId: string;
  images: Image[];
  files: FileDetails[];
}

// Collection: builds
interface Build {
  id: string;
  title: string;
  description: string;
  design_ID: string;      // Foreign key to design
  dateCreated: Timestamp;
  userId: string;
  images: Image[];
  files: FileDetails[];
}

// Collection: tests
interface Test {
  id: string;
  title: string;
  description: string;
  results: string;
  conclusions: string;
  build_ID: string;       // Foreign key to build
  design_ID: string;      // Foreign key to design
  dateCreated: Timestamp;
  userId: string;
  images: Image[];
  files: FileDetails[];
}
```

### New In-Memory Structure for Visualization
```typescript
// Node representation for React Flow
interface LabNode {
  id: string;
  type: 'design' | 'build' | 'test';
  position: { x: number; y: number };
  data: DesignData | BuildData | TestData;
}

// Edge representation
interface LabEdge {
  id: string;
  source: string;      // parent node id
  target: string;      // child node id
  type: 'smoothstep' | 'bezier';
  animated?: boolean;
}

// Graph structure
interface LabGraph {
  nodes: LabNode[];
  edges: LabEdge[];
  selectedNodeId: string | null;
  layoutType: 'horizontal' | 'vertical' | 'radial';
}
```

## State Management (Zustand Store)

### Store Structure
```typescript
interface LabNotebookStore {
  // Data state
  designs: Design[];
  builds: Build[];
  tests: Test[];
  
  // Graph state
  nodes: LabNode[];
  edges: LabEdge[];
  selectedNodeId: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  activePanel: 'detail' | 'create' | 'edit' | 'filter' | null;
  layoutType: 'horizontal' | 'vertical' | 'radial';
  selectedCourse: string | null;
  searchQuery: string;
  
  // View state
  viewMode: 'graph' | 'list';
  zoomLevel: number;
  centerPosition: { x: number; y: number };
  
  // Actions - Data operations
  fetchAllData: (userId: string) => Promise<void>;
  createDesign: (design: Omit<Design, 'id'>) => Promise<string>;
  updateDesign: (id: string, updates: Partial<Design>) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  
  createBuild: (build: Omit<Build, 'id'>) => Promise<string>;
  updateBuild: (id: string, updates: Partial<Build>) => Promise<void>;
  deleteBuild: (id: string) => Promise<void>;
  
  createTest: (test: Omit<Test, 'id'>) => Promise<string>;
  updateTest: (id: string, updates: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  
  // Actions - Graph operations
  buildGraph: () => void;
  selectNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  autoLayout: () => void;
  
  // Actions - UI operations
  setActivePanel: (panel: 'detail' | 'create' | 'edit' | 'filter' | null) => void;
  setLayoutType: (type: 'horizontal' | 'vertical' | 'radial') => void;
  setSelectedCourse: (courseId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'graph' | 'list') => void;
}
```

## User Interface Design

### Main Canvas Layout
```
┌─────────────────────────────────────────────────────────┐
│ Toolbar                                                  │
│ [Course Filter] [Search] [Add Design] [Layout] [View]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Canvas Area (React Flow)                              │
│                                                          │
│    ┌──────────┐                                         │
│    │ Design 1 │───┐                                     │
│    └──────────┘   │                                     │
│                   ↓                                     │
│            ┌──────────┐         ┌──────────┐           │
│            │ Build 1  │────────→│  Test 1  │           │
│            └──────────┘         └──────────┘           │
│                   │                                     │
│                   ↓                                     │
│            ┌──────────┐                                 │
│            │ Build 2  │                                 │
│            └──────────┘                                 │
│                                                          │
├──────────────────────────────────────────────┬──────────┤
│ Controls: [Zoom In] [Zoom Out] [Fit View]   │ [Panel]  │
└──────────────────────────────────────────────┴──────────┘
```

### Node Design
Each node will have:
- **Color coding** by type (Design: Primary blue, Build: Green, Test: Orange)
- **Title** prominently displayed
- **Status indicators** (date, file count, image count)
- **Action buttons** (view, edit, delete) on hover
- **Compact view** by default, expandable on selection
- **Visual feedback** on interaction (hover, select, drag)

### Panel System
Sliding panels from the right side for:
1. **Detail Panel**: View full information
2. **Create Panel**: Add new design/build/test
3. **Edit Panel**: Modify existing entities
4. **Filter Panel**: Search and filter options

## Layout Algorithm

### Auto-Layout Strategy
1. **Horizontal Layout** (Default)
   - Designs on left
   - Builds in middle
   - Tests on right
   - Vertical spacing between items of same type

2. **Vertical Layout**
   - Designs on top
   - Builds in middle
   - Tests on bottom
   - Horizontal spacing between items

3. **Radial Layout**
   - Designs in center
   - Builds in inner ring
   - Tests in outer ring
   - Circular arrangement

### Implementation
```typescript
// Dagre or ELK for automatic graph layout
// Custom algorithm for radial layout
// Save user's manual positioning to localStorage
```

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- ✓ Create branch and project structure
- Set up types and interfaces
- Create Zustand store
- Set up basic routing
- Create main container component

### Phase 2: Core Visualization (Days 3-4)
- Implement React Flow canvas
- Create node components (Design, Build, Test)
- Implement basic graph building from data
- Add pan/zoom controls
- Implement auto-layout algorithm

### Phase 3: Data Integration (Days 5-6)
- Create Firestore service layer
- Implement data fetching
- Connect store to Firestore
- Add real-time updates
- Implement CRUD operations

### Phase 4: Interaction & UI (Days 7-8)
- Create panel system
- Implement node selection
- Add detail view panel
- Create/Edit panels with forms
- Add delete confirmation

### Phase 5: Advanced Features (Days 9-10)
- Course filtering
- Search functionality
- Multiple layout options
- Drag-and-drop reordering
- Bulk operations

### Phase 6: Polish & Testing (Days 11-12)
- Responsive design
- Mobile optimization
- Error handling
- Loading states
- Performance optimization
- User testing

## Design System Integration

### Colors
```typescript
// Node colors
const nodeColors = {
  design: {
    bg: colors.primary[50],
    border: colors.primary[500],
    text: colors.text.primary,
    hover: colors.primary[100],
  },
  build: {
    bg: colors.secondary[50],
    border: colors.secondary[500],
    text: colors.text.primary,
    hover: colors.secondary[100],
  },
  test: {
    bg: '#FFF7ED', // Orange tint
    border: colors.warning,
    text: colors.text.primary,
    hover: '#FFEDD5',
  },
};

// Edge colors
const edgeColors = {
  default: colors.neutral[300],
  hover: colors.primary[500],
  selected: colors.primary[600],
};
```

### Typography
- Node titles: `typography.fontFamily.display`, `fontSize.lg`, `fontWeight.semibold`
- Node metadata: `typography.fontFamily.primary`, `fontSize.sm`, `fontWeight.normal`
- Panel headers: `typography.fontFamily.display`, `fontSize['2xl']`, `fontWeight.bold`

### Spacing & Sizing
- Node padding: `spacing[4]`
- Node gap: `spacing[6]`
- Panel width: `480px`
- Toolbar height: `72px`

## Best Practices

### React
1. Use functional components with hooks
2. Implement proper memoization (useMemo, useCallback)
3. Split large components into smaller, reusable pieces
4. Use TypeScript for type safety
5. Implement proper error boundaries
6. Follow component composition patterns

### Zustand
1. Use devtools middleware for debugging
2. Use persist middleware for view preferences
3. Keep actions co-located with state
4. Implement optimistic updates
5. Handle async operations properly
6. Use selectors to prevent unnecessary re-renders

### Firestore
1. Use proper query optimization
2. Implement pagination for large datasets
3. Handle real-time subscriptions properly
4. Clean up listeners on unmount
5. Batch write operations when possible
6. Use transactions for related updates

### Performance
1. Virtualize large graphs (React Flow handles this)
2. Debounce search inputs
3. Lazy load images and files
4. Implement proper loading states
5. Use React.memo for expensive components
6. Profile and optimize render cycles

## Testing Strategy

### Unit Tests
- Store actions and reducers
- Utility functions (layout algorithm)
- Node helper functions
- Data transformation functions

### Integration Tests
- Firestore service operations
- Store + service interaction
- Component interaction with store

### E2E Tests
- Create design → build → test flow
- Edit and delete operations
- Course filtering
- Search functionality

## Accessibility

1. **Keyboard Navigation**
   - Tab through nodes
   - Arrow keys to navigate
   - Enter to select/open
   - Delete key to remove (with confirmation)

2. **Screen Readers**
   - Proper ARIA labels
   - Descriptive node content
   - Announce state changes

3. **Visual**
   - High contrast colors
   - Focus indicators
   - Readable font sizes

## Mobile Considerations

1. **Touch Interactions**
   - Touch to select node
   - Pinch to zoom
   - Two-finger pan
   - Long press for context menu

2. **Responsive Layout**
   - Collapsed toolbar on mobile
   - Full-screen panels
   - Simplified node view
   - Touch-friendly controls

## Migration Path

1. Keep existing `/laboratory-notebooks` route functional
2. Add new `/laboratory-notebook` route for v2
3. Users can choose which interface to use
4. Gradually encourage migration to v2
5. Collect feedback and iterate
6. Eventually deprecate v1 (optional)

## Success Metrics

1. **User Engagement**
   - Time spent on page
   - Number of interactions
   - Feature adoption rate

2. **Performance**
   - Page load time < 2s
   - Smooth 60fps interactions
   - Efficient Firestore queries

3. **Usability**
   - Reduced time to create design/build/test
   - Fewer errors in workflow
   - Positive user feedback

## Next Steps

1. ✓ Create implementation plan (this document)
2. Review and approve architecture
3. Set up dependencies (React Flow)
4. Begin Phase 1 implementation
5. Iterate based on feedback

## Dependencies to Add

```json
{
  "reactflow": "^11.10.0",
  "dagre": "^0.8.5",
  "@types/dagre": "^0.7.52"
}
```

## Files to Create

1. `/src/components/LaboratoryNotebookV2/` - Main component directory
2. `/src/stores/labNotebookStore.ts` - Zustand store
3. `/src/types/labNotebook.ts` - TypeScript types
4. `/src/services/labNotebookService.ts` - Firestore service
5. `/src/hooks/useLabNotebook.tsx` - Main data hook
6. `/src/utils/layoutAlgorithm.ts` - Layout utilities

## Conclusion

This implementation will provide a modern, visual, and intuitive way to manage laboratory experiments while maintaining the robust data structure and following best practices for scalability and maintainability. The mind-map interface will make it easier to understand relationships between designs, builds, and tests, improving the overall user experience.

