// src/utils/syllabusDataUtils.ts
import { 
  ParsedCourseInfo, 
  GeneratedMaterial 
} from '../stores/syllabusStore';
import type { 
  AIExtractedCourseInfo 
} from '../services/geminiService';
import type { 
  StoredSyllabusFile 
} from '../services/syllabusFileService';

/**
 * Unified syllabus data structure used consistently across all course request flows
 * This ensures admins receive complete information regardless of which form was used
 */
export interface UnifiedSyllabusData {
  // Core parsed information
  parsedCourseInfo: ParsedCourseInfo;
  
  // Generated materials (all materials, not just published)
  generatedMaterials: GeneratedMaterial[];
  
  // AI-extracted detailed information (if AI processing was used)
  aiExtractedInfo: AIExtractedCourseInfo | null;
  
  // Reference to stored syllabus file
  storedSyllabusFile: StoredSyllabusFile | null;
  
  // Processing metadata
  metadata: {
    importedAt: Date;
    processingMethod: 'ai' | 'fallback';
    fileType: string;
    fileName: string;
    totalMaterialCount: number;
    publishedMaterialCount: number;
    draftMaterialCount: number;
  };
}

/**
 * Creates a unified syllabus data object from the Zustand store state
 * This is the single source of truth for syllabus data structure
 */
export const createUnifiedSyllabusData = (
  parsedCourseInfo: ParsedCourseInfo,
  generatedMaterials: GeneratedMaterial[],
  aiExtractedInfo: AIExtractedCourseInfo | null,
  storedSyllabusFile: StoredSyllabusFile | null,
  uploadedFile: File | null,
  useAIProcessing: boolean
): UnifiedSyllabusData => {
  const publishedCount = generatedMaterials.filter(m => m.published).length;
  const draftCount = generatedMaterials.filter(m => !m.published).length;

  return {
    parsedCourseInfo,
    generatedMaterials, // Include ALL materials (published and drafts)
    aiExtractedInfo,
    storedSyllabusFile,
    metadata: {
      importedAt: new Date(),
      processingMethod: useAIProcessing && aiExtractedInfo ? 'ai' : 'fallback',
      fileType: uploadedFile?.type || 'unknown',
      fileName: uploadedFile?.name || 'unknown',
      totalMaterialCount: generatedMaterials.length,
      publishedMaterialCount: publishedCount,
      draftMaterialCount: draftCount
    }
  };
};

/**
 * Validates that syllabus data is ready for submission
 * Returns null if valid, error message if invalid
 */
export const validateSyllabusData = (
  syllabusData: UnifiedSyllabusData | null
): string | null => {
  if (!syllabusData) {
    return 'Syllabus data is missing';
  }

  if (!syllabusData.parsedCourseInfo) {
    return 'Course information is missing';
  }

  if (!syllabusData.parsedCourseInfo.suggestedTitle || 
      !syllabusData.parsedCourseInfo.suggestedNumber) {
    return 'Course title and number are required';
  }

  if (!syllabusData.generatedMaterials || syllabusData.generatedMaterials.length === 0) {
    return 'No course materials were generated';
  }

  return null; // Valid
};

/**
 * Gets a summary of the syllabus data for display/logging
 */
export const getSyllabusDataSummary = (syllabusData: UnifiedSyllabusData): string => {
  const { metadata, parsedCourseInfo } = syllabusData;
  
  return [
    `Course: ${parsedCourseInfo.suggestedNumber} - ${parsedCourseInfo.suggestedTitle}`,
    `Materials: ${metadata.totalMaterialCount} total (${metadata.publishedMaterialCount} published, ${metadata.draftMaterialCount} drafts)`,
    `Processing: ${metadata.processingMethod === 'ai' ? 'AI-Enhanced' : 'Pattern-Based'}`,
    `File: ${metadata.fileName} (${metadata.fileType})`,
    `Imported: ${metadata.importedAt.toLocaleString()}`
  ].join('\n');
};

/**
 * Extracts additional course information from AI data for backward compatibility
 * This creates the "additionalInfo" object used in the old structure
 */
export const extractAdditionalInfo = (
  aiExtractedInfo: AIExtractedCourseInfo | null
) => {
  if (!aiExtractedInfo) {
    return null;
  }

  return {
    contactInfo: aiExtractedInfo.contactInfo || null,
    policies: aiExtractedInfo.policies || null,
    additionalResources: aiExtractedInfo.additionalResources || null,
    labSpecific: aiExtractedInfo.labSpecific || null,
    textbooks: aiExtractedInfo.textbooks || [],
    gradingPolicy: aiExtractedInfo.gradingPolicy || [],
    assignments: aiExtractedInfo.assignments || [],
    prerequisites: aiExtractedInfo.prerequisites || []
  };
};

/**
 * Extracts file reference for storage
 */
export const extractSyllabusFileReference = (
  storedSyllabusFile: StoredSyllabusFile | null
) => {
  if (!storedSyllabusFile) {
    return null;
  }

  return {
    url: storedSyllabusFile.url,
    path: storedSyllabusFile.path,
    metadata: storedSyllabusFile.metadata
  };
};

