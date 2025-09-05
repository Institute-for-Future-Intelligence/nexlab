// src/services/originalFileUploadService.ts

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  chunkedFileUploadService, 
  ChunkedUploadProgress,
  ChunkedUploadResult 
} from './chunkedFileUploadService';

export interface OriginalFileUploadResult {
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// Enhanced progress callback for chunked uploads
export type EnhancedUploadProgressCallback = (progress: ChunkedUploadProgress) => void;

export class OriginalFileUploadService {
  private storage = getStorage();

  /**
   * Upload original file to Firebase Storage with automatic chunking for large files
   */
  async uploadOriginalFile(
    file: File,
    courseId: string,
    materialId?: string,
    onProgress?: (progress: number) => void
  ): Promise<OriginalFileUploadResult> {
    // Use enhanced upload for large files (>25MB)
    const largeFileThreshold = 25 * 1024 * 1024; // 25MB
    
    if (file.size > largeFileThreshold) {
      console.log(`🔄 File is large (${(file.size / 1024 / 1024).toFixed(1)}MB), using chunked upload`);
      return this.uploadOriginalFileEnhanced(file, courseId, materialId, onProgress ? 
        (progress) => onProgress(progress.percentage) : undefined
      );
    }
    
    // Use standard upload for smaller files
    return this.uploadOriginalFileStandard(file, courseId, materialId, onProgress);
  }

  /**
   * Enhanced upload with chunking support for large files
   */
  async uploadOriginalFileEnhanced(
    file: File,
    courseId: string,
    materialId?: string,
    onProgress?: EnhancedUploadProgressCallback
  ): Promise<OriginalFileUploadResult> {
    // Validate file
    const validation = chunkedFileUploadService.validateFileForChunkedUpload(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueId = materialId || uuidv4();
    const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${uniqueId}.${fileExtension}`;
    const storagePath = `original-files/${courseId}/${fileName}`;

    console.log('🚀 Starting enhanced original file upload:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      courseId,
      chunked: true
    });

    try {
      const result = await chunkedFileUploadService.uploadLargeFile(file, storagePath, {
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        maxRetries: 3,
        timeoutMs: 60000, // 60 seconds per chunk
        onProgress,
        onChunkComplete: (chunkIndex, totalChunks) => {
          console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} completed`);
        }
      });

      const uploadResult: OriginalFileUploadResult = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: result.url,
        uploadedAt: new Date()
      };

      console.log('✅ Enhanced original file uploaded successfully:', {
        originalName: file.name,
        storageName: fileName,
        url: result.url,
        size: file.size,
        chunks: result.chunks,
        uploadTime: `${(result.uploadTime / 1000).toFixed(1)}s`
      });

      return uploadResult;

    } catch (error) {
      console.error('❌ Enhanced original file upload failed:', error);
      throw new Error(`Failed to upload original file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Standard upload for smaller files (legacy method)
   */
  private async uploadOriginalFileStandard(
    file: File,
    courseId: string,
    materialId?: string,
    onProgress?: (progress: number) => void
  ): Promise<OriginalFileUploadResult> {
    try {
      // Generate unique filename to prevent conflicts
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueId = materialId || uuidv4();
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${uniqueId}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(this.storage, `original-files/${courseId}/${fileName}`);
      
      console.log('🚀 Starting original file upload:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        courseId
      });

      onProgress?.(10);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      onProgress?.(70);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      onProgress?.(100);

      const result: OriginalFileUploadResult = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        uploadedAt: new Date()
      };

      console.log('✅ Original file uploaded successfully:', {
        originalName: file.name,
        storageName: fileName,
        url: downloadURL,
        size: file.size
      });

      return result;

    } catch (error) {
      console.error('❌ Original file upload failed:', error);
      throw new Error(`Failed to upload original file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete original file from Firebase Storage
   */
  async deleteOriginalFile(fileUrl: string): Promise<void> {
    try {
      // Extract storage path from URL
      const url = new URL(fileUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (!pathMatch) {
        throw new Error('Invalid Firebase Storage URL format');
      }

      const decodedPath = decodeURIComponent(pathMatch[1]);
      const fileRef = ref(this.storage, decodedPath);
      
      await deleteObject(fileRef);
      
      console.log('✅ Original file deleted successfully:', decodedPath);
      
    } catch (error) {
      console.error('❌ Original file deletion failed:', error);
      // Don't throw error for deletion failures to avoid blocking other operations
      console.warn('Continuing despite file deletion failure');
    }
  }

  /**
   * Replace existing original file with new one
   */
  async replaceOriginalFile(
    newFile: File,
    courseId: string,
    materialId: string,
    oldFileUrl?: string,
    onProgress?: (progress: number) => void
  ): Promise<OriginalFileUploadResult> {
    try {
      // Delete old file if it exists
      if (oldFileUrl) {
        await this.deleteOriginalFile(oldFileUrl);
      }

      // Upload new file
      return await this.uploadOriginalFile(newFile, courseId, materialId, onProgress);
      
    } catch (error) {
      console.error('❌ Original file replacement failed:', error);
      throw new Error(`Failed to replace original file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Validate file for upload (now supports up to 500MB with chunking)
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (500MB limit with chunking)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 500MB`
      };
    }

    // Check file type (common document formats)
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'application/pdf', // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain' // .txt
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Supported formats: PowerPoint, PDF, Word, Text files`
      };
    }

    return { isValid: true };
  }
}

// Singleton instance
export const originalFileUploadService = new OriginalFileUploadService();
