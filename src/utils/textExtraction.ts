// src/utils/textExtraction.ts

export interface TextExtractionResult {
  text: string;
  metadata?: {
    pageCount?: number;
    slideCount?: number;
    wordCount?: number;
    fileSize?: number;
    extractionMethod?: string;
    images?: ImageReference[];
  };
}

export interface ImageReference {
  slideNumber?: number;
  pageNumber?: number;
  description?: string;
  altText?: string;
  filename?: string;
  embedId?: string; // Reference ID for finding the actual image data
  imageBlob?: Blob; // Actual image data extracted from file
  position?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
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
 * Extract text from a PowerPoint (.pptx) file using pizzip
 */
export const extractTextFromPPTX = async (file: File): Promise<TextExtractionResult> => {
  try {
    const PizZip = (await import('pizzip')).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    
    let fullText = '';
    let slideCount = 0;
    const images: ImageReference[] = [];
    
    // Extract text from slides
    const slideFiles = Object.keys(zip.files).filter(filename => 
      filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
    );
    
    slideCount = slideFiles.length;
    
    for (const slideFile of slideFiles) {
      try {
        const slideContent = zip.files[slideFile].asText();
        const slideNumber = parseInt(slideFile.match(/slide(\d+)\.xml/)?.[1] || '0');
        
        // Extract image references from slide XML
        const imageMatches = slideContent.matchAll(/<a:blip[^>]*r:embed="([^"]*)"[^>]*>/g);
        for (const match of imageMatches) {
          const embedId = match[1];
          
          // Try to find description or alt text with multiple patterns
          const descriptionMatch = slideContent.match(new RegExp(`<p:cNvPr[^>]*name="([^"]*)"[^>]*>`, 'i'));
          const altTextMatch = slideContent.match(new RegExp(`<p:cNvPr[^>]*descr="([^"]*)"[^>]*>`, 'i'));
          
          // Extract comprehensive text content from slide with better parsing
          const textElements = slideContent.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g);
          const slideTexts = [];
          
          for (const textMatch of textElements) {
            let text = textMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .trim();
            
            // Remove any remaining XML tags that might have been missed
            text = text.replace(/<[^>]*>/g, '');
            
            if (text && text.length > 1) {
              slideTexts.push(text);
            }
          }
          
          // Try to get slide title specifically
          const titleMatch = slideContent.match(/<p:ph[^>]*type="title"[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>/i) ||
                            slideContent.match(/<p:ph[^>]*type="ctrTitle"[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>/i);
          
          let slideTitle = '';
          if (titleMatch) {
            slideTitle = titleMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/<[^>]*>/g, '') // Remove any XML tags
              .trim();
          }
          
          // Generate comprehensive description
          let contextualDescription = `Image on slide ${slideNumber}`;
          
          // First try: use actual image name from PowerPoint
          if (descriptionMatch && descriptionMatch[1] && descriptionMatch[1] !== 'Picture 1') {
            contextualDescription = descriptionMatch[1];
          }
          // Second try: use alt text
          else if (altTextMatch && altTextMatch[1]) {
            contextualDescription = altTextMatch[1];
          }
          // Third try: use slide title as context
          else if (slideTitle && slideTitle.length > 3) {
            contextualDescription = `Image from "${slideTitle}" (Slide ${slideNumber})`;
          }
          // Fourth try: use first meaningful text from slide
          else if (slideTexts.length > 0) {
            const meaningfulText = slideTexts.find(text => text.length > 10) || slideTexts[0];
            if (meaningfulText && meaningfulText.length <= 50) {
              contextualDescription = `Image: ${meaningfulText} (Slide ${slideNumber})`;
            } else if (meaningfulText) {
              contextualDescription = `Image: ${meaningfulText.substring(0, 47)}... (Slide ${slideNumber})`;
            }
          }
          
          // Try to extract the actual image blob
          let imageBlob: Blob | undefined;
          try {
            // Look for the relationship file to find the actual image path
            const relsFile = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
            if (zip.files[relsFile]) {
              const relsContent = zip.files[relsFile].asText();
              const relationshipMatch = relsContent.match(new RegExp(`Id="${embedId}"[^>]*Target="([^"]*)"`, 'i'));
              
              if (relationshipMatch) {
                const imagePath = relationshipMatch[1];
                const fullImagePath = imagePath.startsWith('../') ? 
                  `ppt/${imagePath.substring(3)}` : 
                  `ppt/slides/${imagePath}`;
                
                if (zip.files[fullImagePath]) {
                  const imageData = zip.files[fullImagePath].asUint8Array();
                  
                  // Determine MIME type based on file extension
                  let mimeType = 'image/jpeg'; // default
                  const pathLower = fullImagePath.toLowerCase();
                  
                  if (pathLower.includes('.png')) {
                    mimeType = 'image/png';
                  } else if (pathLower.includes('.gif')) {
                    mimeType = 'image/gif';
                  } else if (pathLower.includes('.bmp')) {
                    mimeType = 'image/bmp';
                  } else if (pathLower.includes('.webp')) {
                    mimeType = 'image/webp';
                  } else if (pathLower.includes('.emf') || pathLower.includes('.wmf')) {
                    // EMF/WMF files are vector formats - convert to PNG for web compatibility
                    console.log(`Converting vector image format to PNG: ${fullImagePath}`);
                    mimeType = 'image/png'; // We'll convert EMF to PNG
                  }
                  
                  imageBlob = new Blob([imageData], { type: mimeType });
                  console.log(`Extracted image blob for slide ${slideNumber}:`, {
                    size: imageBlob.size,
                    type: mimeType,
                    path: fullImagePath
                  });
                }
              }
            }
          } catch (blobError) {
            console.warn(`Failed to extract image blob for ${embedId} on slide ${slideNumber}:`, blobError);
          }
          
          images.push({
            slideNumber,
            description: descriptionMatch?.[1] || contextualDescription,
            altText: altTextMatch?.[1] || undefined,
            filename: embedId,
            embedId,
            imageBlob
          });
        }
        
        // Enhanced text extraction with better structure preservation
        const extractStructuredText = (content: string): string => {
          // Extract slide title first
          const titleMatch = content.match(/<p:ph[^>]*type="title"[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>/i) ||
                             content.match(/<p:ph[^>]*type="ctrTitle"[^>]*>[\s\S]*?<a:t[^>]*>(.*?)<\/a:t>/i);
          
          let slideTitle = '';
          if (titleMatch) {
            slideTitle = titleMatch[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/<[^>]*>/g, '') // Remove any XML tags
              .trim();
          }
          
          // Extract text runs with better structure
          const textRuns = [];
          const textMatches = content.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g);
          
          for (const match of textMatches) {
            let text = match[1]
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/<[^>]*>/g, '') // Remove any XML tags
              .trim();
            
            if (text && text.length > 1) {
              textRuns.push(text);
            }
          }
          
          // Try to detect bullet points and lists
          const bulletPatterns = [
            /^[\u2022\u2023\u25E6\u2043\u2219]\s*/,  // Various bullet characters
            /^\d+\.\s*/,  // Numbered lists
            /^[a-zA-Z]\.\s*/,  // Letter lists
            /^[-*]\s*/  // Dash/asterisk bullets
          ];
          
          const processedRuns = textRuns.map(text => {
            // Check if this looks like a bullet point
            const isBullet = bulletPatterns.some(pattern => pattern.test(text));
            
            if (isBullet) {
              return `• ${text.replace(/^[\u2022\u2023\u25E6\u2043\u2219\-\*\d+\.\s*[a-zA-Z]\.\s*]/, '').trim()}`;
            }
            
            return text;
          });
          
          // Combine into structured output
          let result = '';
          if (slideTitle && slideTitle !== processedRuns[0]) {
            result += `TITLE: ${slideTitle}\n\n`;
          }
          
          if (processedRuns.length > 0) {
            result += processedRuns.join('\n');
          }
          
          return result.trim();
        };
        
        const textContent = extractStructuredText(slideContent);
        
        if (textContent) {
          fullText += `\n--- Slide ${slideNumber} ---\n${textContent}\n`;
        }
        
        // Add image references to text for AI processing
        const slideImages = images.filter(img => img.slideNumber === slideNumber);
        if (slideImages.length > 0) {
          fullText += `\n[IMAGES ON SLIDE ${slideNumber}]: `;
          slideImages.forEach(img => {
            fullText += `"${img.description}"${img.altText ? ` (${img.altText})` : ''}, `;
          });
          fullText = fullText.slice(0, -2) + '\n'; // Remove trailing comma
        }
      } catch (slideError) {
        console.warn(`Failed to extract text from ${slideFile}:`, slideError);
      }
    }
    
    // Also try to extract from notes if present
    const notesFiles = Object.keys(zip.files).filter(filename => 
      filename.startsWith('ppt/notesSlides/notesSlide') && filename.endsWith('.xml')
    );
    
    for (const notesFile of notesFiles) {
      try {
        const notesContent = zip.files[notesFile].asText();
        const textContent = notesContent
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (textContent) {
          const slideNumber = notesFile.match(/notesSlide(\d+)\.xml/)?.[1] || 'unknown';
          fullText += `\n--- Notes for Slide ${slideNumber} ---\n${textContent}\n`;
        }
      } catch (notesError) {
        console.warn(`Failed to extract notes from ${notesFile}:`, notesError);
      }
    }
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PowerPoint file');
    }
    
    return {
      text: fullText.trim(),
      metadata: {
        slideCount,
        wordCount: fullText.trim().split(/\s+/).length,
        fileSize: file.size,
        extractionMethod: 'PizZip',
        images: images.length > 0 ? images : undefined
      }
    };
  } catch (error) {
    throw {
      message: 'Failed to extract text from PowerPoint file. Please ensure the file is not corrupted and contains text content.',
      code: 'PPTX_EXTRACTION_ERROR',
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
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileName.endsWith('.pptx')
    ) {
      return await extractTextFromPPTX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTXT(file);
    } else {
      throw {
        message: `Unsupported file format: ${fileType || 'unknown'}. Supported formats: PDF (.pdf), Word (.docx), PowerPoint (.pptx), Text (.txt)`,
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
  const maxFileSize = 500 * 1024 * 1024; // 500MB limit (with chunking support)
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
  
  // Check file size
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the maximum limit of 500MB.`
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
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName.endsWith('.pptx')
  ) {
    return 'PowerPoint Presentation';
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
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    baseTime = Math.max(1.5, fileSizeInMB * 0.4); // ~0.4 seconds per MB for PPTX
  } else {
    baseTime = Math.max(0.5, fileSizeInMB * 0.1); // ~0.1 seconds per MB for text
  }
  
  return Math.round(baseTime);
}; 