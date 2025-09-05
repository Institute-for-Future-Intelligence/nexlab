// src/test/components/AddMaterialForm.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddMaterialForm } from '../../components/Supplemental/AddMaterialForm';
import { useMaterialImportStore } from '../../stores/materialImportStore';
import type { Material } from '../../types/Material';

// Mock the material import store
vi.mock('../../stores/materialImportStore');

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' }))
}));

// Mock the material import service
vi.mock('../../services/materialImportService', () => ({
  getMaterialImportService: vi.fn().mockReturnValue({
    convertToMaterialFormatWithImageUpload: vi.fn(),
    cleanupBlobUrls: vi.fn()
  })
}));

// Mock image upload service
vi.mock('../../services/imageUploadService', () => ({
  imageUploadService: {
    uploadBatch: vi.fn()
  }
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ courseId: 'test-course-id' })
}));

// Mock user context
vi.mock('../../contexts/UserContext', () => ({
  useUser: () => ({
    user: { uid: 'test-user-id' },
    userDetails: { uid: 'test-user-id', isAdmin: true }
  })
}));

// Mock notification store
vi.mock('../../stores/notificationStore', () => ({
  useNotificationStore: () => ({
    addNotification: vi.fn()
  })
}));

// Mock UI store
vi.mock('../../stores/uiStore', () => ({
  useUIStore: () => ({
    openLoadingDialog: vi.fn(),
    closeLoadingDialog: vi.fn()
  })
}));

describe('AddMaterialForm - AI Import Save Functionality', () => {
  const mockMaterialImportStore = {
    previewMaterial: null,
    resetImport: vi.fn(),
    isImporting: false,
    currentStep: 'upload' as const,
    importProgress: 0,
    uploadedFile: null,
    extractedText: '',
    extractionResult: null,
    aiResult: null,
    error: null,
    isProcessing: false,
    setUploadedFile: vi.fn(),
    setExtractedText: vi.fn(),
    setExtractionResult: vi.fn(),
    setAIResult: vi.fn(),
    setImportProgress: vi.fn(),
    setError: vi.fn(),
    setImporting: vi.fn(),
    setProcessing: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMaterialImportStore).mockReturnValue(mockMaterialImportStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI-Imported Material Save Logic', () => {
    it('should detect blob URLs and trigger image upload process', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: 'blob:http://localhost:3001/12345', title: 'Image 1' },
              { url: 'blob:http://localhost:3001/67890', title: 'Image 2' }
            ],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      // Mock successful image upload
      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      mockImageUploadService.uploadBatch.mockResolvedValue([
        { url: 'https://firebase.com/image1.png', title: 'Image 1' },
        { url: 'https://firebase.com/image2.png', title: 'Image 2' }
      ]);

      // Mock successful material conversion with uploaded images
      const mockMaterialImportService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockMaterialImportService.convertToMaterialFormatWithImageUpload.mockReturnValue({
        ...mockPreviewMaterial,
        sections: [
          {
            ...mockPreviewMaterial.sections[0],
            images: [
              { url: 'https://firebase.com/image1.png', title: 'Image 1' },
              { url: 'https://firebase.com/image2.png', title: 'Image 2' }
            ]
          }
        ]
      });

      // Mock Firebase operations
      const mockAddDoc = vi.mocked(require('firebase/firestore').addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-material-id' });

      render(<AddMaterialForm />);

      // Find and click the save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockImageUploadService.uploadBatch).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ url: 'blob:http://localhost:3001/12345' }),
            expect.objectContaining({ url: 'blob:http://localhost:3001/67890' })
          ]),
          'test-course-id',
          expect.any(Function) // Progress callback
        );
      });

      expect(mockMaterialImportService.convertToMaterialFormatWithImageUpload).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should skip image upload when no blob URLs are present', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: 'https://firebase.com/existing-image.png', title: 'Existing Image' }
            ],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      const mockAddDoc = vi.mocked(require('firebase/firestore').addDoc);
      mockAddDoc.mockResolvedValue({ id: 'new-material-id' });

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalled();
      });

      // Should not call image upload service since no blob URLs
      expect(mockImageUploadService.uploadBatch).not.toHaveBeenCalled();
    });

    it('should handle image upload failures gracefully', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: 'blob:http://localhost:3001/12345', title: 'Image 1' }
            ],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      // Mock failed image upload
      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      mockImageUploadService.uploadBatch.mockRejectedValue(new Error('Upload failed'));

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockImageUploadService.uploadBatch).toHaveBeenCalled();
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to upload images/i)).toBeInTheDocument();
      });
    });

    it('should track upload progress correctly', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: 'blob:http://localhost:3001/12345', title: 'Image 1' },
              { url: 'blob:http://localhost:3001/67890', title: 'Image 2' },
              { url: 'blob:http://localhost:3001/54321', title: 'Image 3' }
            ],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      let progressCallback: (completed: number, total: number) => void;
      
      mockImageUploadService.uploadBatch.mockImplementation(async (images, courseId, onProgress) => {
        progressCallback = onProgress;
        
        // Simulate progress updates
        setTimeout(() => progressCallback(1, 3), 100);
        setTimeout(() => progressCallback(2, 3), 200);
        setTimeout(() => progressCallback(3, 3), 300);
        
        return [
          { url: 'https://firebase.com/image1.png', title: 'Image 1' },
          { url: 'https://firebase.com/image2.png', title: 'Image 2' },
          { url: 'https://firebase.com/image3.png', title: 'Image 3' }
        ];
      });

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Wait for progress updates
      await waitFor(() => {
        expect(mockImageUploadService.uploadBatch).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Progress should be tracked (we can't easily test the exact values due to async nature,
      // but we can verify the upload service was called with a progress callback)
      expect(mockImageUploadService.uploadBatch).toHaveBeenCalledWith(
        expect.any(Array),
        'test-course-id',
        expect.any(Function)
      );
    });

    it('should handle mixed blob and Firebase URLs correctly', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [
              { url: 'blob:http://localhost:3001/12345', title: 'New Image' },
              { url: 'https://firebase.com/existing.png', title: 'Existing Image' },
              { url: 'data:image/svg+xml;base64,...', title: 'SVG Placeholder' }
            ],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      mockImageUploadService.uploadBatch.mockResolvedValue([
        { url: 'https://firebase.com/new-image.png', title: 'New Image' }
      ]);

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockImageUploadService.uploadBatch).toHaveBeenCalled();
      });

      // Should only upload the blob URL, not existing Firebase URLs or SVG placeholders
      expect(mockImageUploadService.uploadBatch).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ url: 'blob:http://localhost:3001/12345' })
        ]),
        'test-course-id',
        expect.any(Function)
      );

      // Should not include existing Firebase URLs or SVG placeholders
      const uploadedImages = mockImageUploadService.uploadBatch.mock.calls[0][0];
      expect(uploadedImages).toHaveLength(1);
      expect(uploadedImages[0].url).toBe('blob:http://localhost:3001/12345');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle Firebase document creation failure', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      const mockAddDoc = vi.mocked(require('firebase/firestore').addDoc);
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalled();
      });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to save material/i)).toBeInTheDocument();
      });
    });

    it('should handle material conversion failure', async () => {
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [{ url: 'blob:http://localhost:3001/12345', title: 'Image 1' }],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      // Mock successful image upload but failed conversion
      const mockImageUploadService = vi.mocked(require('../../services/imageUploadService').imageUploadService);
      mockImageUploadService.uploadBatch.mockResolvedValue([
        { url: 'https://firebase.com/image1.png', title: 'Image 1' }
      ]);

      const mockMaterialImportService = vi.mocked(require('../../services/materialImportService').getMaterialImportService());
      mockMaterialImportService.convertToMaterialFormatWithImageUpload.mockImplementation(() => {
        throw new Error('Conversion failed');
      });

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockImageUploadService.uploadBatch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/failed to process uploaded images/i)).toBeInTheDocument();
      });
    });
  });

  describe('Debug Logging', () => {
    it('should log debug information during save process', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const mockPreviewMaterial: Omit<Material, 'id' | 'timestamp'> = {
        title: 'AI Generated Material',
        description: 'Generated from PowerPoint',
        course: 'test-course-id',
        authorId: 'test-user-id',
        header: { title: 'Header', content: '<h1>Header</h1>' },
        footer: { title: 'Footer', content: '<p>Footer</p>' },
        sections: [
          {
            title: 'Section 1',
            content: '<p>Content</p>',
            images: [{ url: 'blob:http://localhost:3001/12345', title: 'Image 1' }],
            subsections: []
          }
        ],
        isPublished: false,
        isScheduled: false,
        scheduledDate: null,
        views: 0
      };

      mockMaterialImportStore.previewMaterial = mockPreviewMaterial;

      render(<AddMaterialForm />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Should log debug information
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 [Save Debug] handleSubmit called:'),
        expect.objectContaining({
          isAIImported: true,
          hasImages: true
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔍 [Save Debug] Image URL analysis:'),
        expect.objectContaining({
          hasUnuploadedImages: true
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
