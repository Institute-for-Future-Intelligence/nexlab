// src/services/syllabusFileService.ts

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export interface SyllabusFileMetadata {
  originalFilename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string; // uid of educator
  courseId?: string; // Associated course ID (if available)
}

export interface StoredSyllabusFile {
  url: string;
  path: string;
  metadata: SyllabusFileMetadata;
}

/**
 * Upload syllabus file to Firebase Storage
 */
export const uploadSyllabusFile = async (
  file: File,
  educatorUid: string,
  courseId?: string
): Promise<StoredSyllabusFile> => {
  const storage = getStorage();
  
  // Generate unique filename while preserving original extension
  const fileExtension = file.name.split('.').pop() || 'txt';
  const uniqueFilename = `${file.name.replace(/\.[^/.]+$/, "")}_${uuidv4()}.${fileExtension}`;
  
  // Create storage path: syllabi/educatorUid/filename
  const storagePath = `syllabi/${educatorUid}/${uniqueFilename}`;
  const storageRef = ref(storage, storagePath);
  
  try {
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Create metadata
    const metadata: SyllabusFileMetadata = {
      originalFilename: file.name,
      fileSize: file.size,
      fileType: file.type || 'application/octet-stream',
      uploadedAt: new Date(),
      uploadedBy: educatorUid,
      courseId: courseId
    };
    
    console.log(`Successfully uploaded syllabus file: ${uniqueFilename}`, {
      size: file.size,
      type: file.type,
      url: downloadURL
    });
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      metadata
    };
    
  } catch (error) {
    console.error('Failed to upload syllabus file:', error);
    throw new Error(`Failed to upload syllabus file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete syllabus file from Firebase Storage
 */
export const deleteSyllabusFile = async (filePath: string): Promise<void> => {
  const storage = getStorage();
  const fileRef = ref(storage, filePath);
  
  try {
    await deleteObject(fileRef);
    console.log(`Successfully deleted syllabus file: ${filePath}`);
  } catch (error) {
    console.error('Failed to delete syllabus file:', error);
    throw new Error(`Failed to delete syllabus file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get file type description for display
 */
export const getSyllabusFileTypeDescription = (fileType: string): string => {
  switch (fileType.toLowerCase()) {
    case 'application/pdf':
      return 'PDF Document';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word Document';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'PowerPoint Presentation';
    case 'text/plain':
      return 'Text File';
    default:
      return 'Document';
  }
};

/**
 * Format file size for display
 */
export const formatSyllabusFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
