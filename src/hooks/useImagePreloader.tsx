// src/hooks/useImagePreloader.tsx
import { useEffect, useCallback } from 'react';

interface ImagePreloaderOptions {
  enabled?: boolean;
  priority?: 'high' | 'low';
}

/**
 * Custom hook for preloading images to improve perceived performance
 */
export const useImagePreloader = (
  imageUrls: string[],
  options: ImagePreloaderOptions = { enabled: true, priority: 'low' }
) => {
  const preloadImages = useCallback((urls: string[]) => {
    if (!options.enabled || urls.length === 0) return;

    // Create a batch of image preloads
    urls.forEach((url, index) => {
      if (!url || url.startsWith('data:')) return; // Skip data URIs and empty URLs

      const img = new Image();
      
      // Set loading priority for better performance
      if ('loading' in img) {
        img.loading = 'lazy';
      }
      
      // Add slight delay for low priority images to not block main content
      const delay = options.priority === 'low' ? index * 100 : 0;
      
      setTimeout(() => {
        img.src = url;
        
        img.onload = () => {
          console.log(`✅ Preloaded image: ${url.substring(0, 50)}...`);
        };
        
        img.onerror = (error) => {
          console.error(`❌ Failed to preload image: ${url}`, error);
          console.error(`Image details:`, {
            url,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete
          });
        };
      }, delay);
    });
  }, [options.enabled, options.priority]);

  useEffect(() => {
    preloadImages(imageUrls);
  }, [imageUrls, preloadImages]);

  return { preloadImages };
};

/**
 * Hook for preloading images from adjacent sections for smooth navigation
 */
export const useAdjacentSectionPreloader = (
  sections: any[],
  currentSectionIndex: number,
  enabled: boolean = true
) => {
  const { preloadImages } = useImagePreloader([], { enabled, priority: 'low' });

  useEffect(() => {
    if (!enabled || !sections.length) return;

    // Get images from previous and next sections
    const adjacentImages: string[] = [];
    
    // Previous section
    if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      if (prevSection?.images) {
        adjacentImages.push(...prevSection.images.map((img: any) => img.url));
      }
      // Include subsection images
      prevSection?.subsections?.forEach((sub: any) => {
        if (sub.images) {
          adjacentImages.push(...sub.images.map((img: any) => img.url));
        }
        sub?.subSubsections?.forEach((subSub: any) => {
          if (subSub.images) {
            adjacentImages.push(...subSub.images.map((img: any) => img.url));
          }
        });
      });
    }

    // Next section
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      if (nextSection?.images) {
        adjacentImages.push(...nextSection.images.map((img: any) => img.url));
      }
      // Include subsection images
      nextSection?.subsections?.forEach((sub: any) => {
        if (sub.images) {
          adjacentImages.push(...sub.images.map((img: any) => img.url));
        }
        sub?.subSubsections?.forEach((subSub: any) => {
          if (subSub.images) {
            adjacentImages.push(...subSub.images.map((img: any) => img.url));
          }
        });
      });
    }

    // Preload unique images
    const uniqueImages = Array.from(new Set(adjacentImages.filter(Boolean)));
    if (uniqueImages.length > 0) {
      console.log(`Preloading ${uniqueImages.length} images from adjacent sections`);
      preloadImages(uniqueImages);
    }
  }, [sections, currentSectionIndex, enabled, preloadImages]);
};
