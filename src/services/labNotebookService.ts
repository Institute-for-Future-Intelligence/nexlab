// src/services/labNotebookService.ts
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore,
  Timestamp,
} from 'firebase/firestore';
import { Design } from '../types/types';
import { Build, Test } from '../types/dashboard';
import {
  CreateDesignInput,
  CreateBuildInput,
  CreateTestInput,
  UpdateDesignInput,
  UpdateBuildInput,
  UpdateTestInput,
} from '../types/labNotebook';
import { Dataset, SavedAnalysis, DataAnalysisSection, toDatasetMetadata } from '../types/dataAnalysis';

/**
 * Check if an array contains nested arrays (2D array or deeper)
 */
function hasNestedArrays(arr: unknown[]): boolean {
  return arr.some(item => Array.isArray(item));
}

/**
 * Clean object for Firestore by removing undefined values and converting Dates
 * Also handles nested arrays by converting them to serialized format
 */
function cleanForFirestore(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (obj instanceof Date) {
    return Timestamp.fromDate(obj);
  }
  
  if (Array.isArray(obj)) {
    // Check if this is a nested array (2D array)
    if (hasNestedArrays(obj)) {
      // Convert nested array to serialized format that Firestore accepts
      // For confusion matrix: [[1, 0], [0, 1]] → {rows: [{values: [1, 0]}, {values: [0, 1]}]}
      return {
        _type: 'nested_array',
        rows: obj.map(row => ({
          values: Array.isArray(row) ? row : [row]
        }))
      };
    }
    
    // Regular array - clean each item but limit very large arrays
    // (Predictions can have 100s of items which is too much for Firestore)
    if (obj.length > 100) {
      return obj.slice(0, 100).map(item => cleanForFirestore(item));
    }
    
    return obj.map(item => cleanForFirestore(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key];
        // Skip undefined values - Firestore doesn't support them
        if (value !== undefined) {
          cleaned[key] = cleanForFirestore(value);
        }
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Laboratory Notebook V2 Service
 * Handles all Firestore CRUD operations for designs, builds, and tests
 */

export interface LabNotebookService {
  // Design operations
  createDesign: (input: CreateDesignInput) => Promise<string>;
  updateDesign: (input: UpdateDesignInput) => Promise<void>;
  deleteDesign: (designId: string, userId: string) => Promise<void>;
  getDesign: (designId: string) => Promise<Design | null>;
  
  // Build operations
  createBuild: (input: CreateBuildInput) => Promise<string>;
  updateBuild: (input: UpdateBuildInput) => Promise<void>;
  deleteBuild: (buildId: string, userId: string) => Promise<void>;
  getBuild: (buildId: string) => Promise<Build | null>;
  getBuildsByDesign: (designId: string) => Promise<Build[]>;
  
  // Test operations
  createTest: (input: CreateTestInput) => Promise<string>;
  updateTest: (input: UpdateTestInput) => Promise<void>;
  deleteTest: (testId: string, userId: string) => Promise<void>;
  getTest: (testId: string) => Promise<Test | null>;
  getTestsByBuild: (buildId: string) => Promise<Test[]>;

  // Data Analysis operations
  updateDataAnalysis: (
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    dataAnalysis: DataAnalysisSection
  ) => Promise<void>;
  addDataset: (
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    dataset: Dataset
  ) => Promise<void>;
  addAnalysis: (
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    analysis: SavedAnalysis
  ) => Promise<void>;
}

class FirestoreLabNotebookService implements LabNotebookService {
  private db: Firestore | null = null;

  private initialize() {
    if (!this.db) {
      this.db = getFirestore();
    }
  }

  // ============================================================================
  // Design Operations
  // ============================================================================

  async createDesign(input: CreateDesignInput): Promise<string> {
    this.initialize();

    const designData = {
      title: input.title,
      description: input.description,
      course: input.course,
      userId: input.userId,
      dateCreated: serverTimestamp(),
      dateModified: serverTimestamp(),
      images: input.images || [],
      files: input.files || [],
    };

    const docRef = await addDoc(collection(this.db!, 'designs'), designData);
    console.log('Design created with ID:', docRef.id);
    return docRef.id;
  }

  async updateDesign(input: UpdateDesignInput): Promise<void> {
    this.initialize();

    const updateData: Record<string, unknown> = {
      dateModified: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.course !== undefined) updateData.course = input.course;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.files !== undefined) updateData.files = input.files;

    const designRef = doc(this.db!, 'designs', input.id);
    await updateDoc(designRef, updateData);
    console.log('Design updated:', input.id);
  }

  async deleteDesign(designId: string, userId: string): Promise<void> {
    this.initialize();

    // First, delete all associated builds and tests
    const buildsQuery = query(
      collection(this.db!, 'builds'),
      where('design_ID', '==', designId),
      where('userId', '==', userId)
    );
    const buildsSnapshot = await getDocs(buildsQuery);

    for (const buildDoc of buildsSnapshot.docs) {
      const buildId = buildDoc.id;

      // Delete tests associated with this build
      const testsQuery = query(
        collection(this.db!, 'tests'),
        where('build_ID', '==', buildId),
        where('userId', '==', userId)
      );
      const testsSnapshot = await getDocs(testsQuery);

      for (const testDoc of testsSnapshot.docs) {
        await deleteDoc(doc(this.db!, 'tests', testDoc.id));
        console.log('Test deleted:', testDoc.id);
      }

      // Delete the build
      await deleteDoc(doc(this.db!, 'builds', buildId));
      console.log('Build deleted:', buildId);
    }

    // Finally, delete the design
    await deleteDoc(doc(this.db!, 'designs', designId));
    console.log('Design deleted:', designId);
  }

  async getDesign(designId: string): Promise<Design | null> {
    this.initialize();

    const designRef = doc(this.db!, 'designs', designId);
    const designSnap = await getDoc(designRef);

    if (designSnap.exists()) {
      const data = designSnap.data() as any;
      return {
        id: designSnap.id,
        title: data.title || '',
        description: data.description || '',
        course: data.course || '',
        dateCreated: data.dateCreated,
        dateModified: data.dateModified,
        userId: data.userId || '',
        images: data.images || [],
        files: data.files || [],
      } as Design;
    }

    return null;
  }

  // ============================================================================
  // Build Operations
  // ============================================================================

  async createBuild(input: CreateBuildInput): Promise<string> {
    this.initialize();

    const buildData = {
      title: input.title,
      description: input.description,
      design_ID: input.designId,
      userId: input.userId,
      dateCreated: serverTimestamp(),
      dateModified: serverTimestamp(),
      images: input.images || [],
      files: input.files || [],
    };

    const docRef = await addDoc(collection(this.db!, 'builds'), buildData);
    console.log('Build created with ID:', docRef.id);
    return docRef.id;
  }

  async updateBuild(input: UpdateBuildInput): Promise<void> {
    this.initialize();

    const updateData: Record<string, unknown> = {
      dateModified: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.files !== undefined) updateData.files = input.files;

    const buildRef = doc(this.db!, 'builds', input.id);
    await updateDoc(buildRef, updateData);
    console.log('Build updated:', input.id);
  }

  async deleteBuild(buildId: string, userId: string): Promise<void> {
    this.initialize();

    // First, delete all associated tests
    const testsQuery = query(
      collection(this.db!, 'tests'),
      where('build_ID', '==', buildId),
      where('userId', '==', userId)
    );
    const testsSnapshot = await getDocs(testsQuery);

    for (const testDoc of testsSnapshot.docs) {
      await deleteDoc(doc(this.db!, 'tests', testDoc.id));
      console.log('Test deleted:', testDoc.id);
    }

    // Delete the build
    await deleteDoc(doc(this.db!, 'builds', buildId));
    console.log('Build deleted:', buildId);
  }

  async getBuild(buildId: string): Promise<Build | null> {
    this.initialize();

    const buildRef = doc(this.db!, 'builds', buildId);
    const buildSnap = await getDoc(buildRef);

    if (buildSnap.exists()) {
      const data = buildSnap.data() as any;
      return {
        id: buildSnap.id,
        title: data.title || '',
        description: data.description || '',
        design_ID: data.design_ID || '',
        dateCreated: data.dateCreated,
        userId: data.userId || '',
        images: data.images || [],
        files: data.files || [],
      } as Build;
    }

    return null;
  }

  async getBuildsByDesign(designId: string): Promise<Build[]> {
    this.initialize();

    const buildsQuery = query(
      collection(this.db!, 'builds'),
      where('design_ID', '==', designId),
      orderBy('dateCreated', 'desc')
    );
    const buildsSnapshot = await getDocs(buildsQuery);

    return buildsSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        design_ID: data.design_ID || '',
        dateCreated: data.dateCreated,
        dateModified: data.dateModified,
        userId: data.userId || '',
        images: data.images || [],
        files: data.files || [],
      } as Build;
    });
  }

  // ============================================================================
  // Test Operations
  // ============================================================================

  async createTest(input: CreateTestInput): Promise<string> {
    this.initialize();

    const testData = {
      title: input.title,
      description: input.description,
      results: input.results,
      conclusions: input.conclusions,
      build_ID: input.buildId,
      design_ID: input.designId,
      userId: input.userId,
      dateCreated: serverTimestamp(),
      dateModified: serverTimestamp(),
      images: input.images || [],
      files: input.files || [],
    };

    const docRef = await addDoc(collection(this.db!, 'tests'), testData);
    console.log('Test created with ID:', docRef.id);
    return docRef.id;
  }

  async updateTest(input: UpdateTestInput): Promise<void> {
    this.initialize();

    const updateData: Record<string, unknown> = {
      dateModified: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.results !== undefined) updateData.results = input.results;
    if (input.conclusions !== undefined) updateData.conclusions = input.conclusions;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.files !== undefined) updateData.files = input.files;

    const testRef = doc(this.db!, 'tests', input.id);
    await updateDoc(testRef, updateData);
    console.log('Test updated:', input.id);
  }

  async deleteTest(testId: string, _userId: string): Promise<void> {
    this.initialize();

    await deleteDoc(doc(this.db!, 'tests', testId));
    console.log('Test deleted:', testId);
  }

  async getTest(testId: string): Promise<Test | null> {
    this.initialize();

    const testRef = doc(this.db!, 'tests', testId);
    const testSnap = await getDoc(testRef);

    if (testSnap.exists()) {
      const data = testSnap.data() as Record<string, unknown>;
      return {
        id: testSnap.id,
        title: data.title || '',
        description: data.description || '',
        results: data.results || '',
        conclusions: data.conclusions || '',
        build_ID: data.build_ID || '',
        design_ID: data.design_ID || '',
        dateCreated: data.dateCreated,
        dateModified: data.dateModified,
        userId: data.userId || '',
        images: data.images || [],
        files: data.files || [],
      } as Test;
    }

    return null;
  }

  async getTestsByBuild(buildId: string): Promise<Test[]> {
    this.initialize();

    const testsQuery = query(
      collection(this.db!, 'tests'),
      where('build_ID', '==', buildId),
      orderBy('dateCreated', 'desc')
    );
    const testsSnapshot = await getDocs(testsQuery);

    return testsSnapshot.docs.map(doc => {
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
        dateModified: data.dateModified,
        userId: data.userId || '',
        images: data.images || [],
        files: data.files || [],
      } as Test;
    });
  }

  // ============================================================================
  // Data Analysis Operations
  // ============================================================================

  async updateDataAnalysis(
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    dataAnalysis: DataAnalysisSection
  ): Promise<void> {
    this.initialize();

    const collectionName = nodeType === 'design' ? 'designs' : nodeType === 'build' ? 'builds' : 'tests';
    const docRef = doc(this.db!, collectionName, nodeId);

    await updateDoc(docRef, {
      dataAnalysis: cleanForFirestore(dataAnalysis),
      dateModified: serverTimestamp(),
    });

    console.log(`Data analysis updated for ${nodeType} ${nodeId}`);
  }

  async addDataset(
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    dataset: Dataset
  ): Promise<void> {
    this.initialize();

    const collectionName = nodeType === 'design' ? 'designs' : nodeType === 'build' ? 'builds' : 'tests';
    const docRef = doc(this.db!, collectionName, nodeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`${nodeType} with ID ${nodeId} not found`);
    }

    const currentData = docSnap.data();
    const existingDataAnalysis: DataAnalysisSection = currentData.dataAnalysis || { datasets: [], analyses: [] };
    
    // Convert to metadata only (removes heavy data array)
    const datasetMetadata = toDatasetMetadata(dataset);
    const cleanedMetadata = cleanForFirestore(datasetMetadata);
    existingDataAnalysis.datasets.push(cleanedMetadata);

    await updateDoc(docRef, {
      dataAnalysis: cleanForFirestore(existingDataAnalysis),
      dateModified: serverTimestamp(),
    });

    console.log(`Dataset metadata added to ${nodeType} ${nodeId} (${dataset.rowCount} rows, ${(dataset.fileSize / 1024).toFixed(1)} KB)`);
  }

  async addAnalysis(
    nodeType: 'design' | 'build' | 'test',
    nodeId: string,
    analysis: SavedAnalysis
  ): Promise<void> {
    this.initialize();

    const collectionName = nodeType === 'design' ? 'designs' : nodeType === 'build' ? 'builds' : 'tests';
    const docRef = doc(this.db!, collectionName, nodeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`${nodeType} with ID ${nodeId} not found`);
    }

    const currentData = docSnap.data();
    const existingDataAnalysis: DataAnalysisSection = currentData.dataAnalysis || { datasets: [], analyses: [] };
    
    // Clean and add new analysis
    const cleanedAnalysis = cleanForFirestore(analysis);
    existingDataAnalysis.analyses.push(cleanedAnalysis);

    await updateDoc(docRef, {
      dataAnalysis: cleanForFirestore(existingDataAnalysis),
      dateModified: serverTimestamp(),
    });

    console.log(`Analysis added to ${nodeType} ${nodeId}`);
  }
}

// Singleton instance
let labNotebookServiceInstance: LabNotebookService | null = null;

export const getLabNotebookService = (): LabNotebookService => {
  if (!labNotebookServiceInstance) {
    labNotebookServiceInstance = new FirestoreLabNotebookService();
  }
  return labNotebookServiceInstance;
};

// Export for convenience
export const labNotebookService = getLabNotebookService();

