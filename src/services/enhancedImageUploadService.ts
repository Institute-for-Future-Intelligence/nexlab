// src/services/enhancedImageUploadService.ts

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Resizer from 'react-image-file-resizer';

export interface ImageReference {
  imageBlob: Blob;
  description?: string;
  filename?: string;
  slideNumber: number;
}

export interface UploadedImage {
  url: string;
  title: string;
  originalFilename?: string;
  slideNumber: number;
  index: number;
}

export interface ImageUploadProgress {
  stage: 'preparing' | 'uploading' | 'completed' | 'failed';
  completed: number;
  total: number;
  percentage: number;
  currentBatch: number;
  totalBatches: number;
  currentOperation: string;
  failedCount: number;
  successCount: number;
  estimatedTimeRemaining?: number;
}

export type ImageUploadProgressCallback = (progress: ImageUploadProgress) => void;

interface ImageUploadOptions {
  batchSize?: number;
  maxRetries?: number;
  timeoutMs?: number;
  compressionThreshold?: number; // Images larger than this will be compressed
  maxImageSize?: number; // Maximum image dimension
  onProgress?: ImageUploadProgressCallback;
}

export class EnhancedImageUploadService {
  private storage = getStorage();
  private readonly DEFAULT_BATCH_SIZE = 2; // Reduced from 3 for better reliability
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_TIMEOUT = 15000; // Reasonable 15 seconds
  private readonly DEFAULT_COMPRESSION_THRESHOLD = 2 * 1024 * 1024; // 2MB
  private readonly DEFAULT_MAX_IMAGE_SIZE = 1200; // pixels

  /**
   * Upload multiple images with enhanced error handling and optimization
   */
  async uploadImagesWithProgress(
    images: ImageReference[],
    materialId: string,
    options: ImageUploadOptions = {}
  ): Promise<UploadedImage[]> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      maxRetries = this.DEFAULT_MAX_RETRIES,
      timeoutMs = this.DEFAULT_TIMEOUT,
      compressionThreshold = this.DEFAULT_COMPRESSION_THRESHOLD,
      maxImageSize = this.DEFAULT_MAX_IMAGE_SIZE,
      onProgress
    } = options;

    const imagesToUpload = images.filter(img => img.imageBlob);
    const totalImages = imagesToUpload.length;
    const totalBatches = Math.ceil(totalImages / batchSize);
    const startTime = Date.now();

    console.log(`🚀 Starting enhanced upload of ${totalImages} images (batch size: ${batchSize}, ${totalBatches} batches)`);

    onProgress?.({
      stage: 'preparing',
      completed: 0,
      total: totalImages,
      percentage: 0,
      currentBatch: 0,
      totalBatches,
      currentOperation: 'Preparing images for upload...',
      failedCount: 0,
      successCount: 0
    });

    const results: UploadedImage[] = [];
    let completedImages = 0;
    let failedImages = 0;

    // Process images in batches with enhanced error handling
    for (let batchStart = 0; batchStart < totalImages; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalImages);
      const batch = imagesToUpload.slice(batchStart, batchEnd);
      const currentBatch = Math.floor(batchStart / batchSize) + 1;

      console.log(`📦 Processing batch ${currentBatch}/${totalBatches} (images ${batchStart + 1}-${batchEnd})`);

      onProgress?.({
        stage: 'uploading',
        completed: completedImages,
        total: totalImages,
        percentage: (completedImages / totalImages) * 100,
        currentBatch,
        totalBatches,
        currentOperation: `Uploading batch ${currentBatch}/${totalBatches}...`,
        failedCount: failedImages,
        successCount: completedImages - failedImages,
        estimatedTimeRemaining: this.estimateTimeRemaining(startTime, completedImages, totalImages)
      });

      // Process batch with timeout and error handling
      const batchResults = await this.processBatchWithFallback(
        batch,
        batchStart,
        materialId,
        {
          maxRetries,
          timeoutMs,
          compressionThreshold,
          maxImageSize,
          batchTimeout: timeoutMs * 1.5 // 1.5x timeout for entire batch
        }
      );

      // Collect results and update counters
      for (const result of batchResults) {
        results.push(result);
        completedImages++;
        if (result.url.startsWith('data:image/svg+xml')) {
          failedImages++;
        }
      }

      // Brief pause between batches to prevent rate limiting
      if (batchStart + batchSize < totalImages) {
        const delayMs = process.env.NODE_ENV === 'test' ? 10 : 3000; // Shorter delay in tests
        console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
        await this.delay(delayMs);
      }
    }

    const successCount = completedImages - failedImages;
    const finalStage = failedImages > 0 ? 'failed' : 'completed';

    onProgress?.({
      stage: finalStage,
      completed: completedImages,
      total: totalImages,
      percentage: 100,
      currentBatch: totalBatches,
      totalBatches,
      currentOperation: `Upload completed: ${successCount} successful, ${failedImages} failed`,
      failedCount: failedImages,
      successCount
    });

    console.log(`✅ Enhanced upload completed: ${successCount}/${totalImages} successful, ${failedImages} failed`);

    return results;
  }

  /**
   * Process a batch of images with fallback handling
   */
  private async processBatchWithFallback(
    batch: ImageReference[],
    batchStartIndex: number,
    materialId: string,
    options: {
      maxRetries: number;
      timeoutMs: number;
      compressionThreshold: number;
      maxImageSize: number;
      batchTimeout: number;
    }
  ): Promise<UploadedImage[]> {
    const { batchTimeout } = options;

    try {
      // Create timeout promise for entire batch
      const batchTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Batch timeout after ${batchTimeout}ms`));
        }, batchTimeout);
      });

      // Process images in parallel
      const batchPromises = batch.map((imageRef, batchIndex) =>
        this.uploadSingleImageWithFallback(
          imageRef,
          batchStartIndex + batchIndex,
          materialId,
          options
        )
      );

      const batchPromise = Promise.all(batchPromises);
      
      // Race between batch completion and timeout
      return await Promise.race([batchPromise, batchTimeoutPromise]);

    } catch (error) {
      console.warn(`⚠️ Batch failed, creating fallbacks:`, error);
      
      // Create fallback results for all images in the batch
      return batch.map((imageRef, batchIndex) => ({
        url: this.createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
        title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
        originalFilename: imageRef.filename,
        slideNumber: imageRef.slideNumber,
        index: batchStartIndex + batchIndex
      }));
    }
  }

  /**
   * Upload a single image with comprehensive error handling
   */
  private async uploadSingleImageWithFallback(
    imageRef: ImageReference,
    globalIndex: number,
    materialId: string,
    options: {
      maxRetries: number;
      timeoutMs: number;
      compressionThreshold: number;
      maxImageSize: number;
    }
  ): Promise<UploadedImage> {
    const { maxRetries, timeoutMs, compressionThreshold, maxImageSize } = options;

    console.log(`🚀 Starting upload for image ${globalIndex + 1} (slide ${imageRef.slideNumber}, ${(imageRef.imageBlob.size / 1024).toFixed(1)}KB)`);

    try {
      // Optimize image if needed
      const optimizedBlob = await this.optimizeImageIfNeeded(
        imageRef.imageBlob,
        compressionThreshold,
        maxImageSize
      );

      // Generate unique filename
      const filename = `slide_${imageRef.slideNumber}_image_${globalIndex + 1}_${uuidv4()}`;
      
      // Upload with retries
      const { url } = await this.uploadWithRetries(
        optimizedBlob,
        filename,
        materialId,
        maxRetries,
        timeoutMs
      );

      console.log(`✅ Successfully uploaded image ${globalIndex + 1}/${imageRef.slideNumber}`);

      return {
        url,
        title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
        originalFilename: imageRef.filename,
        slideNumber: imageRef.slideNumber,
        index: globalIndex
      };

    } catch (error) {
      console.error(`❌ Failed to upload image ${globalIndex + 1} (slide ${imageRef.slideNumber}):`, error);
      
      return {
        url: this.createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
        title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
        originalFilename: imageRef.filename,
        slideNumber: imageRef.slideNumber,
        index: globalIndex
      };
    }
  }

  /**
   * Optimize image if it's too large
   */
  private async optimizeImageIfNeeded(
    blob: Blob,
    compressionThreshold: number,
    maxImageSize: number
  ): Promise<Blob> {
    // Skip optimization if image is already small
    if (blob.size <= compressionThreshold) {
      return blob;
    }

    console.log(`🔧 Optimizing large image (${(blob.size / 1024).toFixed(1)}KB)`);

    try {
      // Convert blob to file for resizer
      const file = new File([blob], 'image', { type: blob.type });
      
      // Determine output format and quality based on original type
      let outputFormat: 'JPEG' | 'PNG' = 'JPEG';
      let quality = 70;
      
      if (blob.type.includes('png') || blob.type.includes('gif')) {
        outputFormat = 'PNG';
        quality = 80;
      }

      const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
        Resizer.imageFileResizer(
          file,
          maxImageSize, // maxWidth
          maxImageSize, // maxHeight
          outputFormat,
          quality,
          0, // rotation
          (result) => {
            if (result instanceof Blob) {
              resolve(result);
            } else {
              reject(new Error('Unexpected result type from image resizer'));
            }
          },
          'blob'
        );
      });

      console.log(`✅ Image optimized: ${(blob.size / 1024).toFixed(1)}KB → ${(optimizedBlob.size / 1024).toFixed(1)}KB`);
      return optimizedBlob;

    } catch (error) {
      console.warn('⚠️ Image optimization failed, using original:', error);
      return blob;
    }
  }

  /**
   * Upload blob with retry logic
   */
  private async uploadWithRetries(
    blob: Blob,
    filename: string,
    materialId: string,
    maxRetries: number,
    timeoutMs: number
  ): Promise<{ url: string; path: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/${maxRetries} for ${filename}`);

        const storageRef = ref(this.storage, `materials/${materialId}/${filename}`);
        
        // Create upload promise with timeout
        const uploadPromise = async () => {
          const snapshot = await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return {
            url: downloadURL,
            path: snapshot.ref.fullPath
          };
        };

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs);
        });

        const result = await Promise.race([uploadPromise(), timeoutPromise]);
        
        console.log(`✅ Upload successful on attempt ${attempt}: ${filename}`);
        return result;

      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Upload attempt ${attempt} failed for ${filename}:`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter (reduced for tests)
          const baseDelay = process.env.NODE_ENV === 'test' ? 10 : Math.pow(2, attempt) * 1000;
          const jitter = process.env.NODE_ENV === 'test' ? 0 : Math.random() * 1000;
          const delay = baseDelay + jitter;
          
          console.log(`⏳ Retrying in ${(delay / 1000).toFixed(1)}s...`);
          await this.delay(delay);
        }
      }
    }

    throw new Error(`Failed to upload ${filename} after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Create SVG placeholder for failed images
   */
  private createFallbackPlaceholder(title: string): string {
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f5f5f5" stroke="#ddd" stroke-width="2"/>
        <text x="200" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666">
          Image Upload Failed
        </text>
        <text x="200" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#999">
          ${title}
        </text>
        <circle cx="200" cy="120" r="20" fill="none" stroke="#ccc" stroke-width="2"/>
        <path d="M190 120 L200 110 L210 120 L200 130 Z" fill="#ccc"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  }

  /**
   * Estimate time remaining based on current progress
   */
  private estimateTimeRemaining(startTime: number, completed: number, total: number): number {
    if (completed === 0) return 0;
    
    const elapsed = Date.now() - startTime;
    const avgTimePerImage = elapsed / completed;
    const remaining = total - completed;
    
    return Math.round((remaining * avgTimePerImage) / 1000); // Return in seconds
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const enhancedImageUploadService = new EnhancedImageUploadService();
