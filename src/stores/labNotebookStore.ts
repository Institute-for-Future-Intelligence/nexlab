// src/stores/labNotebookStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Design, Image, FileDetails } from '../types/types';
import { Build, Test } from '../types/dashboard';
import { Timestamp } from 'firebase/firestore';
import {
  LabNode,
  LabEdge,
  LabGraph,
  PanelType,
  LayoutType,
  ViewMode,
  FilterState,
  CreateDesignInput,
  CreateBuildInput,
  CreateTestInput,
  UpdateDesignInput,
  UpdateBuildInput,
  UpdateTestInput,
  DesignNodeData,
  BuildNodeData,
  TestNodeData,
  ViewportState,
  GraphMetrics,
} from '../types/labNotebook';

// Helper function to convert Firestore timestamp to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date();
};

/**
 * Laboratory Notebook V2 Store
 * Manages state for the mind-map style interface
 */

interface LabNotebookState {
  // ============================================================================
  // Data State
  // ============================================================================
  designs: Design[];
  builds: Build[];
  tests: Test[];
  
  // ============================================================================
  // Graph State
  // ============================================================================
  nodes: LabNode[];
  edges: LabEdge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  
  // ============================================================================
  // UI State
  // ============================================================================
  isLoading: boolean;
  error: string | null;
  activePanel: PanelType;
  layoutType: LayoutType;
  viewMode: ViewMode;
  isExpanded: boolean;
  deleteDialog: {
    open: boolean;
    nodeId: string | null;
    nodeType: 'build' | 'test' | null;
    nodeName: string | null;
  };
  
  // ============================================================================
  // Filter State
  // ============================================================================
  filters: FilterState;
  
  // ============================================================================
  // Viewport State
  // ============================================================================
  viewport: ViewportState;
  
  // ============================================================================
  // Data Actions
  // ============================================================================
  
  // Fetch all data
  fetchAllData: (userId: string, isAdmin?: boolean, courses?: string[]) => Promise<void>;
  
  // Design actions
  setDesigns: (designs: Design[]) => void;
  addDesign: (design: Design) => void;
  updateDesignLocal: (id: string, updates: Partial<Design>) => void;
  removeDesign: (id: string) => void;
  
  // Build actions
  setBuilds: (builds: Build[]) => void;
  addBuild: (build: Build) => void;
  updateBuildLocal: (id: string, updates: Partial<Build>) => void;
  removeBuild: (id: string) => void;
  
  // Test actions
  setTests: (tests: Test[]) => void;
  addTest: (test: Test) => void;
  updateTestLocal: (id: string, updates: Partial<Test>) => void;
  removeTest: (id: string) => void;
  
  // ============================================================================
  // Graph Actions
  // ============================================================================
  
  buildGraph: () => void;
  selectNode: (nodeId: string | null) => void;
  setHoveredNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  resetGraph: () => void;
  
  // ============================================================================
  // UI Actions
  // ============================================================================
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActivePanel: (panel: PanelType) => void;
  setLayoutType: (type: LayoutType) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsExpanded: (expanded: boolean) => void;
  openDeleteDialog: (nodeId: string, nodeType: 'build' | 'test', nodeName: string) => void;
  closeDeleteDialog: () => void;
  confirmDelete: () => Promise<void>;
  
  // ============================================================================
  // Filter Actions
  // ============================================================================
  
  setSelectedCourse: (courseId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  toggleNodeTypeFilter: (type: 'designs' | 'builds' | 'tests') => void;
  resetFilters: () => void;
  
  // ============================================================================
  // Viewport Actions
  // ============================================================================
  
  setViewport: (viewport: ViewportState) => void;
  resetViewport: () => void;
  
  // ============================================================================
  // Utility Actions
  // ============================================================================
  
  getGraphMetrics: () => GraphMetrics;
  getNodeById: (nodeId: string) => LabNode | undefined;
  getDesignById: (designId: string) => Design | undefined;
  getBuildById: (buildId: string) => Build | undefined;
  getTestById: (testId: string) => Test | undefined;
  getBuildsByDesignId: (designId: string) => Build[];
  getTestsByBuildId: (buildId: string) => Test[];
  
  // Reset store
  reset: () => void;
}

const initialFilterState: FilterState = {
  courseId: null,
  searchQuery: '',
  dateRange: {
    start: null,
    end: null,
  },
  nodeTypes: {
    designs: true,
    builds: true,
    tests: true,
  },
};

const initialViewportState: ViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
};

export const useLabNotebookStore = create<LabNotebookState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        designs: [],
        builds: [],
        tests: [],
        nodes: [],
        edges: [],
        selectedNodeId: null,
        hoveredNodeId: null,
        isLoading: false,
        error: null,
        activePanel: null,
        layoutType: 'horizontal',
        viewMode: 'graph',
        isExpanded: false,
        deleteDialog: {
          open: false,
          nodeId: null,
          nodeType: null,
          nodeName: null,
        },
        filters: initialFilterState,
        viewport: initialViewportState,
        
        // ========================================================================
        // Data Actions Implementation
        // ========================================================================
        
        fetchAllData: async (userId: string, isAdmin = false, courses = []) => {
          set({ isLoading: true, error: null });
          
          try {
            // Import Firestore dynamically to avoid circular dependencies
            const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
            const { db } = await import('../config/firestore');
            
            // Fetch designs based on user role and course permissions
            let designsQuery;
            if (isAdmin && courses.length > 0) {
              // For educators: show their own designs + their students' designs for courses they admin
              // We need to get the user's course admin status to determine which courses they can see all designs for
              const { doc, getDoc } = await import('firebase/firestore');
              const userDoc = await getDoc(doc(db, 'users', userId));
              const userData = userDoc.exists() ? userDoc.data() : null;
              const userClasses = userData?.classes || {};
              
              // Get courses where user is course admin
              const adminCourses = Object.entries(userClasses)
                .filter(([_, courseData]) => (courseData as any).isCourseAdmin)
                .map(([courseId, _]) => courseId);
              
              // Get courses where user is just a student
              const studentCourses = Object.entries(userClasses)
                .filter(([_, courseData]) => !(courseData as any).isCourseAdmin)
                .map(([courseId, _]) => courseId);
              
              // For admin courses: show all designs in those courses
              // For student courses: show only user's own designs
              if (adminCourses.length > 0 && studentCourses.length > 0) {
                // User has both admin and student courses - need to fetch both types
                const adminDesignsQuery = query(
                  collection(db, 'designs'),
                  where('course', 'in', adminCourses),
                  orderBy('dateCreated', 'desc')
                );
                const studentDesignsQuery = query(
                  collection(db, 'designs'),
                  where('course', 'in', studentCourses),
                  where('userId', '==', userId),
                  orderBy('dateCreated', 'desc')
                );
                
                // Execute both queries
                const [adminSnapshot, studentSnapshot] = await Promise.all([
                  getDocs(adminDesignsQuery),
                  getDocs(studentDesignsQuery)
                ]);
                
                // Combine results
                const adminDesigns = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const studentDesigns = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const allDesigns = [...adminDesigns, ...studentDesigns];
                
                // Process designs (moved outside the query logic)
                const designs: Design[] = allDesigns.map((data: any) => ({
                  id: data.id,
                  title: data.title || '',
                  description: data.description || '',
                  course: data.course || '',
                  dateCreated: data.dateCreated,
                  dateModified: data.dateModified,
                  userId: data.userId || '',
                  images: data.images || [],
                  files: data.files || [],
                } as Design));
                
                // Continue with builds and tests using the design IDs
                const designIds = designs.map(d => d.id);
                
                // Fetch builds (in batches if needed due to Firestore 'in' query limit of 10)
                let builds: Build[] = [];
                if (designIds.length > 0) {
                  const buildBatches = [];
                  for (let i = 0; i < designIds.length; i += 10) {
                    const batch = designIds.slice(i, i + 10);
                    const buildsQuery = query(
                      collection(db, 'builds'),
                      where('design_ID', 'in', batch)
                    );
                    buildBatches.push(getDocs(buildsQuery));
                  }
                  
                  const buildSnapshots = await Promise.all(buildBatches);
                  builds = buildSnapshots.flatMap(snapshot =>
                    snapshot.docs.map(doc => {
                      const data = doc.data() as any;
                      return {
                        id: doc.id,
                        title: data.title || '',
                        description: data.description || '',
                        design_ID: data.design_ID || '',
                        dateCreated: data.dateCreated,
                        userId: data.userId || '',
                        images: data.images || [],
                        files: data.files || [],
                        dataAnalysis: data.dataAnalysis, // ← Include data analysis field!
                      } as Build;
                    })
                  );
                }
                
                // Get all build IDs for fetching tests
                const buildIds = builds.map(b => b.id);
                
                // Fetch tests (in batches if needed)
                let tests: Test[] = [];
                if (buildIds.length > 0) {
                  const testBatches = [];
                  for (let i = 0; i < buildIds.length; i += 10) {
                    const batch = buildIds.slice(i, i + 10);
                    const testsQuery = query(
                      collection(db, 'tests'),
                      where('build_ID', 'in', batch)
                    );
                    testBatches.push(getDocs(testsQuery));
                  }
                  
                  const testSnapshots = await Promise.all(testBatches);
                  tests = testSnapshots.flatMap(snapshot =>
                    snapshot.docs.map(doc => {
                      const data = doc.data() as any;
                      return {
                        id: doc.id,
                        title: data.title || '',
                        description: data.description || '',
                        build_ID: data.build_ID || '',
                        dateCreated: data.dateCreated,
                        userId: data.userId || '',
                        images: data.images || [],
                        files: data.files || [],
                        dataAnalysis: data.dataAnalysis, // ← Include data analysis field!
                      } as Test;
                    })
                  );
                }
                
                // Update state with all fetched data
                set({ 
                  designs, 
                  builds, 
                  tests, 
                  isLoading: false 
                });
                
                return; // Early return to avoid the single query logic below
              } else if (adminCourses.length > 0) {
                // User is only admin in courses
                designsQuery = query(
                  collection(db, 'designs'),
                  where('course', 'in', adminCourses),
                  orderBy('dateCreated', 'desc')
                );
              } else {
                // User is only student in courses
                designsQuery = query(
                  collection(db, 'designs'),
                  where('course', 'in', studentCourses),
                  where('userId', '==', userId),
                  orderBy('dateCreated', 'desc')
                );
              }
            } else {
              // For non-admin users: show only their own designs
              designsQuery = query(
                collection(db, 'designs'),
                where('userId', '==', userId),
                orderBy('dateCreated', 'desc')
              );
            }
            
            const designsSnapshot = await getDocs(designsQuery);
            const designs: Design[] = designsSnapshot.docs.map(doc => {
              const data = doc.data() as any;
              return {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                course: data.course || '',
                dateCreated: data.dateCreated,
                dateModified: data.dateModified,
                userId: data.userId || '',
                images: data.images || [],
                files: data.files || [],
                dataAnalysis: data.dataAnalysis, // ← Include data analysis field!
              } as Design;
            });
            
            // Get all design IDs for fetching builds
            const designIds = designs.map(d => d.id);
            
            // Fetch builds (in batches if needed due to Firestore 'in' query limit of 10)
            let builds: Build[] = [];
            if (designIds.length > 0) {
              const buildBatches = [];
              for (let i = 0; i < designIds.length; i += 10) {
                const batch = designIds.slice(i, i + 10);
                const buildsQuery = query(
                  collection(db, 'builds'),
                  where('design_ID', 'in', batch)
                );
                buildBatches.push(getDocs(buildsQuery));
              }
              
              const buildSnapshots = await Promise.all(buildBatches);
              builds = buildSnapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => {
                  const data = doc.data() as any;
                  return {
                    id: doc.id,
                    title: data.title || '',
                    description: data.description || '',
                    design_ID: data.design_ID || '',
                    dateCreated: data.dateCreated,
                    userId: data.userId || '',
                    images: data.images || [],
                    files: data.files || [],
                    dataAnalysis: data.dataAnalysis, // ← Include data analysis field!
                  } as Build;
                })
              );
            }
            
            // Get all build IDs for fetching tests
            const buildIds = builds.map(b => b.id);
            
            // Fetch tests (in batches if needed)
            let tests: Test[] = [];
            if (buildIds.length > 0) {
              const testBatches = [];
              for (let i = 0; i < buildIds.length; i += 10) {
                const batch = buildIds.slice(i, i + 10);
                const testsQuery = query(
                  collection(db, 'tests'),
                  where('build_ID', 'in', batch)
                );
                testBatches.push(getDocs(testsQuery));
              }
              
              const testSnapshots = await Promise.all(testBatches);
              tests = testSnapshots.flatMap(snapshot =>
                snapshot.docs.map(doc => {
                  const data = doc.data() as any;
                  return {
                    id: doc.id,
                    title: data.title || '',
                    description: data.description || '',
                    results: data.results || '',
                    conclusions: data.conclusions || '',
                    build_ID: data.build_ID || '',
                    design_ID: data.design_ID || '',
                    dateCreated: data.dateCreated,
                    userId: data.userId || '',
                    images: data.images || [],
                    files: data.files || [],
                    dataAnalysis: data.dataAnalysis, // ← Include data analysis field!
                  } as Test;
                })
              );
            }
            
            // Update state
            set({ designs, builds, tests, isLoading: false });
            
            // Build graph from the data
            get().buildGraph();
          } catch (error) {
            console.error('Error fetching lab notebook data:', error);
            
            // Check if it's a permission error
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isPermissionError = errorMessage.includes('permission') || 
                                     errorMessage.includes('insufficient') ||
                                     errorMessage.includes('PERMISSION_DENIED');
            
            set({ 
              error: isPermissionError 
                ? 'Database permissions not configured. Please contact your administrator or deploy Firebase security rules. See docs/FIREBASE_RULES_SETUP.md for instructions.'
                : (error instanceof Error ? error.message : 'Failed to fetch data'),
              isLoading: false 
            });
          }
        },
        
        // Design actions
        setDesigns: (designs) => {
          set({ designs });
          get().buildGraph();
        },
        
        addDesign: (design) => {
          set((state) => ({ designs: [...state.designs, design] }));
          get().buildGraph();
        },
        
        updateDesignLocal: (id, updates) => {
          set((state) => ({
            designs: state.designs.map(d => d.id === id ? { ...d, ...updates } : d),
          }));
          get().buildGraph();
        },
        
        removeDesign: (id) => {
          set((state) => ({
            designs: state.designs.filter(d => d.id !== id),
            builds: state.builds.filter(b => b.design_ID !== id),
            tests: state.tests.filter(t => t.design_ID !== id),
          }));
          get().buildGraph();
        },
        
        // Build actions
        setBuilds: (builds) => {
          set({ builds });
          get().buildGraph();
        },
        
        addBuild: (build) => {
          set((state) => ({ builds: [...state.builds, build] }));
          get().buildGraph();
        },
        
        updateBuildLocal: (id, updates) => {
          set((state) => ({
            builds: state.builds.map(b => b.id === id ? { ...b, ...updates } : b),
          }));
          get().buildGraph();
        },
        
        removeBuild: (id) => {
          set((state) => ({
            builds: state.builds.filter(b => b.id !== id),
            tests: state.tests.filter(t => t.build_ID !== id),
          }));
          get().buildGraph();
        },
        
        // Test actions
        setTests: (tests) => {
          set({ tests });
          get().buildGraph();
        },
        
        addTest: (test) => {
          set((state) => ({ tests: [...state.tests, test] }));
          get().buildGraph();
        },
        
        updateTestLocal: (id, updates) => {
          set((state) => ({
            tests: state.tests.map(t => t.id === id ? { ...t, ...updates } : t),
          }));
          get().buildGraph();
        },
        
        removeTest: (id) => {
          set((state) => ({
            tests: state.tests.filter(t => t.id !== id),
          }));
          get().buildGraph();
        },
        
        // ========================================================================
        // Graph Actions Implementation
        // ========================================================================
        
        buildGraph: () => {
          const state = get();
          const { designs, builds, tests, filters } = state;
          
          // Apply filters
          let filteredDesigns = designs;
          let filteredBuilds = builds;
          let filteredTests = tests;
          
          // Filter by course
          if (filters.courseId) {
            filteredDesigns = filteredDesigns.filter(d => d.course === filters.courseId);
            const designIds = filteredDesigns.map(d => d.id);
            filteredBuilds = filteredBuilds.filter(b => designIds.includes(b.design_ID));
            const buildIds = filteredBuilds.map(b => b.id);
            filteredTests = filteredTests.filter(t => buildIds.includes(t.build_ID));
          }
          
          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredDesigns = filteredDesigns.filter(d =>
              d.title.toLowerCase().includes(query) ||
              d.description.toLowerCase().includes(query)
            );
            filteredBuilds = filteredBuilds.filter(b =>
              b.title.toLowerCase().includes(query) ||
              b.description.toLowerCase().includes(query)
            );
            filteredTests = filteredTests.filter(t =>
              t.title.toLowerCase().includes(query) ||
              t.description.toLowerCase().includes(query)
            );
          }
          
          // Filter by node types
          if (!filters.nodeTypes.designs) filteredDesigns = [];
          if (!filters.nodeTypes.builds) filteredBuilds = [];
          if (!filters.nodeTypes.tests) filteredTests = [];
          
          // Build nodes
          const nodes: LabNode[] = [];
          const edges: LabEdge[] = [];
          
          // Create design nodes
          filteredDesigns.forEach((design, index) => {
            const buildCount = filteredBuilds.filter(b => b.design_ID === design.id).length;
            const testCount = filteredTests.filter(t => t.design_ID === design.id).length;
            
            const nodeData: DesignNodeData = {
              type: 'design',
              designId: design.id,
              label: design.title,
              title: design.title,
              description: design.description,
              dateCreated: toDate(design.dateCreated),
              dateModified: toDate(design.dateModified),
              userId: design.userId,
              images: design.images || [],
              files: design.files || [],
              course: design.course,
              buildCount,
              testCount,
              dataAnalysis: design.dataAnalysis,
            };
            
            // Debug: Log dataAnalysis field for troubleshooting
            if (design.dataAnalysis) {
              console.log(`Design ${design.id} has dataAnalysis:`, design.dataAnalysis);
            }
            
            nodes.push({
              id: `design-${design.id}`,
              type: 'designNode',
              position: { x: 0, y: index * 200 }, // Will be recalculated by layout algorithm
              data: nodeData,
            });
          });
          
          // Create build nodes
          filteredBuilds.forEach((build, index) => {
            const testCount = filteredTests.filter(t => t.build_ID === build.id).length;
            
            nodes.push({
              id: `build-${build.id}`,
              type: 'buildNode',
              position: { x: 400, y: index * 180 },
              data: {
                type: 'build',
                buildId: build.id,
                designId: build.design_ID,
                label: build.title,
                title: build.title,
                description: build.description,
                dateCreated: toDate(build.dateCreated),
                dateModified: toDate(build.dateModified),
                userId: build.userId,
                images: build.images || [],
                files: build.files || [],
                testCount,
                dataAnalysis: build.dataAnalysis,
              } as BuildNodeData,
            });
            
            // Create edge from design to build
            edges.push({
              id: `edge-design-${build.design_ID}-build-${build.id}`,
              source: `design-${build.design_ID}`,
              target: `build-${build.id}`,
              type: 'smoothstep',
              animated: false,
            });
          });
          
          // Create test nodes
          filteredTests.forEach((test, index) => {
            nodes.push({
              id: `test-${test.id}`,
              type: 'testNode',
              position: { x: 800, y: index * 180 },
              data: {
                type: 'test',
                testId: test.id,
                buildId: test.build_ID,
                designId: test.design_ID,
                label: test.title,
                title: test.title,
                description: test.description,
                results: test.results,
                conclusions: test.conclusions,
                dateCreated: toDate(test.dateCreated),
                dateModified: toDate(test.dateModified),
                userId: test.userId,
                images: test.images || [],
                files: test.files || [],
                dataAnalysis: test.dataAnalysis,
              } as TestNodeData,
            });
            
            // Create edge from build to test
            edges.push({
              id: `edge-build-${test.build_ID}-test-${test.id}`,
              source: `build-${test.build_ID}`,
              target: `test-${test.id}`,
              type: 'smoothstep',
              animated: false,
            });
          });
          
          set({ nodes, edges });
        },
        
        selectNode: (nodeId) => {
          set({ selectedNodeId: nodeId });
          if (nodeId) {
            set({ activePanel: 'detail' });
          }
        },
        
        setHoveredNode: (nodeId) => {
          set({ hoveredNodeId: nodeId });
        },
        
        updateNodePosition: (nodeId, position) => {
          set((state) => ({
            nodes: state.nodes.map(node =>
              node.id === nodeId ? { ...node, position } : node
            ),
          }));
        },
        
        resetGraph: () => {
          set({ nodes: [], edges: [], selectedNodeId: null, hoveredNodeId: null });
        },
        
        // ========================================================================
        // UI Actions Implementation
        // ========================================================================
        
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setActivePanel: (panel) => set({ activePanel: panel }),
        setLayoutType: (type) => set({ layoutType: type }),
        setViewMode: (mode) => set({ viewMode: mode }),
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),
        
        openDeleteDialog: (nodeId, nodeType, nodeName) => set({
          deleteDialog: { open: true, nodeId, nodeType, nodeName }
        }),
        
        closeDeleteDialog: () => set({
          deleteDialog: { open: false, nodeId: null, nodeType: null, nodeName: null }
        }),
        
        confirmDelete: async () => {
          const state = get();
          const { nodeId, nodeType } = state.deleteDialog;
          
          if (!nodeId || !nodeType) return;
          
          try {
            // Import dynamically to avoid circular dependencies
            const { labNotebookService } = await import('../services/labNotebookService');
            
            // Get userId from the node data
            const node = state.nodes.find(n => n.id.includes(nodeId));
            if (!node) return;
            
            const userId = node.data.userId;
            
            // Delete from Firestore
            if (nodeType === 'build') {
              await labNotebookService.deleteBuild(nodeId, userId);
              // Update local state
              get().removeBuild(nodeId);
            } else if (nodeType === 'test') {
              await labNotebookService.deleteTest(nodeId, userId);
              // Update local state
              get().removeTest(nodeId);
            }
            
            // Close dialog and deselect node
            get().closeDeleteDialog();
            get().selectNode(null);
            get().setActivePanel(null);
            
            // Refresh data to ensure consistency
            await get().fetchAllData(userId, false, []);
          } catch (error) {
            console.error('Error deleting:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to delete' });
          }
        },
        
        // ========================================================================
        // Filter Actions Implementation
        // ========================================================================
        
        setSelectedCourse: (courseId) => {
          set((state) => ({
            filters: { ...state.filters, courseId },
          }));
          get().buildGraph();
        },
        
        setSearchQuery: (query) => {
          set((state) => ({
            filters: { ...state.filters, searchQuery: query },
          }));
          get().buildGraph();
        },
        
        setDateRange: (start, end) => {
          set((state) => ({
            filters: { ...state.filters, dateRange: { start, end } },
          }));
          get().buildGraph();
        },
        
        toggleNodeTypeFilter: (type) => {
          set((state) => ({
            filters: {
              ...state.filters,
              nodeTypes: {
                ...state.filters.nodeTypes,
                [type]: !state.filters.nodeTypes[type],
              },
            },
          }));
          get().buildGraph();
        },
        
        resetFilters: () => {
          set({ filters: initialFilterState });
          get().buildGraph();
        },
        
        // ========================================================================
        // Viewport Actions Implementation
        // ========================================================================
        
        setViewport: (viewport) => set({ viewport }),
        resetViewport: () => set({ viewport: initialViewportState }),
        
        // ========================================================================
        // Utility Actions Implementation
        // ========================================================================
        
        getGraphMetrics: () => {
          const state = get();
          return {
            designCount: state.designs.length,
            buildCount: state.builds.length,
            testCount: state.tests.length,
            totalNodes: state.nodes.length,
            totalEdges: state.edges.length,
          };
        },
        
        getNodeById: (nodeId) => {
          return get().nodes.find(node => node.id === nodeId);
        },
        
        getDesignById: (designId) => {
          return get().designs.find(d => d.id === designId);
        },
        
        getBuildById: (buildId) => {
          return get().builds.find(b => b.id === buildId);
        },
        
        getTestById: (testId) => {
          return get().tests.find(t => t.id === testId);
        },
        
        getBuildsByDesignId: (designId) => {
          return get().builds.filter(b => b.design_ID === designId);
        },
        
        getTestsByBuildId: (buildId) => {
          return get().tests.filter(t => t.build_ID === buildId);
        },
        
        // Reset store
        reset: () => {
          set({
            designs: [],
            builds: [],
            tests: [],
            nodes: [],
            edges: [],
            selectedNodeId: null,
            hoveredNodeId: null,
            isLoading: false,
            error: null,
            activePanel: null,
            filters: initialFilterState,
            viewport: initialViewportState,
          });
        },
      }),
      {
        name: 'lab-notebook-storage',
        partialize: (state) => ({
          layoutType: state.layoutType,
          viewMode: state.viewMode,
          viewport: state.viewport,
        }),
      }
    ),
    { name: 'LabNotebookStore' }
  )
);

