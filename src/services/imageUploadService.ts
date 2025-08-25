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
 * Upload a single image blob to Firebase Storage
 */
export const uploadImageBlob = async (
  imageBlob: Blob,
  filename: string,
  sectionId: string
): Promise<{ url: string; path: string }> => {
  const storage = getStorage();
  
  try {
    // Compress if needed
    const compressedBlob = await compressImageBlob(imageBlob);
    
    // Generate unique filename
    const fileExtension = imageBlob.type.split('/')[1] || 'jpg';
    const uniqueFilename = `${filename}_${uuidv4()}.${fileExtension}`;
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `materials/${sectionId}/${uniqueFilename}`);
    const snapshot = await uploadBytes(storageRef, compressedBlob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`Successfully uploaded image: ${uniqueFilename}`, {
      originalSize: imageBlob.size,
      compressedSize: compressedBlob.size,
      url: downloadURL
    });
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error(`Failed to upload image ${filename}:`, error);
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
 * Upload images with progress tracking
 */
export const uploadExtractedImagesWithProgress = async (
  images: ImageReference[],
  materialId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadedImage[]> => {
  const imagesToUpload = images.filter(img => img.imageBlob);
  const results: UploadedImage[] = [];
  
  for (let i = 0; i < imagesToUpload.length; i++) {
    const imageRef = imagesToUpload[i];
    
    try {
      const filename = `slide_${imageRef.slideNumber}_image_${i + 1}`;
      const { url } = await uploadImageBlob(
        imageRef.imageBlob!,
        filename,
        materialId
      );
      
      results.push({
        url,
        title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
        originalFilename: imageRef.filename,
        slideNumber: imageRef.slideNumber
      });
    } catch (error) {
      console.error(`Failed to upload image from slide ${imageRef.slideNumber}:`, error);
      
      results.push({
        url: createFallbackPlaceholder(imageRef.description || `Image from Slide ${imageRef.slideNumber}`),
        title: imageRef.description || `Image from Slide ${imageRef.slideNumber}`,
        originalFilename: imageRef.filename,
        slideNumber: imageRef.slideNumber
      });
    }
    
    // Report progress
    onProgress?.(i + 1, imagesToUpload.length);
  }
  
  return results;
};
