// src/utils/textExtraction.ts

export interface TextExtractionResult {
  text: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    fileSize?: number;
    extractionMethod?: string;
  };
}

export interface TextExtractionError {
  message: string;
  code: string;
  originalError?: Error;
}

/**
 * Extract text from a PDF file using PDF.js (dynamic import for browser compatibility)
 */
export const extractTextFromPDF = async (file: File): Promise<TextExtractionResult> => {
  try {
    // Dynamic import for PDF.js to avoid build issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source for PDF.js - use local worker file served from public directory
    const basePath = import.meta.env.DEV ? '' : '/nexlab';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${basePath}/js/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into readable text
      // Safe type assertion for PDF.js text items
      const pageText = textContent.items
        .filter((item) => item && typeof (item as { str?: string }).str === 'string')
        .map((item) => (item as { str: string }).str)
        .join(' ')
        .trim();
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    }
    
    return {
      text: fullText.trim(),
      metadata: {
        pageCount: numPages,
        wordCount: fullText.trim().split(/\s+/).length,
        fileSize: file.size,
        extractionMethod: 'PDF.js'
      }
    };
  } catch (error) {
    throw {
      message: 'Failed to extract text from PDF file. Please ensure the PDF contains selectable text.',
      code: 'PDF_EXTRACTION_ERROR',
      originalError: error instanceof Error ? error : new Error(String(error))
    } as TextExtractionError;
  }
};

/**
 * Extract text from a DOCX file using mammoth
 */
export const extractTextFromDOCX = async (file: File): Promise<TextExtractionResult> => {
  try {
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    return {
      text: result.value.trim(),
      metadata: {
        wordCount: result.value.trim().split(/\s+/).length,
        fileSize: file.size,
        extractionMethod: 'Mammoth'
      }
    };
  } catch (error) {
    throw {
      message: 'Failed to extract text from Word document. Please ensure the file is not corrupted.',
      code: 'DOCX_EXTRACTION_ERROR',
      originalError: error instanceof Error ? error : new Error(String(error))
    } as TextExtractionError;
  }
};

/**
 * Extract text from a plain text file
 */
export const extractTextFromTXT = async (file: File): Promise<TextExtractionResult> => {
  try {
    const text = await file.text();
    
    return {
      text: text.trim(),
      metadata: {
        wordCount: text.trim().split(/\s+/).length,
        fileSize: file.size,
        extractionMethod: 'Native'
      }
    };
  } catch (error) {
    throw {
      message: 'Failed to extract text from text file',
      code: 'TXT_EXTRACTION_ERROR',
      originalError: error instanceof Error ? error : new Error(String(error))
    } as TextExtractionError;
  }
};

/**
 * Main text extraction function that determines the appropriate method based on file type
 */
export const extractTextFromFile = async (file: File): Promise<TextExtractionResult> => {
  if (!file) {
    throw {
      message: 'No file provided',
      code: 'NO_FILE_ERROR'
    } as TextExtractionError;
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  try {
    // Determine extraction method based on file type
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTXT(file);
    } else {
      throw {
        message: `Unsupported file format: ${fileType || 'unknown'}. Supported formats: PDF (.pdf), Word (.docx), Text (.txt)`,
        code: 'UNSUPPORTED_FORMAT_ERROR'
      } as TextExtractionError;
    }
  } catch (error) {
    // Re-throw TextExtractionError as-is, wrap other errors
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    throw {
      message: `Failed to extract text from ${file.name}`,
      code: 'GENERIC_EXTRACTION_ERROR',
      originalError: error instanceof Error ? error : new Error(String(error))
    } as TextExtractionError;
  }
};

/**
 * Validate file before text extraction
 */
export const validateFileForExtraction = (file: File): { isValid: boolean; error?: string } => {
  const maxFileSize = 50 * 1024 * 1024; // 50MB limit
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  
  // Check file size
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 50MB.`
    };
  }
  
  // Check file type
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const hasValidType = allowedTypes.includes(fileType);
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidType && !hasValidExtension) {
    return {
      isValid: false,
      error: `Unsupported file format. Please upload files with extensions: ${allowedExtensions.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Get human-readable file type description
 */
export const getFileTypeDescription = (file: File): string => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'PDF Document';
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return 'Word Document';
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return 'Text File';
  } else {
    return 'Unknown Format';
  }
};

/**
 * Estimate processing time based on file size and type
 */
export const estimateProcessingTime = (file: File): number => {
  const fileSizeInMB = file.size / (1024 * 1024);
  const fileType = file.type.toLowerCase();
  
  // Base processing time estimates (in seconds)
  let baseTime = 0;
  
  if (fileType === 'application/pdf') {
    baseTime = Math.max(2, fileSizeInMB * 0.5); // ~0.5 seconds per MB for PDFs
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    baseTime = Math.max(1, fileSizeInMB * 0.3); // ~0.3 seconds per MB for DOCX
  } else {
    baseTime = Math.max(0.5, fileSizeInMB * 0.1); // ~0.1 seconds per MB for text
  }
  
  return Math.round(baseTime);
}; 