const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
};

const EXTENSION_TO_MIME_TYPE: Record<string, string> = Object.entries(MIME_TYPE_TO_EXTENSION).reduce(
  (acc, [mimeType, extension]) => {
    if (!acc[extension]) {
      acc[extension] = mimeType;
    }
    return acc;
  },
  {} as Record<string, string>
);

const stripExtension = (filename: string): string => filename.replace(/\.[^./\\]+$/, '');

export const sanitizeStorageBaseName = (filename: string): string => {
  const normalizedBaseName = stripExtension(filename)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  return normalizedBaseName || 'image';
};

export const inferImageExtension = (fileLike: { name?: string; type?: string }): string => {
  const normalizedType = fileLike.type?.toLowerCase();
  if (normalizedType && MIME_TYPE_TO_EXTENSION[normalizedType]) {
    return MIME_TYPE_TO_EXTENSION[normalizedType];
  }

  const extension = fileLike.name?.split('.').pop()?.toLowerCase();
  if (extension && EXTENSION_TO_MIME_TYPE[extension]) {
    return extension === 'jpeg' ? 'jpg' : extension;
  }

  return 'jpg';
};

export const resolveImageContentType = (fileLike: { name?: string; type?: string }): string => {
  const normalizedType = fileLike.type?.toLowerCase();
  if (normalizedType && MIME_TYPE_TO_EXTENSION[normalizedType]) {
    return normalizedType;
  }

  const extension = inferImageExtension(fileLike);
  return EXTENSION_TO_MIME_TYPE[extension] || 'image/jpeg';
};

export const buildStorageImageFilename = (
  fileLike: { name?: string; type?: string },
  uniqueSuffix: string
): string => {
  const baseName = sanitizeStorageBaseName(fileLike.name || 'image');
  const extension = inferImageExtension(fileLike);

  return `${baseName}-${uniqueSuffix}.${extension}`;
};
