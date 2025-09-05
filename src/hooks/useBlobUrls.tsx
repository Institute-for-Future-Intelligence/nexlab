// src/hooks/useBlobUrls.tsx

import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage blob URLs and automatically clean them up
 * This prevents memory leaks when using URL.createObjectURL
 */
export const useBlobUrls = () => {
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const createBlobUrl = (blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    blobUrlsRef.current.add(url);
    return url;
  };

  const revokeBlobUrl = (url: string) => {
    if (blobUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrlsRef.current.delete(url);
    }
  };

  const revokeAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  };

  // Cleanup all blob URLs when component unmounts
  useEffect(() => {
    return () => {
      revokeAllBlobUrls();
    };
  }, []);

  return {
    createBlobUrl,
    revokeBlobUrl,
    revokeAllBlobUrls
  };
};
