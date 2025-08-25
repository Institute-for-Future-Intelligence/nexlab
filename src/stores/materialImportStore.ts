// src/stores/materialImportStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  MaterialImportService, 
  getMaterialImportService, 
  AIExtractedMaterialInfo,
  MaterialProcessingOptions,
  MaterialProcessingProgress
} from '../services/materialImportService';
import { 
  extractTextFromFile, 
  TextExtractionResult, 
  TextExtractionError,
  validateFileForExtraction,
  getFileTypeDescription 
} from '../utils/textExtraction';
import { Material } from '../types/Material';

export interface MaterialImportState {
  // Processing state
  isProcessing: boolean;
  progress: MaterialProcessingProgress | null;
  error: string | null;
  
  // File handling
  uploadedFile: File | null;
  extractedText: string | null;
  extractionResult: TextExtractionResult | null;
  
  // AI processing results
  aiExtractedData: AIExtractedMaterialInfo | null;
  convertedMaterial: Omit<Material, 'id' | 'timestamp'> | null;
  
  // Configuration
  processingOptions: MaterialProcessingOptions;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  extractTextFromFile: () => Promise<void>;
  processWithAI: (courseId: string, authorId: string, apiKey?: string) => Promise<void>;
  resetImport: () => void;
  setProcessingOptions: (options: Partial<MaterialProcessingOptions>) => void;
  setError: (error: string | null) => void;
}

const initialState = {
  isProcessing: false,
  progress: null,
  error: null,
  uploadedFile: null,
  extractedText: null,
  extractionResult: null,
  aiExtractedData: null,
  convertedMaterial: null,
  processingOptions: {
    maxOutputTokens: 4096,     // Reduced to prevent truncation issues
    topK: 1,                   // Most deterministic - pick the most likely token
    topP: 0.1,                 // Low creativity - prioritize factual extraction
    preserveFormatting: true,
    extractImages: true,
    extractLinks: true
  }
};

export const useMaterialImportStore = create<MaterialImportState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUploadedFile: (file: File | null) => {
        set({ 
          uploadedFile: file,
          extractedText: null,
          extractionResult: null,
          aiExtractedData: null,
          convertedMaterial: null,
          error: null
        });
      },

      extractTextFromFile: async () => {
        const { uploadedFile } = get();
        
        // Defensive: Check if file exists
        if (!uploadedFile) {
          set({ error: 'No file uploaded' });
          return;
        }

        // Defensive: Validate file before processing
        try {
          const validation = validateFileForExtraction(uploadedFile);
          if (!validation.isValid) {
            set({ error: validation.error || 'Invalid file' });
            return;
          }
        } catch (validationError) {
          console.error('File validation error:', validationError);
          set({ error: 'Failed to validate file' });
          return;
        }

        set({ 
          isProcessing: true, 
          error: null,
          progress: {
            stage: 'extracting',
            percentage: 10,
            currentOperation: `Extracting text from ${getFileTypeDescription(uploadedFile)}...`
          }
        });

        try {
          const result = await extractTextFromFile(uploadedFile);
          
          // Defensive: Validate extraction result
          if (!result || !result.text || result.text.trim().length === 0) {
            throw new Error('No text content could be extracted from the file');
          }

          // Defensive: Check text quality
          const wordCount = result.text.trim().split(/\s+/).length;
          if (wordCount < 5) {
            console.warn('Very short text extracted:', { wordCount, text: result.text.substring(0, 100) });
          }
          
          set({ 
            extractedText: result.text,
            extractionResult: result,
            progress: {
              stage: 'extracting',
              percentage: 100,
              currentOperation: 'Text extraction complete!'
            }
          });

          // Brief pause to show completion
          setTimeout(() => {
            set({ isProcessing: false, progress: null });
          }, 500);

        } catch (error) {
          console.error('Text extraction error:', error);
          const extractionError = error as TextExtractionError;
          
          // Defensive: Provide specific error messages
          let errorMessage = 'Failed to extract text from file';
          if (extractionError.code === 'PDF_EXTRACTION_ERROR') {
            errorMessage = 'Could not extract text from PDF. The file may be image-based or corrupted.';
          } else if (extractionError.code === 'DOCX_EXTRACTION_ERROR') {
            errorMessage = 'Could not extract text from Word document. Please check the file is not corrupted.';
          } else if (extractionError.code === 'PPTX_EXTRACTION_ERROR') {
            errorMessage = 'Could not extract text from PowerPoint presentation. Please ensure it contains text content.';
          } else if (extractionError.message) {
            errorMessage = extractionError.message;
          }

          set({ 
            error: errorMessage,
            isProcessing: false,
            progress: null
          });
        }
      },

      processWithAI: async (courseId: string, authorId: string, apiKey?: string) => {
        const { uploadedFile, extractedText, extractionResult, processingOptions } = get();
        
        // Defensive: Validate required parameters
        if (!courseId?.trim()) {
          set({ error: 'Course ID is required for AI processing' });
          return;
        }

        if (!authorId?.trim()) {
          set({ error: 'Author ID is required for AI processing' });
          return;
        }

        if (!uploadedFile || !extractedText?.trim()) {
          set({ error: 'No file or extracted text available for AI processing' });
          return;
        }

        // Defensive: Validate text content quality
        const wordCount = extractedText.trim().split(/\s+/).length;
        if (wordCount < 10) {
          set({ error: 'Extracted text is too short for meaningful AI processing (minimum 10 words required)' });
          return;
        }

        if (wordCount > 50000) {
          console.warn('Very large text content detected:', { wordCount, fileName: uploadedFile.name });
        }

        set({ 
          isProcessing: true, 
          error: null,
          progress: {
            stage: 'analyzing',
            percentage: 0,
            currentOperation: 'Initializing AI processing...'
          }
        });

        try {
          // Defensive: Get or initialize the material import service with error handling
          let materialImportService: MaterialImportService;
          try {
            materialImportService = getMaterialImportService(apiKey);
          } catch (serviceError) {
            console.error('Service initialization error:', serviceError);
            let errorMessage = 'Material import service not available.';
            
            if (serviceError instanceof Error) {
              if (serviceError.message.includes('API key')) {
                errorMessage = 'API key not configured. Please set VITE_GEMINI_MATERIAL_API_KEY or VITE_GEMINI_API_KEY environment variable.';
              } else {
                errorMessage = `Service error: ${serviceError.message}`;
              }
            }

            set({ 
              error: errorMessage,
              isProcessing: false,
              progress: null
            });
            return;
          }

          // Defensive: Validate processing options
          const safeProcessingOptions = {
            maxOutputTokens: Math.min(Math.max(processingOptions.maxOutputTokens || 16384, 8192), 32768),
            topK: Math.min(Math.max(processingOptions.topK || 3, 1), 10),
            topP: Math.min(Math.max(processingOptions.topP || 0.9, 0.1), 1.0),
            preserveFormatting: Boolean(processingOptions.preserveFormatting),
            extractImages: Boolean(processingOptions.extractImages),
            extractLinks: Boolean(processingOptions.extractLinks)
          };

          // Process with AI with timeout protection
          const processingTimeout = 120000; // 2 minutes timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('AI processing timeout - please try with a smaller file')), processingTimeout);
          });

          const aiResult = await Promise.race([
            materialImportService.processMaterialContent(
              extractedText,
              uploadedFile.name,
              uploadedFile.type,
              safeProcessingOptions,
              (progress) => {
                // Defensive: Validate progress updates
                if (progress && typeof progress === 'object') {
                  set({ progress });
                }
              },
              // Pass extraction metadata including images
              extractionResult?.metadata
            ),
            timeoutPromise
          ]);

          // Defensive: Validate AI result
          if (!aiResult || typeof aiResult !== 'object') {
            throw new Error('Invalid AI processing result received');
          }

          if (!aiResult.title?.trim()) {
            console.warn('AI result missing title, using filename as fallback');
            aiResult.title = uploadedFile.name.replace(/\.[^/.]+$/, '') || 'Untitled Material';
          }

          if (!aiResult.sections || !Array.isArray(aiResult.sections) || aiResult.sections.length === 0) {
            console.warn('AI result missing sections, creating default section');
            aiResult.sections = [{
              title: 'Main Content',
              content: 'Content extracted from uploaded material.',
              subsections: [],
              images: [],
              links: []
            }];
          }

          // Convert to Material format with defensive checks (sync version for preview)
          const materialData = materialImportService.convertToMaterialFormat(
            aiResult,
            courseId,
            authorId
          );

          // Note: This is the sync version for preview, actual image upload happens during save
          set({ 
            aiExtractedData: aiResult,
            convertedMaterial: materialData,
            isProcessing: false,
            progress: {
              stage: 'complete',
              percentage: 100,
              currentOperation: 'Material processing complete!'
            }
          });

          // Clear progress after brief display
          setTimeout(() => {
            set({ progress: null });
          }, 1500);

        } catch (error) {
          console.error('AI processing error:', error);
          
          // Defensive: Provide specific error messages based on error type
          let errorMessage = 'Failed to process material with AI';
          
          if (error instanceof Error) {
            if (error.message.includes('timeout')) {
              errorMessage = 'AI processing timed out. Please try with a smaller file or simpler content.';
            } else if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
              errorMessage = 'Invalid API key. Please check your API key configuration.';
            } else if (error.message.includes('RATE_LIMIT') || error.message.includes('rate limit')) {
              errorMessage = 'API rate limit exceeded. Please wait a few minutes before trying again.';
            } else if (error.message.includes('SAFETY') || error.message.includes('safety')) {
              errorMessage = 'Content flagged by safety filters. Please try with different content.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Network error. Please check your internet connection and try again.';
            } else {
              errorMessage = `AI processing failed: ${error.message}`;
            }
          }

          set({ 
            error: errorMessage,
            isProcessing: false,
            progress: null
          });
        }
      },

      resetImport: () => {
        set(initialState);
      },

      setProcessingOptions: (options: Partial<MaterialProcessingOptions>) => {
        set(state => ({
          processingOptions: { ...state.processingOptions, ...options }
        }));
      },

      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'material-import-store',
      // Only persist processing options, not transient state
      partialize: (state) => ({ 
        processingOptions: state.processingOptions 
      })
    }
  )
);

// Utility hooks for common operations
export const useMaterialImportActions = () => {
  const store = useMaterialImportStore();
  return {
    setUploadedFile: store.setUploadedFile,
    extractTextFromFile: store.extractTextFromFile,
    processWithAI: store.processWithAI,
    resetImport: store.resetImport,
    setProcessingOptions: store.setProcessingOptions,
    setError: store.setError
  };
};

export const useMaterialImportStatus = () => {
  const store = useMaterialImportStore();
  return {
    isProcessing: store.isProcessing,
    progress: store.progress,
    error: store.error,
    uploadedFile: store.uploadedFile,
    extractedText: store.extractedText,
    aiExtractedData: store.aiExtractedData,
    convertedMaterial: store.convertedMaterial,
    processingOptions: store.processingOptions
  };
};

// Helper function to convert material with image upload
export const convertMaterialWithImageUpload = async (
  courseId: string,
  authorId: string,
  materialId: string,
  onImageUploadProgress?: (completed: number, total: number) => void
) => {
  const store = useMaterialImportStore.getState();
  const { aiExtractedData, extractionResult } = store;
  
  if (!aiExtractedData) {
    throw new Error('No AI result available for conversion');
  }

  return await getMaterialImportService().convertToMaterialFormatWithImageUpload(
    aiExtractedData,
    courseId,
    authorId,
    materialId,
    extractionResult?.metadata,
    onImageUploadProgress
  );
};

// Helper function to check if import is ready for AI processing
export const useIsReadyForAI = () => {
  const { extractedText, isProcessing } = useMaterialImportStore();
  return !isProcessing && !!extractedText?.trim();
};

// Helper function to check if import is complete
export const useIsImportComplete = () => {
  const { convertedMaterial, isProcessing } = useMaterialImportStore();
  return !isProcessing && !!convertedMaterial;
};
