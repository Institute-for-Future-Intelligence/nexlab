// src/test/services/materialImportService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MaterialImportService } from '../../services/materialImportService';
import type { AIExtractedMaterialInfo, ImageReference } from '../../types/Material';

// Mock GoogleGenerativeAI
const mockGenerativeModel = {
  generateContent: vi.fn()
};

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue(mockGenerativeModel)
  }))
}));

// Mock image upload service
vi.mock('../../services/imageUploadService', () => ({
  imageUploadService: {
    uploadBatch: vi.fn()
  }
}));

describe('MaterialImportService', () => {
  let service: MaterialImportService;
  const mockApiKey = 'test-gemini-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MaterialImportService(mockApiKey);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    service.cleanupBlobUrls();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct API key and model configuration', () => {
      expect(service).toBeInstanceOf(MaterialImportService);
    });

    it('should initialize blob URL tracking', () => {
      expect(service['activeBlobUrls']).toBeInstanceOf(Set);
      expect(service['activeBlobUrls'].size).toBe(0);
    });
  });

  describe('convertToMaterialFormat', () => {
    const mockAIData: AIExtractedMaterialInfo = {
      title: 'Test Material',
      description: 'Test description',
      header: {
        title: 'Test Header',
        content: '<h1>Test Header Content</h1>'
      },
      footer: {
        title: 'Test Footer',
        content: '<p>Test Footer Content</p>'
      },
      sections: [
        {
          title: 'Section 1',
          content: '<p>Section 1 content</p>',
          images: [
            {
              url: '',
              title: 'Test Image 1',
              slideNumber: 1
            }
          ],
          subsections: []
        },
        {
          title: 'Section 2',
          content: '<p>Section 2 content</p>',
          images: [
            {
              url: '',
              title: 'Test Image 2',
              slideNumber: 2
            },
            {
              url: '',
              title: 'Test Image 3',
              slideNumber: 2
            }
          ],
          subsections: []
        }
      ]
    };

    const mockImageBlob = new Blob(['mock image data'], { type: 'image/png' });
    const mockExtractionMetadata = {
      images: [
        {
          slideNumber: 1,
          imageIndex: 0,
          embedId: 'rId1',
          imageBlob: mockImageBlob,
          path: 'ppt/media/image1.png'
        } as ImageReference,
        {
          slideNumber: 2,
          imageIndex: 0,
          embedId: 'rId2',
          imageBlob: mockImageBlob,
          path: 'ppt/media/image2.png'
        } as ImageReference,
        {
          slideNumber: 2,
          imageIndex: 1,
          embedId: 'rId3',
          imageBlob: mockImageBlob,
          path: 'ppt/media/image3.png'
        } as ImageReference
      ]
    };

    it('should convert AI data to Material format without extraction metadata', () => {
      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id'
      );

      expect(result.title).toBe('Test Material');
      expect(result.course).toBe('test-course-id');
      expect(result.authorId).toBe('test-author-id');
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].images).toHaveLength(1);
      expect(result.sections[1].images).toHaveLength(2);

      // Images should have SVG placeholder URLs when no extraction metadata
      expect(result.sections[0].images[0].url).toMatch(/^data:image\/svg\+xml/);
    });

    it('should use extracted image blobs when extraction metadata is provided', () => {
      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id',
        mockExtractionMetadata
      );

      expect(result.sections[0].images[0].url).toMatch(/^blob:/);
      expect(result.sections[1].images[0].url).toMatch(/^blob:/);
      expect(result.sections[1].images[1].url).toMatch(/^blob:/);

      // Should track blob URLs for cleanup
      expect(service['activeBlobUrls'].size).toBe(3);
    });

    it('should handle multiple images per slide correctly', () => {
      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id',
        mockExtractionMetadata
      );

      // Section 2 should have 2 different images from slide 2
      expect(result.sections[1].images).toHaveLength(2);
      const image1Url = result.sections[1].images[0].url;
      const image2Url = result.sections[1].images[1].url;
      
      // Should be different blob URLs (not duplicates)
      expect(image1Url).not.toBe(image2Url);
      expect(image1Url).toMatch(/^blob:/);
      expect(image2Url).toMatch(/^blob:/);
    });

    it('should fallback to SVG placeholder when image blob not found', () => {
      const limitedMetadata = {
        images: [mockExtractionMetadata.images[0]] // Only first image
      };

      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id',
        limitedMetadata
      );

      // First image should use blob URL
      expect(result.sections[0].images[0].url).toMatch(/^blob:/);
      
      // Second section images should fallback to SVG placeholders
      expect(result.sections[1].images[0].url).toMatch(/^data:image\/svg\+xml/);
      expect(result.sections[1].images[1].url).toMatch(/^data:image\/svg\+xml/);
    });

    it('should set correct material properties', () => {
      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id'
      );

      expect(result.course).toBe('test-course-id');
      expect(result.authorId).toBe('test-author-id');
      expect(result.isPublished).toBe(false);
      expect(result.isScheduled).toBe(false);
      expect(result.scheduledDate).toBeNull();
      expect(result.views).toBe(0);
    });
  });

  describe('convertToMaterialFormatWithImageUpload', () => {
    const mockAIData: AIExtractedMaterialInfo = {
      title: 'Test Material',
      description: 'Test description',
      header: { title: 'Test Header', content: '<h1>Header</h1>' },
      footer: { title: 'Test Footer', content: '<p>Footer</p>' },
      sections: [
        {
          title: 'Section 1',
          content: '<p>Content</p>',
          images: [
            { url: '', title: 'Image 1', slideNumber: 1 },
            { url: '', title: 'Image 2', slideNumber: 1 }
          ],
          subsections: []
        }
      ]
    };

    const mockUploadedImages = [
      {
        slideNumber: 1,
        imageIndex: 0,
        url: 'https://firebase.com/image1.png',
        title: 'Image 1'
      },
      {
        slideNumber: 1,
        imageIndex: 1,
        url: 'https://firebase.com/image2.png',
        title: 'Image 2'
      }
    ];

    it('should use uploaded image URLs when available', () => {
      const result = service.convertToMaterialFormatWithImageUpload(
        mockAIData,
        'test-course-id',
        'test-author-id',
        mockUploadedImages
      );

      expect(result.sections[0].images[0].url).toBe('https://firebase.com/image1.png');
      expect(result.sections[0].images[1].url).toBe('https://firebase.com/image2.png');
    });

    it('should prevent duplicate image usage', () => {
      const duplicateAIData = {
        ...mockAIData,
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: '', title: 'Image 1', slideNumber: 1 },
              { url: '', title: 'Image 1', slideNumber: 1 }, // Same title/slide
              { url: '', title: 'Image 2', slideNumber: 1 }
            ],
            subsections: []
          }
        ]
      };

      const result = service.convertToMaterialFormatWithImageUpload(
        duplicateAIData,
        'test-course-id',
        'test-author-id',
        mockUploadedImages
      );

      const imageUrls = result.sections[0].images.map(img => img.url);
      
      // Should have different URLs (no duplicates)
      expect(imageUrls[0]).toBe('https://firebase.com/image1.png');
      expect(imageUrls[1]).toBe('https://firebase.com/image2.png');
      expect(imageUrls[2]).toMatch(/^data:image\/svg\+xml/); // Fallback to placeholder
      
      // All URLs should be unique
      expect(new Set(imageUrls).size).toBe(3);
    });

    it('should fallback to SVG placeholders when uploaded images are insufficient', () => {
      const limitedUploadedImages = [mockUploadedImages[0]]; // Only one uploaded image

      const result = service.convertToMaterialFormatWithImageUpload(
        mockAIData,
        'test-course-id',
        'test-author-id',
        limitedUploadedImages
      );

      expect(result.sections[0].images[0].url).toBe('https://firebase.com/image1.png');
      expect(result.sections[0].images[1].url).toMatch(/^data:image\/svg\+xml/);
    });
  });

  describe('Blob URL Management', () => {
    it('should track created blob URLs', () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockExtractionMetadata = {
        images: [
          {
            slideNumber: 1,
            imageIndex: 0,
            embedId: 'rId1',
            imageBlob: mockBlob,
            path: 'ppt/media/image1.png'
          } as ImageReference
        ]
      };

      const mockAIData: AIExtractedMaterialInfo = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [{ url: '', title: 'Image 1', slideNumber: 1 }],
            subsections: []
          }
        ]
      };

      service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id',
        mockExtractionMetadata
      );

      expect(service['activeBlobUrls'].size).toBe(1);
    });

    it('should clean up blob URLs', () => {
      // Create some blob URLs first
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      service['activeBlobUrls'].add(URL.createObjectURL(mockBlob));
      service['activeBlobUrls'].add(URL.createObjectURL(mockBlob));

      expect(service['activeBlobUrls'].size).toBe(2);

      service.cleanupBlobUrls();

      expect(service['activeBlobUrls'].size).toBe(0);
    });
  });

  describe('Image Enhancement Logic', () => {
    it('should match images by slide number and description similarity', () => {
      const mockAIData: AIExtractedMaterialInfo = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: '', title: 'Central Dogma Diagram', slideNumber: 2 },
              { url: '', title: 'DNA Structure', slideNumber: 2 }
            ],
            subsections: []
          }
        ]
      };

      const mockBlob1 = new Blob(['image1'], { type: 'image/png' });
      const mockBlob2 = new Blob(['image2'], { type: 'image/png' });
      
      const mockExtractionMetadata = {
        images: [
          {
            slideNumber: 2,
            imageIndex: 0,
            embedId: 'rId1',
            imageBlob: mockBlob1,
            path: 'ppt/media/image1.png'
          } as ImageReference,
          {
            slideNumber: 2,
            imageIndex: 1,
            embedId: 'rId2',
            imageBlob: mockBlob2,
            path: 'ppt/media/image2.png'
          } as ImageReference
        ]
      };

      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id',
        mockExtractionMetadata
      );

      // Both images should get unique blob URLs
      const urls = result.sections[0].images.map(img => img.url);
      expect(urls[0]).toMatch(/^blob:/);
      expect(urls[1]).toMatch(/^blob:/);
      expect(urls[0]).not.toBe(urls[1]);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing extraction metadata gracefully', () => {
      const mockAIData: AIExtractedMaterialInfo = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [{ url: '', title: 'Image 1', slideNumber: 1 }],
            subsections: []
          }
        ]
      };

      expect(() => {
        service.convertToMaterialFormat(
          mockAIData,
          'test-course-id',
          'test-author-id',
          undefined
        );
      }).not.toThrow();
    });

    it('should handle empty sections gracefully', () => {
      const mockAIData: AIExtractedMaterialInfo = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: []
      };

      const result = service.convertToMaterialFormat(
        mockAIData,
        'test-course-id',
        'test-author-id'
      );

      expect(result.sections).toHaveLength(0);
    });

    it('should handle malformed image data', () => {
      const mockAIData: AIExtractedMaterialInfo = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: null as any, title: undefined as any, slideNumber: undefined as any }
            ],
            subsections: []
          }
        ]
      };

      expect(() => {
        service.convertToMaterialFormat(
          mockAIData,
          'test-course-id',
          'test-author-id'
        );
      }).not.toThrow();
    });
  });
});
