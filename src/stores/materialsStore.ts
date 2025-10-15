import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Material } from '../types/Material';

interface MaterialsState {
  // Data state
  materials: Material[];
  selectedCourse: string | null;
  loading: boolean;
  error: string | null;
  
  // UI state
  isEditing: boolean;
  selectedMaterial: Material | null;
  
  // Actions
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (materialId: string, updates: Partial<Material>) => void;
  deleteMaterial: (materialId: string) => void;
  
  setSelectedCourse: (courseId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setIsEditing: (isEditing: boolean) => void;
  setSelectedMaterial: (material: Material | null) => void;
  
  // Async actions
  fetchMaterials: (courseId: string) => Promise<void>;
  publishMaterial: (materialId: string) => Promise<void>;
  unpublishMaterial: (materialId: string) => Promise<void>;
}

export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      materials: [],
      selectedCourse: null,
      loading: false,
      error: null,
      isEditing: false,
      selectedMaterial: null,
      
      // Sync actions
      setMaterials: (materials) => set({ materials }),
      addMaterial: (material) => set((state) => ({ 
        materials: [...state.materials, material] 
      })),
      updateMaterial: (materialId, updates) => set((state) => ({
        materials: state.materials.map(material => 
          material.id === materialId ? { ...material, ...updates } : material
        )
      })),
      deleteMaterial: (materialId) => set((state) => ({
        materials: state.materials.filter(material => material.id !== materialId)
      })),
      
      setSelectedCourse: (courseId) => set({ selectedCourse: courseId }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      setIsEditing: (isEditing) => set({ isEditing }),
      setSelectedMaterial: (material) => set({ selectedMaterial: material }),
      
      // Async actions
      fetchMaterials: async (courseId) => {
        set({ loading: true, error: null });
        try {
          const { db } = await import('../config/firestore');
          const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
          
          // ✅ FIXED: Query without orderBy to include materials with and without sequenceNumber
          // Client-side sorting handles the ordering
          const q = query(
            collection(db, 'materials'), 
            where('course', '==', courseId)
          );
          
          return new Promise((resolve) => {
            onSnapshot(q, (snapshot) => {
              const materialsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Material, 'id'>)
              } as Material));
              
              // ✅ Client-side sort: sequenceNumber (if exists) → timestamp fallback
              const sortedMaterials = materialsData.sort((a, b) => {
                // If both have sequenceNumber, sort by that
                if (a.sequenceNumber !== undefined && b.sequenceNumber !== undefined) {
                  return a.sequenceNumber - b.sequenceNumber;
                }
                // If only a has sequenceNumber, it comes first
                if (a.sequenceNumber !== undefined) return -1;
                // If only b has sequenceNumber, it comes first
                if (b.sequenceNumber !== undefined) return 1;
                // Neither has sequenceNumber, sort by timestamp (newer first)
                return b.timestamp.toMillis() - a.timestamp.toMillis();
              });
              
              set({ materials: sortedMaterials, loading: false });
              resolve(undefined);
            });
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch materials', loading: false });
        }
      },
      
      publishMaterial: async (materialId) => {
        try {
          const { db } = await import('../config/firestore');
          const { doc, updateDoc } = await import('firebase/firestore');
          
          await updateDoc(doc(db, 'materials', materialId), { published: true });
          get().updateMaterial(materialId, { published: true });
        } catch (error) {
          set({ error: 'Failed to publish material' });
        }
      },
      
      unpublishMaterial: async (materialId) => {
        try {
          const { db } = await import('../config/firestore');
          const { doc, updateDoc } = await import('firebase/firestore');
          
          await updateDoc(doc(db, 'materials', materialId), { published: false });
          get().updateMaterial(materialId, { published: false });
        } catch (error) {
          set({ error: 'Failed to unpublish material' });
        }
      }
    })
  )
); 