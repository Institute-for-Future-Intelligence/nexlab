// src/services/imageUploadService.ts

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Resizer from 'react-image-file-resizer';
import { ImageReference } from '../utils/textExtraction';

export interface UploadedImage {
  url: string;
  title: string;
  originalFilename?: string;
  slideNumber?: number;
  index?: number; // For maintaining order during batch processing
}

/**
 * Compress an image blob if it's too large
 */
const compressImageBlob = (blob: Blob, maxSizeBytes = 5 * 1024 * 1024): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (blob.size <= maxSizeBytes) {
      resolve(blob);
      return;
    }

    // Convert blob to file for resizer
    const file = new File([blob], 'image.jpg', { type: blob.type });
    
    Resizer.imageFileResizer(
      file,
      500,
      500,
      'JPEG',
      70,
      0,
      (result) => {
        if (result instanceof Blob) {
          resolve(result);
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
  timeoutMs: number = 30000
): Promise<{ url: string; path: string }> => {
  const storage = getStorage();
  
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // Compress if needed
      const compressedBlob = await compressImageBlob(imageBlob);
      
      // Generate unique filename
      const fileExtension = imageBlob.type.split('/')[1] || 'jpg';
      const uniqueFilename = `${filename}_${uuidv4()}.${fileExtension}`;
      
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
  const text = title.substring(0, 30);
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f44336"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">
        Upload Failed
      </text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Progress callback type for batch uploads
 */
export type UploadProgressCallback = (completed: number, total: number) => void;

/**
 * Upload images with progress tracking and batch processing
 */
export const uploadExtractedImagesWithProgress = async (
  images: ImageReference[],
  materialId: string,
  onProgress?: UploadProgressCallback,
  batchSize: number = 5
): Promise<UploadedImage[]> => {
  const imagesToUpload = images.filter(img => img.imageBlob);
  const results: UploadedImage[] = [];
  
  console.log(`Starting batch upload of ${imagesToUpload.length} images (batch size: ${batchSize})`);
  
  // Process images in batches
  for (let batchStart = 0; batchStart < imagesToUpload.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, imagesToUpload.length);
    const batch = imagesToUpload.slice(batchStart, batchEnd);
    
    console.log(`Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(imagesToUpload.length / batchSize)} (images ${batchStart + 1}-${batchEnd})`);
    
    // Upload batch in parallel
    const batchPromises = batch.map(async (imageRef, batchIndex) => {
      const globalIndex = batchStart + batchIndex;
      
      try {
        const filename = `slide_${imageRef.slideNumber}_image_${globalIndex + 1}`;
        const { url } = await uploadImageBlob(
          imageRef.imageBlob!,
          filename,
          materialId,
          3, // retryCount
          30000 // timeoutMs
        );
        
        return {
          url,
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber,
          index: globalIndex
        };
      } catch (error) {
        console.error(`Failed to upload image from slide ${imageRef.slideNumber} (index ${globalIndex}):`, error);
        
        return {
          url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
          title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
          originalFilename: imageRef.filename,
          slideNumber: imageRef.slideNumber,
          index: globalIndex
        };
      }
    });
    
    // Wait for batch to complete
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      
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
      console.error(`Batch upload failed:`, error);
    }
    
    // Small delay between batches to avoid overwhelming Firebase
    if (batchEnd < imagesToUpload.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Sort results by original index to maintain order
  results.sort((a, b) => (a.index || 0) - (b.index || 0));
  
  const successCount = results.filter(r => !r.url.startsWith('data:')).length;
  const failureCount = results.length - successCount;
  
  console.log(`Upload complete: ${successCount} successful, ${failureCount} failed out of ${results.length} total`);
  
  return results;
};
