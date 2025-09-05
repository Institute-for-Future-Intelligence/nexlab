// src/test/stores/materialImportStore.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMaterialImportStore } from '../../stores/materialImportStore';
import type { Material } from '../../types/Material';

// Mock the material import service
vi.mock('../../services/materialImportService', () => {
  const mockService = {
    extractFromFile: vi.fn(),
    processWithAI: vi.fn(),
    convertToMaterialFormat: vi.fn(),
    convertToMaterialFormatWithImageUpload: vi.fn(),
    cleanupBlobUrls: vi.fn()
  };
  
  return {
    MaterialImportService: vi.fn().mockImplementation(() => mockService),
    getMaterialImportService: vi.fn().mockReturnValue(mockService)
  };
});

// Mock text extraction
vi.mock('../../utils/textExtraction', () => ({
  extractTextFromFile: vi.fn()
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' }))
}));

describe('MaterialImportStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store to initial state
    useMaterialImportStore.getState().resetImport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useMaterialImportStore.getState();
      
      expect(state.isImporting).toBe(false);
      expect(state.importProgress).toBe(0);
      expect(state.currentStep).toBe('upload');
      expect(state.uploadedFile).toBeNull();
      expect(state.extractedText).toBe('');
      expect(state.extractionResult).toBeNull();
      expect(state.aiResult).toBeNull();
      expect(state.previewMaterial).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('File Upload', () => {
    it('should set uploaded file', () => {
      const mockFile = new File(['content'], 'test.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      
      useMaterialImportStore.getState().setUploadedFile(mockFile);
      
      const state = useMaterialImportStore.getState();
      expect(state.uploadedFile).toBe(mockFile);
      expect(state.currentStep).toBe('extract');
    });

    it('should clear previous results when setting new file', () => {
      const store = useMaterialImportStore.getState();
      
      // Set some previous state
      store.setExtractedText('previous text');
      store.setError('previous error');
      
      const mockFile = new File(['content'], 'test.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      store.setUploadedFile(mockFile);
      
      const state = useMaterialImportStore.getState();
      expect(state.extractedText).toBe('');
      expect(state.error).toBeNull();
    });
  });

  describe('Text Extraction', () => {
    it('should set extracted text and move to processing step', () => {
      const mockText = 'Extracted text content';
      
      useMaterialImportStore.getState().setExtractedText(mockText);
      
      const state = useMaterialImportStore.getState();
      expect(state.extractedText).toBe(mockText);
      expect(state.currentStep).toBe('process');
    });

    it('should set extraction result with metadata', () => {
      const mockExtractionResult = {
        text: 'Extracted text',
        metadata: {
          images: [
            {
              slideNumber: 1,
              imageIndex: 0,
              embedId: 'rId1',
              imageBlob: new Blob(['image'], { type: 'image/png' }),
              path: 'ppt/media/image1.png'
            }
          ],
          slideCount: 10,
          hasImages: true
        }
      };
      
      useMaterialImportStore.getState().setExtractionResult(mockExtractionResult);
      
      const state = useMaterialImportStore.getState();
      expect(state.extractionResult).toEqual(mockExtractionResult);
      expect(state.extractedText).toBe('Extracted text');
      expect(state.currentStep).toBe('process');
    });
  });

  describe('AI Processing', () => {
    it('should set AI result and generate preview', () => {
      const mockAIResult = {
        title: 'Test Material',
        description: 'Test description',
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

      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'Test Material',
        description: 'Test description',
        course: 'test-course',
        authorId: 'test-author',
        header: mockAIResult.header,
        footer: mockAIResult.footer,
        sections: mockAIResult.sections,
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      // Mock the conversion service
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.convertToMaterialFormat.mockReturnValue(mockPreviewMaterial);

      useMaterialImportStore.getState().setAIResult(mockAIResult, 'test-course', 'test-author');
      
      const state = useMaterialImportStore.getState();
      expect(state.aiResult).toEqual(mockAIResult);
      expect(state.previewMaterial).toEqual(mockPreviewMaterial);
      expect(state.currentStep).toBe('preview');
    });

    it('should handle AI processing errors gracefully', () => {
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.convertToMaterialFormat.mockImplementation(() => {
        throw new Error('Conversion failed');
      });

      const mockAIResult = {
        title: 'Test Material',
        description: 'Test description',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: []
      };

      useMaterialImportStore.getState().setAIResult(mockAIResult, 'test-course', 'test-author');
      
      const state = useMaterialImportStore.getState();
      expect(state.error).toBe('Failed to generate material preview: Conversion failed');
      expect(state.previewMaterial).toBeNull();
    });
  });

  describe('Progress Management', () => {
    it('should update import progress', () => {
      useMaterialImportStore.getState().setImportProgress(50);
      
      const state = useMaterialImportStore.getState();
      expect(state.importProgress).toBe(50);
    });

    it('should set processing state', () => {
      useMaterialImportStore.getState().setProcessing(true);
      
      const state = useMaterialImportStore.getState();
      expect(state.isProcessing).toBe(true);
    });

    it('should set importing state', () => {
      useMaterialImportStore.getState().setImporting(true);
      
      const state = useMaterialImportStore.getState();
      expect(state.isImporting).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const errorMessage = 'Test error message';
      
      useMaterialImportStore.getState().setError(errorMessage);
      
      let state = useMaterialImportStore.getState();
      expect(state.error).toBe(errorMessage);
      
      useMaterialImportStore.getState().setError(null);
      
      state = useMaterialImportStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('Step Navigation', () => {
    it('should navigate between steps correctly', () => {
      const store = useMaterialImportStore.getState();
      
      // Start at upload
      expect(store.currentStep).toBe('upload');
      
      // Move to extract
      const mockFile = new File(['content'], 'test.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      store.setUploadedFile(mockFile);
      expect(store.currentStep).toBe('extract');
      
      // Move to process
      store.setExtractedText('extracted text');
      expect(store.currentStep).toBe('process');
      
      // Move to preview
      const mockAIResult = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: []
      };
      
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.convertToMaterialFormat.mockReturnValue({
        title: 'Test',
        description: 'Test',
        course: 'test-course',
        authorId: 'test-author',
        header: mockAIResult.header,
        footer: mockAIResult.footer,
        sections: [],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      });
      
      store.setAIResult(mockAIResult, 'test-course', 'test-author');
      expect(store.currentStep).toBe('preview');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all state to initial values', () => {
      const store = useMaterialImportStore.getState();
      
      // Set some state
      store.setImporting(true);
      store.setImportProgress(75);
      store.setUploadedFile(new File(['test'], 'test.pptx'));
      store.setExtractedText('some text');
      store.setError('some error');
      store.setProcessing(true);
      
      // Reset
      store.resetImport();
      
      const state = useMaterialImportStore.getState();
      expect(state.isImporting).toBe(false);
      expect(state.importProgress).toBe(0);
      expect(state.currentStep).toBe('upload');
      expect(state.uploadedFile).toBeNull();
      expect(state.extractedText).toBe('');
      expect(state.extractionResult).toBeNull();
      expect(state.aiResult).toBeNull();
      expect(state.previewMaterial).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isProcessing).toBe(false);
    });

    it('should cleanup blob URLs during reset', () => {
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      
      useMaterialImportStore.getState().resetImport();
      
      expect(mockService.cleanupBlobUrls).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully during reset', () => {
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.cleanupBlobUrls.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      // Should not throw
      expect(() => {
        useMaterialImportStore.getState().resetImport();
      }).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete import workflow', () => {
      const store = useMaterialImportStore.getState();
      
      // 1. Upload file
      const mockFile = new File(['content'], 'test.pptx');
      store.setUploadedFile(mockFile);
      expect(store.currentStep).toBe('extract');
      
      // 2. Extract text with images
      const mockExtractionResult = {
        text: 'Extracted content',
        metadata: {
          images: [
            {
              slideNumber: 1,
              imageIndex: 0,
              embedId: 'rId1',
              imageBlob: new Blob(['image'], { type: 'image/png' }),
              path: 'ppt/media/image1.png'
            }
          ],
          slideCount: 5,
          hasImages: true
        }
      };
      store.setExtractionResult(mockExtractionResult);
      expect(store.currentStep).toBe('process');
      
      // 3. Process with AI
      const mockAIResult = {
        title: 'Processed Material',
        description: 'AI-processed content',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content with image</p>',
            images: [{ url: '', title: 'Diagram', slideNumber: 1 }],
            subsections: []
          }
        ]
      };
      
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.convertToMaterialFormat.mockReturnValue({
        title: 'Processed Material',
        description: 'AI-processed content',
        course: 'course-123',
        authorId: 'author-456',
        header: mockAIResult.header,
        footer: mockAIResult.footer,
        sections: mockAIResult.sections,
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      });
      
      store.setAIResult(mockAIResult, 'course-123', 'author-456');
      expect(store.currentStep).toBe('preview');
      
      // 4. Verify final state
      const finalState = useMaterialImportStore.getState();
      expect(finalState.previewMaterial).toBeDefined();
      expect(finalState.previewMaterial!.title).toBe('Processed Material');
      expect(finalState.previewMaterial!.sections[0].images).toHaveLength(1);
    });

    it('should handle errors at different stages', () => {
      const store = useMaterialImportStore.getState();
      
      // Error during upload
      store.setError('Upload failed');
      expect(store.error).toBe('Upload failed');
      expect(store.currentStep).toBe('upload');
      
      // Clear error and continue
      store.setError(null);
      const mockFile = new File(['content'], 'test.pptx');
      store.setUploadedFile(mockFile);
      
      // Error during AI processing
      const mockService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockService.convertToMaterialFormat.mockImplementation(() => {
        throw new Error('AI processing failed');
      });
      
      const mockAIResult = {
        title: 'Test',
        description: 'Test',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: []
      };
      
      store.setAIResult(mockAIResult, 'course-123', 'author-456');
      
      expect(store.error).toContain('Failed to generate material preview');
      expect(store.previewMaterial).toBeNull();
    });
  });
});
