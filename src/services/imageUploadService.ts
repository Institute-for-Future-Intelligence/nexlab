// src/services/imageUploadService.ts

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Resizer from 'react-image-file-resizer';
import { 
  enhancedImageUploadService, 
  ImageUploadProgressCallback as EnhancedProgressCallback,
  ImageReference as EnhancedImageReference 
} from './enhancedImageUploadService';
import { ImageReference } from '../utils/textExtraction';

export interface UploadedImage {
  url: string;
  title: string;
  originalFilename?: string;
  slideNumber?: number;
  index?: number; // For maintaining order during batch processing
}

/**
 * Fast compress and normalize image blob for web compatibility
 */
const compressImageBlob = (blob: Blob, maxSizeBytes = 5 * 1024 * 1024): Promise<{ blob: Blob; format: string }> => {
  return new Promise((resolve, reject) => {
    const originalFormat = blob.type.split('/')[1]?.toLowerCase() || 'unknown';
    
    // Fast path: if already small and web-compatible, skip compression
    if (blob.size <= maxSizeBytes && (originalFormat === 'jpeg' || originalFormat === 'png' || originalFormat === 'webp')) {
      console.log(`✅ Image already optimized: ${blob.size} bytes, format: ${originalFormat}`);
      const extension = originalFormat === 'jpeg' ? 'jpg' : originalFormat;
      resolve({ blob, format: extension });
      return;
    }
    
    const shouldCompress = blob.size > maxSizeBytes;
    console.log(`🔧 Processing image: ${blob.size} bytes, format: ${originalFormat}, compress: ${shouldCompress}`);
    
    // Convert blob to file for resizer
    const file = new File([blob], `image.${originalFormat}`, { type: blob.type });
    
    // Choose output format based on original format and web compatibility
    let outputFormat = 'JPEG';
    let outputExtension = 'jpg';
    
    if (originalFormat === 'png' || originalFormat === 'gif') {
      // Preserve transparency for PNG/GIF
      outputFormat = 'PNG';
      outputExtension = 'png';
    }
    
    // More aggressive settings for faster processing
    const quality = shouldCompress ? 60 : 75; // Lower quality for speed
    const maxDimension = shouldCompress ? 600 : 800; // Smaller dimensions for speed
    
    // Add timeout for compression process
    const compressionTimeout = setTimeout(() => {
      reject(new Error('Image compression timed out after 10 seconds'));
    }, 10000);
    
    Resizer.imageFileResizer(
      file,
      maxDimension,
      maxDimension,
      outputFormat,
      quality,
      0,
      (result) => {
        clearTimeout(compressionTimeout);
        
        if (result instanceof Blob) {
          console.log(`✅ Image compressed: ${blob.size} → ${result.size} bytes (${((1 - result.size/blob.size) * 100).toFixed(1)}% reduction)`);
          
          // Skip validation for speed - trust the resizer
          resolve({ blob: result, format: outputExtension });
        } else {
          reject(new Error('Compression failed - unexpected result type'));
        }
      },
      'blob'
    );
  });
};

/**
 * Upload a single image blob to Firebase Storage with timeout and retry logic
 */
export const uploadImageBlob = async (
  imageBlob: Blob,
  filename: string,
  sectionId: string,
  retryCount: number = 3,
  timeoutMs: number = 15000  // Reduced from 30s to 15s
): Promise<{ url: string; path: string }> => {
  const storage = getStorage();
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // Compress and normalize for web compatibility
      const { blob: compressedBlob, format: outputFormat } = await compressImageBlob(imageBlob);
      
      // Generate unique filename with correct extension
      const uniqueFilename = `${filename}_${uuidv4()}.${outputFormat}`;
      
      // Create upload promise with timeout
      const uploadPromise = async () => {
        const storageRef = ref(storage, `materials/${sectionId}/${uniqueFilename}`);
        const snapshot = await uploadBytes(storageRef, compressedBlob);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          url: downloadURL,
          path: snapshot.ref.fullPath,
          filename: uniqueFilename,
          originalSize: imageBlob.size,
          compressedSize: compressedBlob.size
        };
      };
      
      // Add timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs}ms`)), timeoutMs);
      });
      
      const result = await Promise.race([uploadPromise(), timeoutPromise]);
      
      console.log(`Successfully uploaded image: ${result.filename} (attempt ${attempt})`, {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        url: result.url
      });
      
      return {
        url: result.url,
        path: result.path
      };
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Upload attempt ${attempt}/${retryCount} failed for ${filename}: ${errorMsg}`);
      
      if (attempt === retryCount) {
        console.error(`All ${retryCount} upload attempts failed for ${filename}:`, error);
        throw new Error(`Image upload failed after ${retryCount} attempts: ${errorMsg}`);
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Upload failed - should not reach here');
};

/**
 * Upload multiple extracted images from PPTX to Firebase Storage
 */
export const uploadExtractedImages = async (
  images: ImageReference[],
  materialId: string
): Promise<UploadedImage[]> => {
  const uploadPromises = images
    .filter(img => img.imageBlob) // Only process images with actual blob data
    .map(async (imageRef, index) => {
      try {
        const filename = `slide_${imageRef.slideNumber}_image_${index + 1}`;
        const { url } = await uploadImageBlob(
          imageRef.imageBlob!,
          filename,
          materialId
        );
        
        return {
          url,
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber
        };
      } catch (error) {
        console.error(`Failed to upload image from slide ${imageRef.slideNumber}:`, error);
        
        // Return placeholder for failed uploads
        return {
          url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber
        };
      }
    });
  
  const results = await Promise.all(uploadPromises);
  
  console.log(`Successfully processed ${results.length} images from PPTX:`, {
    successful: results.filter(r => !r.url.startsWith('data:')).length,
    fallbacks: results.filter(r => r.url.startsWith('data:')).length
  });
  
  return results;
};

/**
 * Create a fallback placeholder for failed uploads
 */
const createFallbackPlaceholder = (title: string): string => {
  // Clean the title to only include Latin1 characters to avoid btoa errors
  const cleanTitle = title.replace(/[^\u0020-\u00FF]/g, '?').substring(0, 30);
  
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f44336"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">
        Upload Failed
      </text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${cleanTitle}
      </text>
    </svg>
  `;
  
  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch (error) {
    console.error('Failed to create fallback placeholder:', error);
    // Return a simple fallback without btoa if that fails too
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml,${encodedSvg}`;
  }
};

/**
 * Progress callback type for batch uploads
 */
export type UploadProgressCallback = (completed: number, total: number) => void;

/**
 * Enhanced upload function that automatically chooses the best strategy
 */
export const uploadExtractedImagesWithProgressEnhanced = async (
  images: ImageReference[],
  materialId: string,
  onProgress?: UploadProgressCallback,
  batchSize: number = 3
): Promise<UploadedImage[]> => {
  const imagesToUpload = images.filter(img => img.imageBlob);
  const imageCount = imagesToUpload.length;
  
  console.log(`🚀 Starting upload of ${imageCount} images...`);
  
  // Use enhanced service for large batches or when images are particularly large
  const shouldUseEnhancedService = imageCount > 20 || imagesToUpload.some(img => img.imageBlob!.size > 2 * 1024 * 1024);
  
  if (shouldUseEnhancedService) {
    console.log(`🔄 Using enhanced upload service for ${imageCount} images (large batch detected)`);
    
    // Convert to enhanced format
    const enhancedImages: EnhancedImageReference[] = imagesToUpload.map(img => ({
      imageBlob: img.imageBlob!,
      description: img.description,
      filename: img.filename,
      slideNumber: img.slideNumber
    }));

    // Convert progress callback
    const enhancedProgressCallback: EnhancedProgressCallback = (progress) => {
      // Convert enhanced progress to legacy format
      onProgress?.(progress.completed, progress.total);
      
      // Also log detailed progress
      console.log(`📊 Upload Progress: ${progress.completed}/${progress.total} (${progress.percentage.toFixed(1)}%) - ${progress.currentOperation}`);
      if (progress.estimatedTimeRemaining) {
        console.log(`⏱️ Estimated time remaining: ${progress.estimatedTimeRemaining}s`);
      }
    };

    return await enhancedImageUploadService.uploadImagesWithProgress(
      enhancedImages,
      materialId,
      {
        batchSize: Math.max(2, Math.min(batchSize, 3)), // Limit batch size for large uploads
        maxRetries: 3,
        timeoutMs: 120000, // 2 minutes per image
        compressionThreshold: 2 * 1024 * 1024, // 2MB
        maxImageSize: 1200,
        onProgress: enhancedProgressCallback
      }
    );
  }
  
  // Use legacy service for smaller batches
  console.log(`📦 Using standard upload service for ${imageCount} images`);
  return await uploadExtractedImagesWithProgress(images, materialId, onProgress, batchSize);
};

/**
 * Upload images with progress tracking and batch processing
 */
export const uploadExtractedImagesWithProgress = async (
  images: ImageReference[],
  materialId: string,
  onProgress?: UploadProgressCallback,
  batchSize: number = 3
): Promise<UploadedImage[]> => {
  const imagesToUpload = images.filter(img => img.imageBlob);
  const results: UploadedImage[] = [];
  
  console.log(`🚀 Starting batch upload of ${imagesToUpload.length} images (batch size: ${batchSize})`);
  console.log('📋 Images to upload:', imagesToUpload.map((img, index) => ({
    index: index + 1,
    slideNumber: img.slideNumber,
    description: img.description,
    blobSize: img.imageBlob?.size,
    blobType: img.imageBlob?.type
  })));
  
  // Process images in batches
  for (let batchStart = 0; batchStart < imagesToUpload.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, imagesToUpload.length);
    const batch = imagesToUpload.slice(batchStart, batchEnd);
    
    console.log(`Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(imagesToUpload.length / batchSize)} (images ${batchStart + 1}-${batchEnd})`);
    
    // Upload batch in parallel
    const batchPromises = batch.map(async (imageRef, batchIndex) => {
      const globalIndex = batchStart + batchIndex;
      
      console.log(`🚀 Starting upload for image ${globalIndex + 1}/${imagesToUpload.length} (slide ${imageRef.slideNumber})`);
      
      try {
        const filename = `slide_${imageRef.slideNumber}_image_${globalIndex + 1}`;
        
        // Add individual image timeout wrapper
        const uploadPromise = uploadImageBlob(
          imageRef.imageBlob!,
          filename,
          materialId,
          2, // retryCount (reasonable retry count)
          10000 // timeoutMs (much more reasonable 10s)
        );
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Individual image timeout after 15 seconds for image ${globalIndex + 1}`));
          }, 15000); // Much more reasonable timeout
        });
        
        const { url } = await Promise.race([uploadPromise, timeoutPromise]);
        
        console.log(`✅ Successfully processed image ${globalIndex + 1}/${imagesToUpload.length}`);
        
        return {
          url,
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber,
          index: globalIndex
        };
      } catch (error) {
        console.error(`❌ Failed to upload image ${globalIndex + 1}/${imagesToUpload.length} from slide ${imageRef.slideNumber}:`, error);
        
        return {
          url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber,
          index: globalIndex
        };
      }
    });
    
    // Wait for batch to complete with timeout
    try {
      console.log(`⏳ Waiting for batch ${Math.floor(batchStart / batchSize) + 1} to complete...`);
      
      // Add batch-level timeout (20 seconds per batch - reasonable)
      const batchTimeout = 20000;
      const batchTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Batch ${Math.floor(batchStart / batchSize) + 1} timeout after ${batchTimeout}ms`));
        }, batchTimeout);
      });
      
      const batchResults = await Promise.race([
        Promise.allSettled(batchPromises),
        batchTimeoutPromise
      ]);
      
      console.log(`✅ Batch ${Math.floor(batchStart / batchSize) + 1} completed, processing ${batchResults.length} results...`);
      
      batchResults.forEach((result, batchIndex) => {
        const globalIndex = batchStart + batchIndex;
        
        if (result.status === 'fulfilled') {
          results.push(result.value);
          console.log(`✅ Image ${globalIndex + 1}/${imagesToUpload.length} uploaded successfully`);
        } else {
          console.error(`❌ Image ${globalIndex + 1}/${imagesToUpload.length} failed:`, result.reason);
          const imageRef = batch[batchIndex];
          results.push({
            url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
            title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
            originalFilename: imageRef.filename,
            slideNumber: imageRef.slideNumber
          });
        }
        
        // Report progress after each image
        onProgress?.(globalIndex + 1, imagesToUpload.length);
      });
      
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(batchStart / batchSize) + 1} failed or timed out:`, error);
      
      // Handle batch timeout by creating fallbacks for all images in this batch
      batch.forEach((imageRef, batchIndex) => {
        const globalIndex = batchStart + batchIndex;
        console.log(`🔄 Creating fallback for timed out image ${globalIndex + 1}/${imagesToUpload.length}`);
        
        results.push({
          url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber
        });
        
        onProgress?.(globalIndex + 1, imagesToUpload.length);
      });
    }
    
    // Brief delay between batches to avoid overwhelming Firebase Storage
    if (batchEnd < imagesToUpload.length) {
      console.log(`⏳ Waiting 1 second before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Sort results by original index to maintain order
  results.sort((a, b) => (a.index || 0) - (b.index || 0));
  
  const successCount = results.filter(r => !r.url.startsWith('data:')).length;
  const failureCount = results.length - successCount;
  
  console.log(`Upload complete: ${successCount} successful, ${failureCount} failed out of ${results.length} total`);
  
  return results;
};
