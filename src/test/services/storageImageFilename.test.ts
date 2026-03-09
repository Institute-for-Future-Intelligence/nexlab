import { describe, expect, it } from 'vitest';
import {
  buildStorageImageFilename,
  resolveImageContentType,
  sanitizeStorageBaseName,
} from '../../utils/storageImageFilename';

describe('storageImageFilename', () => {
  it('sanitizes unicode-heavy screenshot names for storage paths', () => {
    expect(sanitizeStorageBaseName('Screenshot 2026-03-09 at 2.35.44\u202fPM.png')).toBe(
      'Screenshot-2026-03-09-at-2-35-44-PM'
    );
  });

  it('keeps the uploaded image type when building the storage filename', () => {
    const filename = buildStorageImageFilename(
      {
        name: 'Screenshot 2026-03-09 at 2.35.44\u202fPM.png',
        type: 'image/jpeg',
      },
      'upload-123'
    );

    expect(filename).toBe('Screenshot-2026-03-09-at-2-35-44-PM-upload-123.jpg');
  });

  it('infers a safe image content type from the filename when needed', () => {
    expect(resolveImageContentType({ name: 'diagram.webp', type: '' })).toBe('image/webp');
    expect(resolveImageContentType({ name: 'unknown-image', type: '' })).toBe('image/jpeg');
  });
});
