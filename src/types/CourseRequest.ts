// src/types/CourseRequest.ts
import type { 
  ParsedCourseInfo, 
  GeneratedMaterial 
} from '../stores/syllabusStore';
import type { AIExtractedCourseInfo } from '../services/geminiService';
import type { StoredSyllabusFile } from '../services/syllabusFileService';

/**
 * Unified syllabus data structure embedded in course requests
 * Ensures consistency across all forms and admin interfaces
 */
export interface SyllabusData {
  // Core course information
  parsedCourseInfo: ParsedCourseInfo;
  
  // All generated materials (published and drafts)
  generatedMaterials: GeneratedMaterial[];
  
  // AI-extracted detailed information (if available)
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
 * Base course request document (common fields)
 */
export interface BaseCourseRequest {
  uid: string; // Educator UID
  courseNumber: string;
  courseTitle: string;
  courseDescription: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  syllabusImported: boolean;
  syllabusData?: SyllabusData; // Only present if syllabusImported === true
}

/**
 * Educator permission request (from My Account - first time)
 */
export interface EducatorRequest extends BaseCourseRequest {
  // Personal information
  firstName: string;
  lastName: string;
  institution: string;
  email: string;
  
  // Request type
  requestType: 'primary' | 'co-instructor';
}

/**
 * New course request (from Course Management - existing educators)
 */
export interface CourseRequest extends BaseCourseRequest {
  // No additional fields needed for course requests
  // They already have educator permissions
}

/**
 * Type guard to check if request has syllabus data
 */
export function hasSyllabusData(
  request: BaseCourseRequest
): request is BaseCourseRequest & { syllabusData: SyllabusData } {
  return request.syllabusImported === true && !!request.syllabusData;
}

/**
 * Type guard to check if request is educator request
 */
export function isEducatorRequest(
  request: BaseCourseRequest
): request is EducatorRequest {
  return 'firstName' in request && 'requestType' in request;
}

/**
 * Type guard to check if request is course request
 */
export function isCourseRequest(
  request: BaseCourseRequest
): request is CourseRequest {
  return !isEducatorRequest(request);
}

/**
 * Helper to get material counts from syllabus data
 */
export function getMaterialCounts(syllabusData: SyllabusData) {
  return {
    total: syllabusData.metadata.totalMaterialCount,
    published: syllabusData.metadata.publishedMaterialCount,
    drafts: syllabusData.metadata.draftMaterialCount
  };
}

/**
 * Helper to check if syllabus was processed with AI
 */
export function wasProcessedWithAI(syllabusData: SyllabusData): boolean {
  return syllabusData.metadata.processingMethod === 'ai';
}

/**
 * Helper to get file download information
 */
export function getSyllabusFileInfo(syllabusData: SyllabusData) {
  if (!syllabusData.storedSyllabusFile) {
    return null;
  }
  
  return {
    url: syllabusData.storedSyllabusFile.url,
    fileName: syllabusData.metadata.fileName,
    fileType: syllabusData.metadata.fileType
  };
}

