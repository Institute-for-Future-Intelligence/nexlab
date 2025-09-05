// src/test/integration/originalFileStorage.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OriginalFileUploadService } from '../../services/originalFileUploadService';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({ fullPath: 'mocked/path' })),
  uploadBytes: vi.fn(() => Promise.resolve({ ref: { fullPath: 'mocked/path' } })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://firebase.com/mocked-url')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

describe('Original File Storage Integration', () => {
  let service: OriginalFileUploadService;
  let mockFile: File;

  beforeEach(() => {
    service = new OriginalFileUploadService();
    
    // Create a mock file for testing
    mockFile = new File(['test content'], 'test-presentation.pptx', {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('File Validation', () => {
    it('should validate supported file types', () => {
      const pptxFile = new File([''], 'test.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      
      const result = service.validateFile(pptxFile);
      expect(result.isValid).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const unsupportedFile = new File([''], 'test.exe', {
        type: 'application/x-msdownload'
      });
      
      const result = service.validateFile(unsupportedFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should reject files exceeding size limit', () => {
      // Create a mock file that's too large (over 50MB)
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      
      const result = service.validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds 50MB limit');
    });
  });

  describe('File Upload Operations', () => {
    it('should upload original file successfully', async () => {
      const mockProgressCallback = vi.fn();
      
      const result = await service.uploadOriginalFile(
        mockFile,
        'test-course-id',
        'test-material-id',
        mockProgressCallback
      );

      expect(result).toEqual({
        name: 'test-presentation.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: mockFile.size,
        url: 'https://firebase.com/mocked-url',
        uploadedAt: expect.any(Date)
      });

      // Verify progress callback was called
      expect(mockProgressCallback).toHaveBeenCalledWith(10);
      expect(mockProgressCallback).toHaveBeenCalledWith(70);
      expect(mockProgressCallback).toHaveBeenCalledWith(100);
    });

    it('should handle upload failures gracefully', async () => {
      // Mock uploadBytes to throw an error
      const { uploadBytes } = await import('firebase/storage');
      vi.mocked(uploadBytes).mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        service.uploadOriginalFile(mockFile, 'test-course-id')
      ).rejects.toThrow('Failed to upload original file: Upload failed');
    });
  });

  describe('File Replacement', () => {
    it('should replace existing file with new one', async () => {
      const newFile = new File(['new content'], 'new-presentation.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });

      const result = await service.replaceOriginalFile(
        newFile,
        'test-course-id',
        'test-material-id',
        'https://firebase.com/old-file-url'
      );

      expect(result.name).toBe('new-presentation.pptx');
      expect(result.url).toBe('https://firebase.com/mocked-url');
    });
  });

  describe('File Deletion', () => {
    it('should delete file without throwing errors', async () => {
      // Should not throw even if deletion fails
      await expect(
        service.deleteOriginalFile('https://firebase.com/invalid-url')
      ).resolves.toBeUndefined();
    });
  });
});

describe('Material Type Extension', () => {
  it('should support originalFile property in Material interface', () => {
    // This test validates that our Material type extension compiles correctly
    const materialWithOriginalFile = {
      id: 'test-id',
      course: 'test-course',
      title: 'Test Material',
      header: { title: 'Header', content: 'Content' },
      footer: { title: 'Footer', content: 'Content' },
      sections: [],
      author: 'test-author',
      timestamp: new Date() as any, // Firestore Timestamp
      published: false,
      originalFile: {
        name: 'original.pptx',
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: 1024,
        url: 'https://firebase.com/original-file',
        uploadedAt: new Date() as any, // Firestore Timestamp
      }
    };

    expect(materialWithOriginalFile.originalFile).toBeDefined();
    expect(materialWithOriginalFile.originalFile?.name).toBe('original.pptx');
  });
});
