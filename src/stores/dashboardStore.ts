import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Build, Test } from '../types/dashboard';
import { Design } from '../types/types';

interface DashboardState {
  // Data state
  builds: Build[];
  tests: { [buildId: string]: Test[] };
  selectedDesign: Design | null;
  
  // UI state
  isAddingBuild: boolean;
  editMode: { [id: string]: boolean };
  visibleDetails: { [id: string]: boolean };
  
  // Actions
  setBuilds: (builds: Build[]) => void;
  addBuild: (build: Build) => void;
  updateBuild: (buildId: string, updates: Partial<Build>) => void;
  deleteBuild: (buildId: string) => void;
  
  setTests: (buildId: string, tests: Test[]) => void;
  addTest: (buildId: string, test: Test) => void;
  updateTest: (testId: string, updates: Partial<Test>) => void;
  deleteTest: (testId: string) => void;
  
  toggleAddingBuild: () => void;
  toggleEditMode: (id: string) => void;
  toggleVisibility: (id: string) => void;
  
  // Async actions
  fetchBuilds: (designId: string) => Promise<void>;
  fetchTests: (buildId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        builds: [],
        tests: {},
        selectedDesign: null,
        isAddingBuild: false,
        editMode: {},
        visibleDetails: {},
        
        // Sync actions
        setBuilds: (builds) => set({ builds }),
        addBuild: (build) => set((state) => ({ 
          builds: [...state.builds, build] 
        })),
        updateBuild: (buildId, updates) => set((state) => ({
          builds: state.builds.map(build => 
            build.id === buildId ? { ...build, ...updates } : build
          )
        })),
        deleteBuild: (buildId) => set((state) => ({
          builds: state.builds.filter(build => build.id !== buildId),
          tests: Object.fromEntries(
            Object.entries(state.tests).filter(([key]) => key !== buildId)
          )
        })),
        
        setTests: (buildId, tests) => set((state) => ({
          tests: { ...state.tests, [buildId]: tests }
        })),
        addTest: (buildId, test) => set((state) => ({
          tests: {
            ...state.tests,
            [buildId]: [...(state.tests[buildId] || []), test]
          }
        })),
        updateTest: (testId, updates) => set((state) => ({
          tests: Object.fromEntries(
            Object.entries(state.tests).map(([buildId, tests]) => [
              buildId,
              tests.map(test => test.id === testId ? { ...test, ...updates } : test)
            ])
          )
        })),
        deleteTest: (testId) => set((state) => ({
          tests: Object.fromEntries(
            Object.entries(state.tests).map(([buildId, tests]) => [
              buildId,
              tests.filter(test => test.id !== testId)
            ])
          )
        })),
        
        toggleAddingBuild: () => set((state) => ({ 
          isAddingBuild: !state.isAddingBuild 
        })),
        toggleEditMode: (id) => set((state) => ({
          editMode: { ...state.editMode, [id]: !state.editMode[id] }
        })),
        toggleVisibility: (id) => set((state) => ({
          visibleDetails: { ...state.visibleDetails, [id]: !state.visibleDetails[id] }
        })),
        
        // Async actions
        fetchBuilds: async (designId) => {
          const { db } = await import('../config/firestore');
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          
          const buildsQuery = query(
            collection(db, 'builds'), 
            where('design_ID', '==', designId)
          );
          const snapshot = await getDocs(buildsQuery);
          const builds = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<Build, 'id'>)
          } as Build));
          
          set({ builds });
        },
        
        fetchTests: async (buildId) => {
          const { db } = await import('../config/firestore');
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          
          const testsQuery = query(
            collection(db, 'tests'), 
            where('build_ID', '==', buildId)
          );
          const snapshot = await getDocs(testsQuery);
          const tests = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<Test, 'id'>)
          } as Test));
          
          get().setTests(buildId, tests);
        }
      }),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({ 
          selectedDesign: state.selectedDesign,
          visibleDetails: state.visibleDetails 
        })
      }
    )
  )
); 