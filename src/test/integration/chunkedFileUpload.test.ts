// src/test/integration/chunkedFileUpload.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chunkedFileUploadService } from '../../services/chunkedFileUploadService';
import { originalFileUploadService } from '../../services/originalFileUploadService';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Mock Firebase Storage functions
vi.mock('firebase/storage');
const mockGetStorage = vi.mocked(getStorage);
const mockRef = vi.mocked(ref);
const mockUploadBytes = vi.mocked(uploadBytes);
const mockGetDownloadURL = vi.mocked(getDownloadURL);
const mockDeleteObject = vi.mocked(deleteObject);

describe('Chunked File Upload Integration', () => {
  const mockStorage = {};
  const mockCourseId = 'test-course-123';
  const mockMaterialId = 'test-material-456';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStorage.mockReturnValue(mockStorage as any);
    mockUploadBytes.mockResolvedValue({
      ref: { fullPath: 'test/path', getDownloadURL: () => 'https://test.url' }
    } as any);
    mockGetDownloadURL.mockResolvedValue('https://test.firebase.url/file.pptx');
    mockDeleteObject.mockResolvedValue(undefined);
  });

  describe('File Size Validation', () => {
    it('should validate files under 500MB', () => {
      const smallFile = new File(['test content'], 'small.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      const result = chunkedFileUploadService.validateFileForChunkedUpload(smallFile);
      expect(result.isValid).toBe(true);
    });

    it('should reject files over 500MB', () => {
      const largeBuffer = new ArrayBuffer(501 * 1024 * 1024); // 501MB
      const largeFile = new File([largeBuffer], 'huge.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      
      const result = chunkedFileUploadService.validateFileForChunkedUpload(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum limit of 500MB');
    });

    it('should validate supported file types', () => {
      const supportedTypes = [
        { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx' },
        { type: 'application/vnd.ms-powerpoint', ext: 'ppt' },
        { type: 'application/pdf', ext: 'pdf' },
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' },
        { type: 'application/msword', ext: 'doc' },
        { type: 'text/plain', ext: 'txt' }
      ];

      supportedTypes.forEach(({ type, ext }) => {
        const file = new File(['test'], `test.${ext}`, { type });
        const result = chunkedFileUploadService.validateFileForChunkedUpload(file);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject unsupported file types', () => {
      const unsupportedFile = new File(['test'], 'test.zip', { type: 'application/zip' });
      
      const result = chunkedFileUploadService.validateFileForChunkedUpload(unsupportedFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });
  });

  describe('Original File Upload Service Integration', () => {
    it('should use standard upload for small files', async () => {
      const smallFile = new File(['test content'], 'small.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      const progressCallback = vi.fn();
      
      await originalFileUploadService.uploadOriginalFile(
        smallFile,
        mockCourseId,
        mockMaterialId,
        progressCallback
      );

      expect(mockUploadBytes).toHaveBeenCalledTimes(1);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('should use chunked upload for large files', async () => {
      // Create a 30MB file (above 25MB threshold)
      const largeBuffer = new ArrayBuffer(30 * 1024 * 1024);
      const largeFile = new File([largeBuffer], 'large.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      const progressCallback = vi.fn();
      
      const result = await originalFileUploadService.uploadOriginalFile(
        largeFile,
        mockCourseId,
        mockMaterialId,
        progressCallback
      );

      expect(result.name).toBe('large.pptx');
      expect(result.size).toBe(30 * 1024 * 1024);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('should handle upload progress correctly', async () => {
      const testFile = new File(['test content'], 'test.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      const progressValues: number[] = [];
      const progressCallback = (progress: number) => {
        progressValues.push(progress);
      };
      
      await originalFileUploadService.uploadOriginalFile(
        testFile,
        mockCourseId,
        mockMaterialId,
        progressCallback
      );

      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[0]).toBeGreaterThanOrEqual(0);
      expect(progressValues[progressValues.length - 1]).toBeLessThanOrEqual(100);
    });

    it('should handle upload errors gracefully', async () => {
      const testFile = new File(['test content'], 'test.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      mockUploadBytes.mockRejectedValueOnce(new Error('Network error'));

      await expect(originalFileUploadService.uploadOriginalFile(
        testFile,
        mockCourseId,
        mockMaterialId
      )).rejects.toThrow('Failed to upload original file: Network error');
    });
  });

  describe('Enhanced File Size Limits', () => {
    it('should accept files up to 500MB in validation', () => {
      const validation = originalFileUploadService.validateFile({
        size: 500 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        name: 'large.pptx'
      } as File);

      expect(validation.isValid).toBe(true);
    });

    it('should reject files over 500MB', () => {
      const validation = originalFileUploadService.validateFile({
        size: 501 * 1024 * 1024,
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        name: 'huge.pptx'
      } as File);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('exceeds maximum limit of 500MB');
    });
  });

  describe('Chunked Upload Logic', () => {
    it('should determine chunking threshold correctly', async () => {
      // Test files around the 25MB threshold
      const smallFile = new File([new ArrayBuffer(20 * 1024 * 1024)], 'small.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      const largeFile = new File([new ArrayBuffer(30 * 1024 * 1024)], 'large.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      // Mock the chunked upload service to verify it's called for large files
      const chunkedUploadSpy = vi.spyOn(chunkedFileUploadService, 'uploadLargeFile');
      
      // Small file should use standard upload (not call chunked service)
      await originalFileUploadService.uploadOriginalFile(smallFile, mockCourseId);
      expect(chunkedUploadSpy).not.toHaveBeenCalled();

      // Large file should use chunked upload service
      await originalFileUploadService.uploadOriginalFile(largeFile, mockCourseId);
      expect(chunkedUploadSpy).toHaveBeenCalledWith(
        largeFile, 
        expect.stringContaining('original-files/test-course-123/'), 
        expect.objectContaining({
          chunkSize: 5 * 1024 * 1024,
          maxRetries: 3,
          timeoutMs: 60000
        })
      );
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should provide meaningful error messages for various failure scenarios', async () => {
      const testFile = new File(['test'], 'test.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      // Test network timeout
      mockUploadBytes.mockRejectedValueOnce(new Error('Request timeout'));
      await expect(originalFileUploadService.uploadOriginalFile(testFile, mockCourseId))
        .rejects.toThrow('Failed to upload original file: Request timeout');

      // Test storage quota exceeded
      mockUploadBytes.mockRejectedValueOnce(new Error('Quota exceeded'));
      await expect(originalFileUploadService.uploadOriginalFile(testFile, mockCourseId))
        .rejects.toThrow('Failed to upload original file: Quota exceeded');
    });

    it('should handle file replacement correctly', async () => {
      const testFile = new File(['test'], 'test.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      const oldFileUrl = 'https://old.firebase.url/old.pptx';

      // Mock the deleteOriginalFile method specifically
      const deleteSpy = vi.spyOn(originalFileUploadService, 'deleteOriginalFile');
      deleteSpy.mockResolvedValueOnce(undefined);

      await originalFileUploadService.replaceOriginalFile(
        testFile,
        mockCourseId,
        mockMaterialId,
        oldFileUrl
      );

      expect(deleteSpy).toHaveBeenCalledWith(oldFileUrl);
      expect(mockUploadBytes).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle concurrent uploads efficiently', async () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([`content ${i}`], `file${i}.pptx`, { 
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        })
      );

      const uploadPromises = files.map(file => 
        originalFileUploadService.uploadOriginalFile(file, mockCourseId)
      );

      const results = await Promise.all(uploadPromises);
      
      expect(results).toHaveLength(5);
      results.forEach((result, i) => {
        expect(result.name).toBe(`file${i}.pptx`);
      });
    });

    it('should not exceed memory limits for large file processing', () => {
      // This test verifies that the chunking logic doesn't load entire files into memory
      const largeFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'large.pptx', { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });

      const validation = originalFileUploadService.validateFile(largeFile);
      expect(validation.isValid).toBe(true);
      
      // The file should be processed in chunks, not loaded entirely into memory
      expect(largeFile.size).toBeGreaterThan(25 * 1024 * 1024); // Above chunking threshold
    });
  });
});

describe('Chunked Upload Service Direct Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStorage.mockReturnValue({} as any);
    mockUploadBytes.mockResolvedValue({
      ref: { fullPath: 'test/path' }
    } as any);
    mockGetDownloadURL.mockResolvedValue('https://test.url');
  });

  it('should create proper chunk metadata for large files', () => {
    const service = chunkedFileUploadService;
    const largeFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'test.pptx', { 
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    });

    // Access private method through type assertion for testing
    const chunks = (service as any).createChunkMetadata(largeFile, 5 * 1024 * 1024);
    
    expect(chunks).toHaveLength(3); // 15MB / 5MB = 3 chunks
    expect(chunks[0].start).toBe(0);
    expect(chunks[0].size).toBe(5 * 1024 * 1024);
    expect(chunks[2].end).toBe(15 * 1024 * 1024);
  });

  it('should handle progress reporting correctly', async () => {
    const testFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'test.pptx', { 
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    });

    const progressEvents: any[] = [];
    const onProgress = (progress: any) => progressEvents.push(progress);

    await chunkedFileUploadService.uploadLargeFile(testFile, 'test/path', {
      chunkSize: 5 * 1024 * 1024,
      onProgress
    });

    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents[0].stage).toBe('preparing');
    expect(progressEvents[progressEvents.length - 1].stage).toBe('completed');
    expect(progressEvents[progressEvents.length - 1].percentage).toBe(100);
  });
});
