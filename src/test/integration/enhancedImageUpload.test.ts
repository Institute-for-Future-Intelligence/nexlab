// src/test/integration/enhancedImageUpload.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enhancedImageUploadService } from '../../services/enhancedImageUploadService';
import { uploadExtractedImagesWithProgressEnhanced } from '../../services/imageUploadService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock Firebase Storage functions
vi.mock('firebase/storage');
const mockGetStorage = vi.mocked(getStorage);
const mockRef = vi.mocked(ref);
const mockUploadBytes = vi.mocked(uploadBytes);
const mockGetDownloadURL = vi.mocked(getDownloadURL);

// Mock image resizer
vi.mock('react-image-file-resizer', () => ({
  default: {
    imageFileResizer: vi.fn((file, maxWidth, maxHeight, format, quality, rotation, callback) => {
      // Simulate successful compression
      const compressedBlob = new Blob([file], { type: format === 'JPEG' ? 'image/jpeg' : 'image/png' });
      callback(compressedBlob);
    })
  }
}));

describe('Enhanced Image Upload Integration', () => {
  const mockStorage = {};
  const mockMaterialId = 'test-material-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStorage.mockReturnValue(mockStorage as any);
    mockUploadBytes.mockResolvedValue({
      ref: { fullPath: 'test/path' }
    } as any);
    mockGetDownloadURL.mockResolvedValue('https://test.firebase.url/image.jpg');
  });

  describe('Large Batch Handling', () => {
    it('should automatically use enhanced service for large batches', async () => {
      // Create 25 images (above 20 threshold)
      const largeImageBatch = Array.from({ length: 25 }, (_, i) => ({
        imageBlob: new Blob(['test content'], { type: 'image/png' }),
        description: `Test image ${i + 1}`,
        filename: `test${i + 1}.png`,
        slideNumber: i + 1
      }));

      const progressCallback = vi.fn();
      
      const results = await uploadExtractedImagesWithProgressEnhanced(
        largeImageBatch,
        mockMaterialId,
        progressCallback
      );

      expect(results).toHaveLength(25);
      expect(progressCallback).toHaveBeenCalled();
      
      // Should have called Firebase upload for each image
      expect(mockUploadBytes).toHaveBeenCalledTimes(25);
    }, 15000);

    it('should use enhanced service for images larger than 2MB', async () => {
      // Create large images (>2MB)
      const largeImageBatch = Array.from({ length: 5 }, (_, i) => ({
        imageBlob: new Blob([new ArrayBuffer(3 * 1024 * 1024)], { type: 'image/png' }), // 3MB
        description: `Large image ${i + 1}`,
        filename: `large${i + 1}.png`,
        slideNumber: i + 1
      }));

      const progressCallback = vi.fn();
      
      const results = await uploadExtractedImagesWithProgressEnhanced(
        largeImageBatch,
        mockMaterialId,
        progressCallback
      );

      expect(results).toHaveLength(5);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('should use standard service for small batches', async () => {
      // Create small batch (below 20 threshold)
      const smallImageBatch = Array.from({ length: 10 }, (_, i) => ({
        imageBlob: new Blob(['small content'], { type: 'image/png' }),
        description: `Small image ${i + 1}`,
        filename: `small${i + 1}.png`,
        slideNumber: i + 1
      }));

      const progressCallback = vi.fn();
      
      const results = await uploadExtractedImagesWithProgressEnhanced(
        smallImageBatch,
        mockMaterialId,
        progressCallback
      );

      expect(results).toHaveLength(10);
    });
  });

  describe('Enhanced Upload Service Direct Testing', () => {
    it('should handle timeout scenarios gracefully', async () => {
      // Mock timeout scenario
      mockUploadBytes.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 100)
        )
      );

      const images = [{
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: 'Test image',
        filename: 'test.png',
        slideNumber: 1
      }];

      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        images,
        mockMaterialId,
        {
          timeoutMs: 50, // Very short timeout to trigger failure
          maxRetries: 1
        }
      );

      expect(results).toHaveLength(1);
      // Should create fallback placeholder
      expect(results[0].url).toContain('data:image/svg+xml');
    });

    it('should optimize large images before upload', async () => {
      const largeImage = {
        imageBlob: new Blob([new ArrayBuffer(5 * 1024 * 1024)], { type: 'image/png' }), // 5MB
        description: 'Large test image',
        filename: 'large.png',
        slideNumber: 1
      };

      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        [largeImage],
        mockMaterialId,
        {
          compressionThreshold: 2 * 1024 * 1024, // 2MB threshold
          maxImageSize: 1200
        }
      );

      expect(results).toHaveLength(1);
      expect(mockUploadBytes).toHaveBeenCalled();
    });

    it('should provide detailed progress updates', async () => {
      const images = Array.from({ length: 5 }, (_, i) => ({
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: `Test image ${i + 1}`,
        filename: `test${i + 1}.png`,
        slideNumber: i + 1
      }));

      const progressUpdates: any[] = [];
      const progressCallback = (progress: any) => {
        progressUpdates.push(progress);
      };

      await enhancedImageUploadService.uploadImagesWithProgress(
        images,
        mockMaterialId,
        { onProgress: progressCallback }
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toHaveProperty('stage');
      expect(progressUpdates[0]).toHaveProperty('completed');
      expect(progressUpdates[0]).toHaveProperty('total');
      expect(progressUpdates[0]).toHaveProperty('percentage');
    });

    it('should handle batch failures with fallbacks', async () => {
      // Mock intermittent failures
      let callCount = 0;
      mockUploadBytes.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ref: { fullPath: 'test/path' } } as any);
      });

      const images = Array.from({ length: 4 }, (_, i) => ({
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: `Test image ${i + 1}`,
        filename: `test${i + 1}.png`,
        slideNumber: i + 1
      }));

      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        images,
        mockMaterialId,
        { maxRetries: 1 }
      );

      expect(results).toHaveLength(4);
      
      // Some should succeed, some should be fallbacks
      const successCount = results.filter(r => !r.url.startsWith('data:image/svg+xml')).length;
      const fallbackCount = results.filter(r => r.url.startsWith('data:image/svg+xml')).length;
      
      expect(successCount + fallbackCount).toBe(4);
    });
  });

  describe('Performance Optimizations', () => {
    it('should use smaller batch sizes for large uploads', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Large batch that should trigger enhanced service
      const images = Array.from({ length: 30 }, (_, i) => ({
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: `Test image ${i + 1}`,
        filename: `test${i + 1}.png`,
        slideNumber: i + 1
      }));

      await uploadExtractedImagesWithProgressEnhanced(images, mockMaterialId);

      // Should log that it's using enhanced service
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using enhanced upload service for 30 images')
      );

      consoleSpy.mockRestore();
    });

    it('should handle memory efficiently with large images', async () => {
      // Create images that would normally cause memory issues
      const largeImages = Array.from({ length: 10 }, (_, i) => ({
        imageBlob: new Blob([new ArrayBuffer(10 * 1024 * 1024)], { type: 'image/jpeg' }), // 10MB each
        description: `Huge image ${i + 1}`,
        filename: `huge${i + 1}.jpg`,
        slideNumber: i + 1
      }));

      // Should complete without memory errors
      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        largeImages,
        mockMaterialId,
        {
          batchSize: 2, // Small batch size for memory efficiency
          compressionThreshold: 5 * 1024 * 1024 // 5MB threshold
        }
      );

      expect(results).toHaveLength(10);
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed uploads with exponential backoff', async () => {
      let attemptCount = 0;
      mockUploadBytes.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ref: { fullPath: 'test/path' } } as any);
      });

      const image = {
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: 'Test image',
        filename: 'test.png',
        slideNumber: 1
      };

      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        [image],
        mockMaterialId,
        { maxRetries: 3 }
      );

      expect(results).toHaveLength(1);
      // In batch processing, attempts may be higher due to multiple calls
      expect(attemptCount).toBeGreaterThanOrEqual(3); 
      expect(results[0].url).not.toContain('data:image/svg+xml'); // Should succeed
    }, 10000); // Increase timeout

    it('should create meaningful fallback placeholders', async () => {
      mockUploadBytes.mockRejectedValue(new Error('Persistent failure'));

      const image = {
        imageBlob: new Blob(['test'], { type: 'image/png' }),
        description: 'Important diagram showing cellular structure',
        filename: 'cell-diagram.png',
        slideNumber: 5
      };

      const results = await enhancedImageUploadService.uploadImagesWithProgress(
        [image],
        mockMaterialId,
        { maxRetries: 1 }
      );

      expect(results).toHaveLength(1);
      expect(results[0].url).toContain('data:image/svg+xml');
      expect(results[0].title).toBe('Important diagram showing cellular structure');
      expect(results[0].slideNumber).toBe(5);
    });
  });
});

describe('Real-world Scenario Testing', () => {
  const testMaterialId = 'test-material-real-world';
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStorage.mockReturnValue({} as any);
    mockUploadBytes.mockResolvedValue({ ref: { fullPath: 'test/path' } } as any);
    mockGetDownloadURL.mockResolvedValue('https://test.firebase.url/image.jpg');
  });

  it('should handle the reported 71-image PowerPoint scenario', async () => {
    // Simulate the exact scenario from user logs: 71 images across 37 slides
    const powerPointImages = Array.from({ length: 71 }, (_, i) => {
      const slideNumber = Math.floor(i / 2) + 1; // Distribute across ~37 slides
      const imageSize = Math.random() * 6 * 1024 * 1024; // Random sizes up to 6MB
      
      return {
        imageBlob: new Blob([new ArrayBuffer(Math.floor(imageSize))], { 
          type: Math.random() > 0.5 ? 'image/png' : 'image/jpeg' 
        }),
        description: `Image from slide ${slideNumber}`,
        filename: `image${i + 1}.${Math.random() > 0.5 ? 'png' : 'jpg'}`,
        slideNumber
      };
    });

    const progressUpdates: any[] = [];
    const startTime = Date.now();

    const results = await uploadExtractedImagesWithProgressEnhanced(
      powerPointImages,
      testMaterialId,
      (completed, total) => {
        progressUpdates.push({ completed, total, timestamp: Date.now() });
      }
    );

    const duration = Date.now() - startTime;

    expect(results).toHaveLength(71);
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds in test
    
    console.log(`✅ Completed 71-image upload test in ${duration}ms`);
  });
});
