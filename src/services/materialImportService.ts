// src/services/materialImportService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Material, Section, Subsection, SubSubsection } from '../types/Material';
import { v4 as uuidv4 } from 'uuid';
import { uploadExtractedImagesWithProgress, UploadedImage } from './imageUploadService';
import { ImageReference } from '../utils/textExtraction';

// Enhanced types for AI-extracted material data
export interface AIExtractedMaterialInfo {
  title: string;
  description?: string;
  header: {
    title: string;
    content: string;
  };
  footer: {
    title: string;
    content: string;
  };
  sections: {
    title: string;
    content: string;
    subsections: {
      title: string;
      content: string;
      subSubsections: {
        title: string;
        content: string;
        images?: { url: string; title: string; description?: string }[];
        links?: { title: string; url: string; description: string }[];
      }[];
      images?: { url: string; title: string; description?: string }[];
      links?: { title: string; url: string; description: string }[];
    }[];
    images?: { url: string; title: string; description?: string }[];
    links?: { title: string; url: string; description: string }[];
  }[];
  sourceInfo: {
    fileName: string;
    fileType: string;
    extractedAt: string;
    originalFileReference?: string;
  };
  images?: { url: string; title: string; description?: string; slideNumber?: number }[];
  links?: { title: string; url: string; description: string }[];
}

export interface MaterialProcessingOptions {
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  preserveFormatting?: boolean;
  extractImages?: boolean;
  extractLinks?: boolean;
}

export interface MaterialProcessingProgress {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'structuring' | 'complete' | 'error';
  percentage: number;
  currentOperation: string;
  subSteps?: {
    current: number;
    total: number;
    description: string;
  };
}

export class MaterialImportService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private activeBlobUrls: Set<string> = new Set();

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.2, // Slightly higher for creative structuring
        topK: 3,
        topP: 0.9,
        maxOutputTokens: 16384,
      }
    });
  }

  /**
   * Clean up all active blob URLs to prevent memory leaks
   */
  cleanupBlobUrls(): void {
    this.activeBlobUrls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.activeBlobUrls.clear();
  }

  /**
   * Create a blob URL and track it for cleanup
   */
  private createTrackedBlobUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.activeBlobUrls.add(url);
    return url;
  }

  /**
   * Process material content and extract structured information
   * Automatically handles large documents with chunking
   */
  async processMaterialContent(
    extractedText: string,
    fileName: string,
    fileType: string,
    options?: MaterialProcessingOptions,
    onProgress?: (progress: MaterialProcessingProgress) => void,
    extractionMetadata?: { images?: ImageReference[]; [key: string]: any }
  ): Promise<AIExtractedMaterialInfo> {
    if (!extractedText?.trim()) {
      throw new Error('No content provided for processing');
    }

    onProgress?.({
      stage: 'analyzing',
      percentage: 20,
      currentOperation: 'Analyzing document structure...'
    });

    // Determine if document needs chunking - be more conservative to prevent truncation
    const textLength = extractedText.length;
    const estimatedTokens = Math.ceil(textLength / 4); // Rough estimate: 1 token ≈ 4 characters
    
    // If input + output might exceed context window, use chunking
    if (textLength > 15000 || estimatedTokens > 4000) {
      console.log(`Document is large (${textLength} chars, ~${estimatedTokens} tokens), using chunked processing`);
      // For now, just process with smaller chunks to prevent truncation
      const shortenedText = extractedText.substring(0, 15000);
      console.log('Truncating input to prevent AI response truncation');
      return this.processSingleMaterial(shortenedText + '\n\n[Content truncated for processing]', fileName, fileType, options, onProgress, extractionMetadata);
    }

    return this.processSingleMaterial(extractedText, fileName, fileType, options, onProgress, extractionMetadata);
  }

  /**
   * Process a single material document (standard size)
   */
  private async processSingleMaterial(
    extractedText: string,
    fileName: string,
    fileType: string,
    options?: MaterialProcessingOptions,
    onProgress?: (progress: MaterialProcessingProgress) => void,
    extractionMetadata?: { images?: any[]; [key: string]: any }
  ): Promise<AIExtractedMaterialInfo> {
    const prompt = this.buildMaterialAnalysisPrompt(extractedText, fileName, fileType, options, extractionMetadata);

    onProgress?.({
      stage: 'analyzing',
      percentage: 40,
      currentOperation: 'Processing with AI...'
    });

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }

      onProgress?.({
        stage: 'structuring',
        percentage: 70,
        currentOperation: 'Structuring content...'
      });

      // Clean the response text with advanced repair
      let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      console.log('Raw response text (first 1000 chars):', text.substring(0, 1000));
      console.log('Cleaned text (first 1000 chars):', cleanedText.substring(0, 1000));
      
      // Detect and repair truncated JSON
      cleanedText = this.repairTruncatedJSON(cleanedText);

      // Parse the JSON response with enhanced error handling
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw response text (first 1000 chars):', text.substring(0, 1000));
        console.error('Cleaned text (first 1000 chars):', cleanedText.substring(0, 1000));
        throw new Error('AI response format invalid - unable to parse JSON');
      }

      // Validate JSON structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI response is not a valid object');
      }

      onProgress?.({
        stage: 'complete',
        percentage: 100,
        currentOperation: 'Processing complete!'
      });

      // Validate and sanitize the response
      return this.validateAndSanitizeMaterialResponse(parsedData, fileName, fileType);
    } catch (error) {
      console.error('Material Import AI Error:', error);
      onProgress?.({
        stage: 'error',
        percentage: 0,
        currentOperation: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key')) {
          throw new Error('Invalid API key. Please check your material import API key configuration.');
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (error.message.includes('SAFETY')) {
          throw new Error('Content flagged by safety filters. Please try with different content.');
        }
      }

      throw new Error(`Material processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process large material documents with chunking
   */
  private async processLargeMaterial(
    extractedText: string,
    fileName: string,
    fileType: string,
    options?: MaterialProcessingOptions,
    onProgress?: (progress: MaterialProcessingProgress) => void
  ): Promise<AIExtractedMaterialInfo> {
    onProgress?.({
      stage: 'analyzing',
      percentage: 10,
      currentOperation: 'Processing large document with chunking...'
    });

    const chunks = this.chunkMaterialText(extractedText);
    let primaryResult: AIExtractedMaterialInfo | null = null;
    const additionalContent: any[] = [];

    // Process primary chunk (usually contains main structure)
    onProgress?.({
      stage: 'analyzing',
      percentage: 30,
      currentOperation: `Processing main content (1/${chunks.length})...`,
      subSteps: { current: 1, total: chunks.length, description: 'Analyzing primary structure' }
    });

    primaryResult = await this.processSingleMaterial(chunks[0], fileName, fileType, options);

    // Process additional chunks for supplementary content
    for (let i = 1; i < chunks.length; i++) {
      onProgress?.({
        stage: 'analyzing',
        percentage: 30 + (40 * i / chunks.length),
        currentOperation: `Processing additional content (${i + 1}/${chunks.length})...`,
        subSteps: { current: i + 1, total: chunks.length, description: 'Extracting supplementary details' }
      });

      try {
        const chunkResult = await this.processChunkForAdditionalContent(chunks[i], fileName, fileType);
        if (chunkResult) {
          additionalContent.push(chunkResult);
        }
      } catch (error) {
        console.warn(`Failed to process chunk ${i + 1}:`, error);
        // Continue processing other chunks
      }
    }

    onProgress?.({
      stage: 'structuring',
      percentage: 80,
      currentOperation: 'Merging content from all sections...'
    });

    // Merge results
    const mergedResult = this.mergeChunkedMaterialResults(primaryResult, additionalContent);

    onProgress?.({
      stage: 'complete',
      percentage: 100,
      currentOperation: 'Large document processing complete!'
    });

    return mergedResult;
  }

  /**
   * Build the AI prompt for material analysis
   */
  private buildMaterialAnalysisPrompt(
    content: string,
    fileName: string,
    fileType: string,
    options?: MaterialProcessingOptions,
    extractionMetadata?: { images?: any[]; [key: string]: any }
  ): string {
    const fileTypeContext = this.getFileTypeContext(fileType);
    
    return `
Analyze this ${fileTypeContext} educational material and extract structured information for course content management.

File: ${fileName}
Type: ${fileType}

CONTENT:
${content}

${extractionMetadata?.images && extractionMetadata.images.length > 0 ? `
DETECTED IMAGES:
${extractionMetadata.images.map((img: any, index: number) => 
  `${index + 1}. ${img.description || `Image ${index + 1}`}${img.slideNumber ? ` (Slide ${img.slideNumber})` : ''}${img.altText ? ` - ${img.altText}` : ''}`
).join('\n')}

CRITICAL IMAGE PLACEMENT INSTRUCTIONS:
- Each image MUST be placed in the section corresponding to its slide number
- If "Image X (Slide Y)" is detected, place it in the section created from Slide Y content
- Each image should have a unique, descriptive title based on its context
- Include slideNumber property in each image object for proper matching
- DO NOT reuse the same image in multiple sections
` : ''}

Please extract and structure this content into a comprehensive educational material format. Focus on:

1. **Document Structure**: Identify main topics, subtopics, and hierarchical organization
2. **Content Quality**: Preserve important educational information and context
3. **Visual Elements**: Note references to images, diagrams, charts (even if not extractable)
4. **Links and Resources**: Extract any URLs, references, or external resources mentioned
5. **Learning Context**: Maintain educational value and logical flow

${fileTypeContext === 'presentation slide deck' ? `
SPECIAL INSTRUCTIONS FOR PRESENTATIONS:
- Each slide should become a section or subsection
- Preserve slide order and hierarchy
- Note slide titles and main content points
- Identify slide transitions and logical groupings
- Extract speaker notes or additional context if present
` : ''}

Return ONLY a JSON object with this exact structure:
{
  "title": "Material title (extracted from content or filename)",
  "description": "Brief description of the material content",
  "header": {
    "title": "Introduction or Overview",
    "content": "HTML formatted introductory content"
  },
  "footer": {
    "title": "Summary or Conclusion", 
    "content": "HTML formatted concluding content"
  },
  "sections": [
    {
      "title": "Section Title",
      "content": "HTML formatted main section content",
      "subsections": [
        {
          "title": "Subsection Title",
          "content": "HTML formatted subsection content",
          "subSubsections": [
            {
              "title": "Sub-subsection Title",
              "content": "HTML formatted detailed content",
              "images": [{"url": "", "title": "Image description", "description": "Context or caption", "slideNumber": 2}],
              "links": [{"title": "Link title", "url": "URL if available", "description": "Link context"}]
            }
          ],
          "images": [{"url": "", "title": "Image description", "description": "Context or caption", "slideNumber": 3}],
          "links": [{"title": "Link title", "url": "URL if available", "description": "Link context"}]
        }
      ],
      "images": [{"url": "", "title": "Image description", "description": "Context or caption", "slideNumber": 4}],
      "links": [{"title": "Link title", "url": "URL if available", "description": "Link context"}]
    }
  ],
  "sourceInfo": {
    "fileName": "${fileName}",
    "fileType": "${fileType}",
    "extractedAt": "${new Date().toISOString()}",
    "originalFileReference": "Reference to original file for debugging"
  },
  "images": [{"url": "", "title": "Overall image description", "description": "Context", "slideNumber": 1}],
  "links": [{"title": "Overall link title", "url": "URL", "description": "Link context"}]
}

CRITICAL JSON FORMATTING RULES:
- Return ONLY valid JSON - no comments, no explanations, no additional text
- Use proper HTML tags for content formatting (<p>, <h1>-<h6>, <ul>, <ol>, <li>, <strong>, <em>, <br>)
- Preserve educational structure and hierarchy
- Create logical sections based on content organization
- For images: Use EMPTY STRINGS for URLs ("url": "") with descriptive titles, context, and slideNumber property
-- IMPORTANT: Each image object MUST include "slideNumber" property matching the source slide
-- NEVER use placeholder filenames like "placeholder_image_1.png" - always use empty strings for URLs
- For links: Extract actual URLs when present, provide context
- Complete ALL sections and subsections - do not use comments like "// ... continue"
- Ensure all JSON arrays and objects are properly closed
- Maintain educational value and readability

IMPORTANT: Your response must be complete, valid JSON that can be parsed directly. Do not include any explanatory text, comments, or incomplete sections. End your response when the JSON object is complete.
`;
  }

  /**
   * Process chunk for additional content extraction
   */
  private async processChunkForAdditionalContent(
    chunkText: string,
    fileName: string,
    fileType: string
  ): Promise<any> {
    const prompt = `
Extract additional educational content from this section of the material:

File: ${fileName}
Type: ${fileType}

CONTENT:
${chunkText}

Focus on extracting any additional sections, detailed information, or supplementary content that should be included in the educational material.

Return ONLY a JSON object with additional sections, images, or links:
{
  "sections": [...],
  "images": [...],
  "links": [...]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        return null;
      }

      let cleanedText;
      try {
        cleanedText = this.extractValidJSON(text);
      } catch (extractionError) {
        // Try fallback extraction for chunks too
        try {
          cleanedText = this.fallbackJSONExtraction(text);
        } catch (fallbackError) {
          throw extractionError; // Use original error
        }
      }
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn('Failed to process additional content chunk:', error);
      return null;
    }
  }

  /**
   * Chunk material text for processing
   */
  private chunkMaterialText(text: string, chunkSize: number = 25000): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if (currentChunk.length + line.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Merge chunked material results
   */
  private mergeChunkedMaterialResults(
    primary: AIExtractedMaterialInfo,
    additional: any[]
  ): AIExtractedMaterialInfo {
    const merged = { ...primary };

    // Merge additional sections
    for (const chunk of additional) {
      if (chunk.sections && Array.isArray(chunk.sections)) {
        merged.sections = [...merged.sections, ...chunk.sections];
      }
      if (chunk.images && Array.isArray(chunk.images)) {
        merged.images = [...(merged.images || []), ...chunk.images];
      }
      if (chunk.links && Array.isArray(chunk.links)) {
        merged.links = [...(merged.links || []), ...chunk.links];
      }
    }

    return merged;
  }

  /**
   * Extract valid JSON from AI response, handling extra text after JSON
   */
  private extractValidJSON(text: string): string {
    // Remove markdown code blocks
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any comments (// ... or /* ... */) that might be in the JSON
    cleanedText = cleanedText
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    
    // Find the first opening brace
    const openBraceIndex = cleanedText.indexOf('{');
    if (openBraceIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Start from the opening brace
    cleanedText = cleanedText.substring(openBraceIndex);
    
    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
    }
    
    if (endIndex === -1) {
      throw new Error('No matching closing brace found for JSON object');
    }
    
    let jsonString = cleanedText.substring(0, endIndex);
    
    // Additional cleaning: remove any trailing commas before closing braces/brackets
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // Check if the JSON appears to be truncated
    const isTruncated = this.detectTruncatedJSON(jsonString);
    if (isTruncated) {
      console.warn('Detected truncated JSON response, attempting repair');
      jsonString = this.attemptJSONRepair(jsonString);
    }
    
    // Validate the JSON by attempting to parse it
    try {
      JSON.parse(jsonString);
      return jsonString;
    } catch (parseError) {
      // If parsing fails, try to fix common issues
      console.warn('Initial JSON parsing failed, attempting to fix common issues:', parseError);
      
      // Try to fix incomplete arrays or objects by adding proper closing
      const fixedJson = this.attemptJSONRepair(jsonString);
      
      // Test the fixed JSON
      try {
        JSON.parse(fixedJson);
        return fixedJson;
      } catch (finalError) {
        console.error('JSON repair failed:', finalError);
        throw new Error(`Invalid JSON structure: ${finalError.message}`);
      }
    }
  }

  /**
   * Detect if JSON appears to be truncated
   */
  private detectTruncatedJSON(jsonString: string): boolean {
    const trimmed = jsonString.trim();
    
    // Check for common truncation patterns
    const truncationIndicators = [
      // Incomplete property names or values
      /"[^"]*$/,  // Quote that never closes
      /:\s*$/,    // Colon at end (incomplete value)
      /,\s*$/,    // Comma at end (incomplete next property)
      
      // Incomplete words in property names or values
      /"[a-zA-Z]+\w*$/,  // Word that seems cut off in quotes
      /[a-zA-Z]+\w*$/,   // Word that seems cut off outside quotes
      
      // Structural incompleteness
      /\[\s*$/,   // Opening bracket with nothing after
      /{\s*$/,    // Opening brace with nothing after
    ];
    
    // Check if any truncation indicators are present
    for (const pattern of truncationIndicators) {
      if (pattern.test(trimmed)) {
        console.log(`Truncation detected: ${pattern.toString()}`);
        return true;
      }
    }
    
    // Check if the JSON ends abruptly without proper structure
    const lastChar = trimmed.charAt(trimmed.length - 1);
    if (lastChar !== '}' && lastChar !== ']') {
      console.log(`Truncation detected: JSON doesn't end with } or ], ends with: "${lastChar}"`);
      return true;
    }
    
    return false;
  }

  /**
   * Detect if the AI response appears to be truncated
   */
  private detectTruncatedResponse(text: string): boolean {
    const trimmed = text.trim();
    
    // Remove markdown code blocks for analysis
    const cleanedText = trimmed.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Look for truncation indicators
    const truncationIndicators = [
      // Incomplete JSON structure
      /"[^"]*$/,  // Unclosed quote
      /\w+$/,     // Word cut off at the end
      /:\s*$/,    // Property with no value
      /,\s*$/,    // Trailing comma with no next property
      
      // Doesn't end properly
      !cleanedText.endsWith('}'),
      !cleanedText.endsWith(']'),
      
      // Very short response (likely truncated)
      cleanedText.length < 500,
    ];
    
    // Check for any indicators
    for (let i = 0; i < truncationIndicators.length - 1; i++) {
      const pattern = truncationIndicators[i];
      if (pattern instanceof RegExp && pattern.test(cleanedText)) {
        return true;
      }
    }
    
    // Check boolean indicators
    if (truncationIndicators[truncationIndicators.length - 3] || 
        truncationIndicators[truncationIndicators.length - 2] || 
        truncationIndicators[truncationIndicators.length - 1]) {
      return true;
    }
    
    return false;
  }

  /**
   * Attempt to repair common JSON issues
   */
  private attemptJSONRepair(jsonString: string): string {
    let repaired = jsonString;
    
    // Remove any incomplete trailing sections that might cause issues
    // Look for patterns like "// ..." or incomplete array/object structures
    const lines = repaired.split('\n');
    const cleanedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip lines that are clearly comments or incomplete
      if (trimmedLine.startsWith('//') || 
          trimmedLine.includes('... (Continue') || 
          trimmedLine.includes('continue structuring') ||
          trimmedLine.includes('similarly')) {
        continue;
      }
      cleanedLines.push(line);
    }
    
    repaired = cleanedLines.join('\n');
    
    // Remove trailing commas before closing braces/brackets
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Ensure proper closing of incomplete structures
    // This is a basic attempt - for more complex cases, the AI should be retrained
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }
    
    // Add missing closing brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }
    
    return repaired;
  }

  /**
   * Fallback JSON extraction for severely malformed responses
   */
  private fallbackJSONExtraction(text: string): string {
    console.log('Attempting fallback JSON extraction...');
    
    // Remove markdown code blocks
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any comments
    cleanedText = cleanedText
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Find the first opening brace
    const openBraceIndex = cleanedText.indexOf('{');
    if (openBraceIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Start from the opening brace
    cleanedText = cleanedText.substring(openBraceIndex);
    
    // Try to find a reasonable ending point for the JSON
    // Look for patterns that indicate the JSON might be ending
    const potentialEndPatterns = [
      /}\s*$/m,  // Closing brace at end of line
      /}\s*\n\s*[A-Z]/m,  // Closing brace followed by explanatory text starting with capital
      /}\s*\n\s*This/m,   // Common AI explanation starter
      /}\s*\n\s*Note:/m,  // Common AI note starter
    ];
    
    let bestEndIndex = -1;
    for (const pattern of potentialEndPatterns) {
      const match = cleanedText.match(pattern);
      if (match && match.index !== undefined) {
        const endIndex = match.index + match[0].indexOf('}') + 1;
        if (bestEndIndex === -1 || endIndex < bestEndIndex) {
          bestEndIndex = endIndex;
        }
      }
    }
    
    if (bestEndIndex > 0) {
      cleanedText = cleanedText.substring(0, bestEndIndex);
    }
    
    // Apply the JSON repair logic
    const repairedJson = this.attemptJSONRepair(cleanedText);
    
    // Test if it parses
    try {
      JSON.parse(repairedJson);
      return repairedJson;
    } catch (error) {
      // If still failing, try a more aggressive approach
      console.log('Attempting aggressive JSON repair...');
      return this.aggressiveJSONRepair(cleanedText);
    }
  }

  /**
   * Very aggressive JSON repair as last resort
   */
  private aggressiveJSONRepair(jsonString: string): string {
    let repaired = jsonString;
    
    // Remove any incomplete trailing sections more aggressively
    const lines = repaired.split('\n');
    const cleanedLines: string[] = [];
    // let foundIncompleteSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Stop at any line that looks like incomplete content or comments
      if (trimmedLine.startsWith('//') || 
          trimmedLine.includes('... (') || 
          trimmedLine.includes('continue') ||
          trimmedLine.includes('similarly') ||
          trimmedLine.includes('Remember to') ||
          trimmedLine.includes('This structure') ||
          (trimmedLine.length > 0 && !trimmedLine.includes('"') && !trimmedLine.includes('{') && !trimmedLine.includes('}') && !trimmedLine.includes('[') && !trimmedLine.includes(']'))) {
        // foundIncompleteSection = true;
        break;
      }
      
      cleanedLines.push(line);
    }
    
    repaired = cleanedLines.join('\n');
    
    // Remove trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    // Count braces and brackets
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    // Add missing closing braces and brackets
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '\n}';
    }
    
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += '\n]';
    }
    
    // Final cleanup
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    return repaired;
  }

  /**
   * Repair truncated JSON by detecting incomplete structures and completing them
   */
  private repairTruncatedJSON(jsonString: string): string {
    let repaired = jsonString;
    
    // Remove any incomplete trailing content that's not valid JSON
    const lines = repaired.split('\n');
    const cleanedLines: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip lines that are clearly incomplete or invalid
      if (trimmed.length === 0) {
        cleanedLines.push(line);
        continue;
      }
      
      // Check for incomplete property names or values
      if (trimmed.match(/^"[^"]*$/)) {
        // Incomplete property name - close it and stop
        cleanedLines.push('"": ""');
        break;
      }
      
      if (trimmed.match(/:\s*"[^"]*$/)) {
        // Incomplete property value - close it and stop
        cleanedLines.push(trimmed.replace(/:\s*"[^"]*$/, ': ""'));
        break;
      }
      
      if (trimmed.match(/^[a-zA-Z]+\w*$/)) {
        // Word fragment - likely truncated, stop here
        break;
      }
      
      cleanedLines.push(line);
    }
    
    repaired = cleanedLines.join('\n');
    
    // Remove trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    repaired = repaired.replace(/,\s*$/, '');
    
    // Count braces and brackets to ensure proper closing
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    
    console.log(`JSON structure analysis: ${openBraces} open braces, ${closeBraces} close braces, ${openBrackets} open brackets, ${closeBrackets} close brackets`);
    
    // Add missing closing brackets first
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += '\n]';
    }
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '\n}';
    }
    
    // Final cleanup
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('Repaired JSON (first 1000 chars):', repaired.substring(0, 1000));
    
    return repaired;
  }

  /**
   * Get file type context for prompt customization
   */
  private getFileTypeContext(fileType: string): string {
    const type = fileType.toLowerCase();
    if (type.includes('presentation') || type.includes('powerpoint') || type.includes('pptx')) {
      return 'presentation slide deck';
    } else if (type.includes('pdf')) {
      return 'PDF document';
    } else if (type.includes('word') || type.includes('docx')) {
      return 'Word document';
    }
    return 'document';
  }

  /**
   * Validate and sanitize material response
   */
  private validateAndSanitizeMaterialResponse(
    data: any,
    fileName: string,
    fileType: string
  ): AIExtractedMaterialInfo {
    // Ensure basic structure exists
    const sanitized: AIExtractedMaterialInfo = {
      title: data.title || fileName.replace(/\.[^/.]+$/, '') || 'Untitled Material',
      description: data.description || '',
      header: {
        title: data.header?.title || 'Introduction',
        content: data.header?.content || ''
      },
      footer: {
        title: data.footer?.title || 'Summary',
        content: data.footer?.content || ''
      },
      sections: [],
      sourceInfo: {
        fileName,
        fileType,
        extractedAt: new Date().toISOString(),
        originalFileReference: data.sourceInfo?.originalFileReference || fileName
      },
      images: Array.isArray(data.images) ? data.images : [],
      links: Array.isArray(data.links) ? data.links : []
    };

    // Sanitize sections
    if (Array.isArray(data.sections)) {
      sanitized.sections = data.sections.map((section: any) => ({
        title: section.title || 'Section',
        content: section.content || '',
        subsections: Array.isArray(section.subsections) ? section.subsections.map((subsection: any) => ({
          title: subsection.title || 'Subsection',
          content: subsection.content || '',
          subSubsections: Array.isArray(subsection.subSubsections) ? subsection.subSubsections.map((subSub: any) => ({
            title: subSub.title || 'Sub-subsection',
            content: subSub.content || '',
            images: Array.isArray(subSub.images) ? subSub.images : [],
            links: Array.isArray(subSub.links) ? subSub.links : []
          })) : [],
          images: Array.isArray(subsection.images) ? subsection.images : [],
          links: Array.isArray(subsection.links) ? subsection.links : []
        })) : [],
        images: Array.isArray(section.images) ? section.images : [],
        links: Array.isArray(section.links) ? section.links : []
      }));
    }

    // Ensure at least one section exists
    if (sanitized.sections.length === 0) {
      sanitized.sections.push({
        title: 'Main Content',
        content: 'Content extracted from the uploaded material.',
        subsections: [],
        images: [],
        links: []
      });
    }

    return sanitized;
  }

  /**
   * Convert AI extracted data to Material format
   */
  convertToMaterialFormat(
    aiData: AIExtractedMaterialInfo,
    courseId: string,
    authorId: string,
    extractionMetadata?: { images?: ImageReference[]; [key: string]: any }
  ): Omit<Material, 'id' | 'timestamp'> {
    
    // Helper function to create placeholder image URLs
    const createPlaceholderImageUrl = (title: string, width = 400, height = 300): string => {
      // Clean the title to only include Latin1 characters to avoid btoa errors
      const cleanTitle = title.replace(/[^\u0020-\u00FF]/g, '?').substring(0, 30);
      
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#4a90e2"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">
            ${cleanTitle}
          </text>
        </svg>
      `;
      
      try {
        // Convert SVG to data URI
        const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;
        return dataUri;
      } catch (error) {
        console.error('Failed to create placeholder image URL:', error);
        // Return a simple fallback without btoa if that fails too
        const encodedSvg = encodeURIComponent(svg);
        return `data:image/svg+xml,${encodedSvg}`;
      }
    };

    // Helper function to enhance images with actual extracted images or placeholders (for preview)
    const enhanceImages = (images: any[]): { url: string; title: string }[] => {
      // Create a map of available extracted images by slide number
      const extractedImageMap = new Map<number, ImageReference>();
      if (extractionMetadata?.images) {
        extractionMetadata.images.forEach((imgRef: ImageReference) => {
          if (imgRef.slideNumber && imgRef.imageBlob) {
            // Use the first image found for each slide (can be enhanced later for multiple images per slide)
            if (!extractedImageMap.has(imgRef.slideNumber)) {
              extractedImageMap.set(imgRef.slideNumber, imgRef);
            }
          }
        });
      }

      const enhanced = images?.map(image => {
        let imageUrl = '';
        
        // Try to match with extracted image blob by slide number
        if (image.slideNumber && extractedImageMap.has(image.slideNumber)) {
          const extractedImage = extractedImageMap.get(image.slideNumber);
          if (extractedImage?.imageBlob) {
            // Create tracked blob URL for preview
            imageUrl = this.createTrackedBlobUrl(extractedImage.imageBlob);
            console.log(`Using extracted image blob for slide ${image.slideNumber}:`, {
              slideNumber: image.slideNumber,
              blobSize: extractedImage.imageBlob.size,
              blobType: extractedImage.imageBlob.type
            });
          }
        }
        
        // Fallback to placeholder if no extracted image or invalid URL
        if (!imageUrl) {
          // Check if the image has a valid data URI or HTTP URL (not placeholder text)
          if (image.url && image.url.trim() && 
              (image.url.startsWith('data:') || image.url.startsWith('http')) &&
              !image.url.includes('placeholder_image')) {
            imageUrl = image.url;
          } else {
            // Generate proper SVG placeholder
            imageUrl = createPlaceholderImageUrl(image.title || 'Image');
          }
        }
        
        const result = {
          url: imageUrl,
          title: image.title || image.description || 'Detected Image'
        };
        console.log('Enhanced image (preview):', result);
        return result;
      }) || [];
      
      console.log(`Enhanced ${enhanced.length} images for material preview (${extractedImageMap.size} extracted images available)`);
      return enhanced;
    };

    const convertSection = (section: any): Section => ({
      id: uuidv4(),
      title: section.title,
      content: section.content,
      subsections: section.subsections?.map((subsection: any): Subsection => ({
        id: uuidv4(),
        title: subsection.title,
        content: subsection.content,
        subSubsections: subsection.subSubsections?.map((subSub: any): SubSubsection => ({
          id: uuidv4(),
          title: subSub.title,
          content: subSub.content,
          images: enhanceImages(subSub.images || []),
          links: subSub.links || []
        })) || [],
        images: enhanceImages(subsection.images || []),
        links: subsection.links || []
      })) || [],
      images: enhanceImages(section.images || []),
      links: section.links || []
    });

    return {
      course: courseId,
      title: aiData.title,
      header: aiData.header,
      footer: aiData.footer,
      sections: aiData.sections.map(convertSection),
      author: authorId,
      published: false, // Default to unpublished
      // Add source reference as metadata in the footer
      sourceInfo: aiData.sourceInfo
    } as any; // Type assertion for the additional sourceInfo field
  }

  /**
   * Convert AI extracted data to Material format with image upload
   */
  async convertToMaterialFormatWithImageUpload(
    aiData: AIExtractedMaterialInfo,
    courseId: string,
    authorId: string,
    materialId: string,
    extractionMetadata?: { images?: ImageReference[]; [key: string]: any },
    onImageUploadProgress?: (completed: number, total: number) => void
  ): Promise<Omit<Material, 'id' | 'timestamp'>> {
    
    // Upload extracted images to Firebase Storage
    let uploadedImages: UploadedImage[] = [];
    if (extractionMetadata?.images) {
      try {
        console.log(`Uploading ${extractionMetadata.images.length} extracted images...`);
        uploadedImages = await uploadExtractedImagesWithProgress(
          extractionMetadata.images,
          materialId,
          onImageUploadProgress
        );
        console.log(`Successfully uploaded ${uploadedImages.length} images`);
      } catch (error) {
        console.error('Failed to upload extracted images:', error);
        // Continue with placeholders if upload fails
      }
    }

    // Helper function to create placeholder image URLs
    const createPlaceholderImageUrl = (title: string, width = 400, height = 300): string => {
      const text = title.substring(0, 30);
      const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#4a90e2"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">
            ${text}
          </text>
        </svg>
      `;
      
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    // Helper function to enhance images with real URLs or placeholders
    const enhanceImagesWithUploads = (images: any[]): { url: string; title: string }[] => {
      // Create a copy of uploaded images to track which ones we've used
      const availableImages = [...uploadedImages];
      
      const enhanced = images?.map((image) => {
        let uploadedImage: any = null;
        
        // Strategy 1: Try to match by slide number if both have it
        if (image.slideNumber && availableImages.length > 0) {
          const slideMatch = availableImages.find(uploaded => uploaded.slideNumber === image.slideNumber);
          if (slideMatch) {
            uploadedImage = slideMatch;
            // Remove from available to prevent reuse
            const matchIndex = availableImages.indexOf(slideMatch);
            availableImages.splice(matchIndex, 1);
          }
        }
        
        // Strategy 2: Try to match by similar title content
        if (!uploadedImage && availableImages.length > 0) {
          const titleWords = (image.title || image.description || '').toLowerCase().split(' ');
          const titleMatch = availableImages.find(uploaded => {
            const uploadedWords = uploaded.title.toLowerCase().split(' ');
            return titleWords.some(word => word.length > 3 && uploadedWords.some(uWord => uWord.includes(word)));
          });
          
          if (titleMatch) {
            uploadedImage = titleMatch;
            const matchIndex = availableImages.indexOf(titleMatch);
            availableImages.splice(matchIndex, 1);
          }
        }
        
        // Strategy 3: Use next available image (sequential fallback)
        if (!uploadedImage && availableImages.length > 0) {
          uploadedImage = availableImages.shift(); // Take the first available
        }
        
        const result = {
          url: uploadedImage?.url || 
               (image.url && image.url.trim() ? image.url : createPlaceholderImageUrl(image.title || 'Image')),
          title: uploadedImage?.title || image.title || image.description || 'Detected Image'
        };
        
        console.log('Enhanced image with upload:', {
          ...result,
          url: result.url.substring(0, 100) + '...',
          isUploaded: !!uploadedImage,
          originalSlideNumber: image.slideNumber,
          matchedSlideNumber: uploadedImage?.slideNumber,
          matchStrategy: uploadedImage ? (uploadedImage.slideNumber === image.slideNumber ? 'slideNumber' : 
                                        result.title.includes(image.title) ? 'title' : 'sequential') : 'placeholder',
          availableCount: availableImages.length
        });
        return result;
      }) || [];
      
      console.log(`Enhanced ${enhanced.length} images for material (${uploadedImages.length} uploaded, ${availableImages.length} remaining)`);
      return enhanced;
    };

    const convertSectionWithUploads = (section: any): Section => ({
      id: uuidv4(),
      title: section.title,
      content: section.content,
      images: enhanceImagesWithUploads(section.images || []),
      links: section.links || [],
      subsections: section.subsections?.map(convertSubsectionWithUploads) || []
    });

    const convertSubsectionWithUploads = (subsection: any): Subsection => ({
      id: uuidv4(),
      title: subsection.title,
      content: subsection.content,
      images: enhanceImagesWithUploads(subsection.images || []),
      links: subsection.links || [],
      subSubsections: subsection.subSubsections?.map(convertSubSubsectionWithUploads) || []
    });

    const convertSubSubsectionWithUploads = (subSubsection: any): SubSubsection => ({
      id: uuidv4(),
      title: subSubsection.title,
      content: subSubsection.content,
      images: enhanceImagesWithUploads(subSubsection.images || []),
      links: subSubsection.links || []
    });

    return {
      course: courseId,
      title: aiData.title,
      header: aiData.header || { title: '', content: '' },
      footer: aiData.footer || { title: '', content: '' },
      sections: aiData.sections?.map(convertSectionWithUploads) || [],
      author: authorId,
      published: false,
      scheduledTimestamp: null,
    };
  }
}

// Singleton instance for material import
let materialImportService: MaterialImportService | null = null;

export const getMaterialImportService = (apiKey?: string): MaterialImportService => {
  // Use provided API key or fall back to dedicated material import key or general Gemini key
  const effectiveApiKey = apiKey || 
    import.meta.env.VITE_GEMINI_MATERIAL_API_KEY || 
    import.meta.env.VITE_GEMINI_API_KEY;

  if (!materialImportService && effectiveApiKey) {
    materialImportService = new MaterialImportService(effectiveApiKey);
  }

  if (!materialImportService) {
    throw new Error('Material Import service not initialized. Please configure VITE_GEMINI_MATERIAL_API_KEY or VITE_GEMINI_API_KEY environment variable.');
  }

  return materialImportService;
};

export const initializeMaterialImportService = (apiKey?: string): void => {
  const effectiveApiKey = apiKey || 
    import.meta.env.VITE_GEMINI_MATERIAL_API_KEY || 
    import.meta.env.VITE_GEMINI_API_KEY;
    
  if (!effectiveApiKey) {
    throw new Error('API key is required. Please configure VITE_GEMINI_MATERIAL_API_KEY or VITE_GEMINI_API_KEY environment variable.');
  }
  materialImportService = new MaterialImportService(effectiveApiKey);
};
