// src/services/geminiService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

// Enhanced types for AI-extracted data
export interface AIExtractedCourseInfo {
  courseInfo: {
    title: string;
    number: string;
    description: string;
    instructor?: string;
    department?: string;
    institution?: string;
    credits?: number;
    meetingTimes?: string;
    semester?: string;
    year?: string;
    courseType?: 'lecture' | 'lab' | 'seminar' | 'hybrid'; // New field for course type
    location?: string; // Lab location, classroom, etc.
  };
  learningObjectives: string[];
  schedule: {
    week: number;
    topic: string;
    description?: string;
    readings?: string[];
    assignments?: string[];
    dueDate?: string;
    notes?: string;
    experimentType?: string; // For lab courses
    equipmentNeeded?: string[]; // Lab equipment
  }[];
  prerequisites: string[];
  textbooks: {
    title: string;
    author?: string;
    edition?: string;
    isbn?: string;
    required: boolean;
  }[];
  gradingPolicy: {
    component: string;
    percentage: number;
    description?: string;
  }[];
  assignments: {
    name: string;
    description: string;
    type: string; // 'exam', 'project', 'homework', 'quiz', 'presentation', 'lab_report', 'lab_practical'
    dueDate?: string;
    points?: number;
    weight?: number; // For lab reports with different weights
  }[];
  policies: {
    attendance?: string;
    lateWork?: string;
    academicIntegrity?: string;
    accommodations?: string;
    communication?: string;
    safety?: string; // Lab safety requirements
    groupWork?: string; // Group/partner work policies
    makeupPolicy?: string; // Make-up lab policies
  };
  contactInfo: {
    email?: string;
    phone?: string;
    office?: string;
    officeHours?: string;
    website?: string;
  };
  additionalResources: {
    software?: string[];
    equipment?: string[]; // Required lab equipment (safety glasses, notebooks, etc.)
    websites?: string[];
    tutoring?: string;
    learningPlatform?: string; // Moodle, Blackboard, etc.
  };
  labSpecific?: {
    safetyRequirements?: string[];
    requiredEquipment?: string[];
    dresscode?: string[];
    notebookRequirements?: string;
    groupWorkStructure?: string;
    makeupPolicy?: string;
  };
}

export interface GeminiProcessingOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent structured output
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 16384, // Increased for detailed schedules
      }
    });
  }

  /**
   * Process syllabus text and extract structured course information
   * Automatically handles large documents with chunking
   */
  async processSyllabusText(
    extractedText: string,
    fileName?: string,
    options?: GeminiProcessingOptions
  ): Promise<AIExtractedCourseInfo> {
    // Check if document is too large and needs chunking
    const maxTokens = 30000; // Conservative estimate for Gemini
    if (extractedText.length > maxTokens) {
      console.log('Large document detected, using chunked processing');
      return this.processLargeDocument(extractedText, fileName, options);
    }
    
    return this.processSingleDocument(extractedText, fileName, options);
  }

  /**
   * Process a single document (standard size)
   */
  private async processSingleDocument(
    extractedText: string,
    fileName?: string,
    options?: GeminiProcessingOptions
  ): Promise<AIExtractedCourseInfo> {
    const prompt = this.buildSyllabusAnalysisPrompt(extractedText, fileName);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI service');
      }
      
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse the JSON response with enhanced error handling
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw response text:', text);
        console.error('Cleaned text:', cleanedText);
        throw new Error('AI response format invalid - unable to parse JSON');
      }
      
      // Validate JSON structure
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI response is not a valid object');
      }
      
      if (!parsedData.courseInfo) {
        console.warn('Missing courseInfo in AI response, using defaults');
        parsedData.courseInfo = {};
      }
      
      // Validate and sanitize the response
      return this.validateAndSanitizeResponse(parsedData);
    } catch (error) {
      console.error('Gemini API Error:', error);
      if (error instanceof Error) {
        // Re-throw our custom errors as-is
        if (error.message.includes('AI response') || error.message.includes('JSON parsing')) {
          throw error;
        }
        // Handle API-specific errors
        if (error.message.includes('API key')) {
          throw new Error('Invalid or missing Gemini API key. Please check your environment configuration.');
        }
        if (error.message.includes('quota') || error.message.includes('rate limit')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
      }
      throw new Error(`Failed to process syllabus with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process large documents by chunking them
   */
  private async processLargeDocument(
    extractedText: string,
    fileName?: string,
    options?: GeminiProcessingOptions
  ): Promise<AIExtractedCourseInfo> {
    const chunkSize = 35000; // Larger chunk size for detailed syllabi
    const chunks = this.chunkText(extractedText, chunkSize);
    
    console.log(`Processing ${chunks.length} chunks for large document`);
    
    // Process first chunk for basic course info
    const primaryResult = await this.processSingleDocument(chunks[0], fileName, options);
    
    // Process remaining chunks for additional details
    const additionalResults = await Promise.allSettled(
      chunks.slice(1).map(chunk => this.processChunkForDetails(chunk, fileName))
    );
    
    // Merge results
    return this.mergeChunkedResults(primaryResult, additionalResults);
  }

  /**
   * Split text into manageable chunks while preserving context
   * Smart chunking that tries to keep related sections together
   */
  private chunkText(text: string, maxSize: number): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';
    
    // Try to identify important section boundaries
    const sectionHeaders = [
      'schedule', 'session', 'unit', 'week', 'topic', 'assignment', 
      'objective', 'learning outcome', 'reading', 'textbook', 'prerequisite'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || '';
      
      // Check if we're at a potential good break point
      const isGoodBreakPoint = sectionHeaders.some(header => 
        line.toLowerCase().includes(header) || nextLine.toLowerCase().includes(header)
      );
      
      if (currentChunk.length + line.length > maxSize && currentChunk.length > 0) {
        // If we're near a good break point, try to break there
        if (isGoodBreakPoint || currentChunk.length > maxSize * 0.8) {
          chunks.push(currentChunk.trim());
          currentChunk = line;
        } else {
          currentChunk += '\n' + line;
        }
      } else {
        currentChunk += '\n' + line;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Process a chunk specifically for additional details
   */
  private async processChunkForDetails(
    chunk: string,
    fileName?: string
  ): Promise<Partial<AIExtractedCourseInfo>> {
    const prompt = `
Extract additional course details from this syllabus section. Focus heavily on:
- ALL schedule items, sessions, units, weeks, and topics
- Session numbers, titles, and descriptions
- Learning outcomes for each session
- Reading assignments and resources
- Assignment details and due dates
- Any additional objectives or policies

IMPORTANT: Extract ALL schedule/session information - do not limit the number of items.
Convert session numbers to week numbers (Session 1 = Week 1, etc.).

Return JSON with only the fields you can extract from this section:
${chunk}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn('Failed to process chunk:', error);
      return {};
    }
  }

  /**
   * Merge results from multiple chunks
   */
  private mergeChunkedResults(
    primary: AIExtractedCourseInfo,
    additional: PromiseSettledResult<Partial<AIExtractedCourseInfo>>[]
  ): AIExtractedCourseInfo {
    const merged = { ...primary };
    
    additional.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const chunk = result.value;
        
        // Merge arrays with deduplication
        if (chunk.learningObjectives) {
          merged.learningObjectives = [...merged.learningObjectives, ...chunk.learningObjectives];
        }
        if (chunk.schedule) {
          // Merge schedule items and remove duplicates based on week number and topic
          const existingScheduleKeys = new Set(merged.schedule.map(s => `${s.week}-${s.topic}`));
          const newScheduleItems = chunk.schedule.filter(s => !existingScheduleKeys.has(`${s.week}-${s.topic}`));
          merged.schedule = [...merged.schedule, ...newScheduleItems];
        }
        if (chunk.assignments) {
          merged.assignments = [...merged.assignments, ...chunk.assignments];
        }
        if (chunk.prerequisites) {
          merged.prerequisites = [...merged.prerequisites, ...chunk.prerequisites];
        }
        
        // Merge objects (additional details take precedence if more complete)
        if (chunk.contactInfo) {
          merged.contactInfo = { ...merged.contactInfo, ...chunk.contactInfo };
        }
        if (chunk.policies) {
          merged.policies = { ...merged.policies, ...chunk.policies };
        }
        if (chunk.additionalResources) {
          merged.additionalResources = { ...merged.additionalResources, ...chunk.additionalResources };
        }
      }
    });
    
    // Remove duplicates and sort
    merged.learningObjectives = [...new Set(merged.learningObjectives)];
    merged.prerequisites = [...new Set(merged.prerequisites)];
    merged.schedule = merged.schedule.sort((a, b) => a.week - b.week);
    
    return merged;
  }

  /**
   * Build a comprehensive prompt for syllabus analysis
   */
  private buildSyllabusAnalysisPrompt(extractedText: string, fileName?: string): string {
    return `
You are an expert educational content analyzer. Analyze the following course syllabus and extract structured information in JSON format.

IMPORTANT INSTRUCTIONS:
1. Return ONLY valid JSON - no markdown, no explanations, no additional text
2. If information is not available, use null or empty arrays/objects
3. Be thorough but accurate - don't invent information
4. For percentages in grading, ensure they are numbers (not strings)
5. For week numbers, ensure they are integers
6. Extract all learning objectives, even if they're not numbered
7. Look for course schedules in various formats (weekly, by date, by topic, by session/unit)
8. IMPORTANT: Extract ALL schedule items, sessions, units, and topics - do not limit to just a few weeks
9. For session-based schedules, convert sessions to week numbers (e.g., Session 1 = Week 1)
10. LABORATORY COURSES: Pay special attention to safety requirements, lab equipment, dress codes, group work policies, and experiment-based schedules
11. Identify course type: determine if this is a lecture, lab, seminar, or hybrid course based on content

Required JSON structure:
{
  "courseInfo": {
    "title": "string",
    "number": "string (e.g., CS 350, BIOL 301, CHEM 315)",
    "description": "string",
    "instructor": "string or null",
    "department": "string or null",
    "institution": "string or null",
    "credits": "number or null",
    "meetingTimes": "string or null (include lab times if applicable)",
    "semester": "string or null",
    "year": "string or null",
    "courseType": "lecture|lab|seminar|hybrid",
    "location": "string or null (lab room, classroom, etc.)"
  },
  "learningObjectives": [
    "string (each objective as separate item)"
  ],
  "schedule": [
    {
      "week": "number",
      "topic": "string",
      "description": "string or null",
      "readings": ["string"] or null,
      "assignments": ["string"] or null,
      "dueDate": "string or null",
      "notes": "string or null",
      "experimentType": "string or null (for lab courses)",
      "equipmentNeeded": ["string"] or null
    }
  ],
  "prerequisites": [
    "string (each prerequisite course/requirement)"
  ],
  "textbooks": [
    {
      "title": "string",
      "author": "string or null",
      "edition": "string or null",
      "isbn": "string or null",
      "required": "boolean"
    }
  ],
  "gradingPolicy": [
    {
      "component": "string (e.g., Exams, Homework, Projects)",
      "percentage": "number (e.g., 40, not '40%')",
      "description": "string or null"
    }
  ],
  "assignments": [
    {
      "name": "string",
      "description": "string",
      "type": "string (exam|project|homework|quiz|presentation|lab_report|lab_practical)",
      "dueDate": "string or null",
      "points": "number or null",
      "weight": "number or null (for weighted assignments)"
    }
  ],
  "policies": {
    "attendance": "string or null",
    "lateWork": "string or null",
    "academicIntegrity": "string or null",
    "accommodations": "string or null",
    "communication": "string or null",
    "safety": "string or null (lab safety requirements)",
    "groupWork": "string or null (partner/group work policies)",
    "makeupPolicy": "string or null (make-up lab/exam policies)"
  },
  "contactInfo": {
    "email": "string or null",
    "phone": "string or null",
    "office": "string or null",
    "officeHours": "string or null",
    "website": "string or null"
  },
  "additionalResources": {
    "software": ["string"] or null,
    "equipment": ["string"] or null,
    "websites": ["string"] or null,
    "tutoring": "string or null",
    "learningPlatform": "string or null (Moodle, Blackboard, etc.)"
  },
  "labSpecific": {
    "safetyRequirements": ["string"] or null,
    "requiredEquipment": ["string"] or null,
    "dresscode": ["string"] or null,
    "notebookRequirements": "string or null",
    "groupWorkStructure": "string or null",
    "makeupPolicy": "string or null"
  }
}

${fileName ? `File name: ${fileName}` : ''}

Syllabus content to analyze:
${extractedText}
`;
  }

  /**
   * Validate and sanitize the AI response
   */
  private validateAndSanitizeResponse(data: any): AIExtractedCourseInfo {
    // Provide default structure if data is malformed
    const defaultResponse: AIExtractedCourseInfo = {
      courseInfo: {
        title: 'Course Title',
        number: 'COURSE 101',
        description: 'Course description not available',
      },
      learningObjectives: [],
      schedule: [],
      prerequisites: [],
      textbooks: [],
      gradingPolicy: [],
      assignments: [],
      policies: {},
      contactInfo: {},
      additionalResources: {}
    };

    try {
      // Merge with default and validate types
      const result: AIExtractedCourseInfo = {
        courseInfo: {
          ...defaultResponse.courseInfo,
          ...data.courseInfo
        },
        learningObjectives: Array.isArray(data.learningObjectives) ? data.learningObjectives : [],
        schedule: Array.isArray(data.schedule) ? data.schedule.map((item: any, index: number) => ({
          week: typeof item.week === 'number' ? item.week : index + 1,
          topic: item.topic || `Week ${index + 1} Topic`,
          description: item.description || null,
          readings: Array.isArray(item.readings) ? item.readings : null,
          assignments: Array.isArray(item.assignments) ? item.assignments : null,
          dueDate: item.dueDate || null,
          notes: item.notes || null
        })) : [],
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [],
        textbooks: Array.isArray(data.textbooks) ? data.textbooks.map((book: any) => ({
          title: book.title || 'Unknown Textbook',
          author: book.author || null,
          edition: book.edition || null,
          isbn: book.isbn || null,
          required: typeof book.required === 'boolean' ? book.required : true
        })) : [],
        gradingPolicy: Array.isArray(data.gradingPolicy) ? data.gradingPolicy.map((item: any) => ({
          component: item.component || 'Unknown Component',
          percentage: typeof item.percentage === 'number' ? item.percentage : 0,
          description: item.description || null
        })) : [],
        assignments: Array.isArray(data.assignments) ? data.assignments.map((assignment: any) => ({
          name: assignment.name || 'Assignment',
          description: assignment.description || '',
          type: assignment.type || 'homework',
          dueDate: assignment.dueDate || null,
          points: typeof assignment.points === 'number' ? assignment.points : null
        })) : [],
        policies: {
          attendance: data.policies?.attendance || null,
          lateWork: data.policies?.lateWork || null,
          academicIntegrity: data.policies?.academicIntegrity || null,
          accommodations: data.policies?.accommodations || null,
          communication: data.policies?.communication || null
        },
        contactInfo: {
          email: data.contactInfo?.email || null,
          phone: data.contactInfo?.phone || null,
          office: data.contactInfo?.office || null,
          officeHours: data.contactInfo?.officeHours || null,
          website: data.contactInfo?.website || null
        },
        additionalResources: {
          software: Array.isArray(data.additionalResources?.software) ? data.additionalResources.software : null,
          equipment: Array.isArray(data.additionalResources?.equipment) ? data.additionalResources.equipment : null,
          websites: Array.isArray(data.additionalResources?.websites) ? data.additionalResources.websites : null,
          tutoring: data.additionalResources?.tutoring || null
        }
      };

      return result;
    } catch (error) {
      console.error('Error validating AI response:', error);
      return defaultResponse;
    }
  }

  /**
   * Generate enhanced course materials based on extracted information
   */
  async generateCourseMaterials(
    extractedInfo: AIExtractedCourseInfo,
    options?: { includeWeeks?: number; materialTypes?: string[] }
  ): Promise<any[]> {
    const prompt = `
Based on the following course information, generate detailed course materials in JSON format.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - absolutely NO explanatory text, comments, or additional content
2. Do not add any text before or after the JSON array
3. Do not include comments like "// ..." in the JSON
4. Generate materials for ALL available weeks/sessions from the course information

Create materials for:
1. Course Overview (with detailed description, objectives, and policies)  
2. Weekly/session materials for ALL weeks found in the schedule
3. Assignment descriptions where applicable

Course Information:
${JSON.stringify(extractedInfo, null, 2)}

Generate materials for ${options?.includeWeeks || extractedInfo.schedule.length} weeks/sessions.

Return ONLY a JSON array of materials with this structure:
[
  {
    "id": "unique-id",
    "title": "Material Title",
    "type": "overview|weekly|assignment|resource",
    "header": {"title": "string", "content": "string"},
    "sections": [
      {
        "id": "section-id",
        "title": "Section Title",
        "content": "HTML formatted content",
        "subsections": [
          {
            "id": "subsection-id",
            "title": "Subsection Title",
            "content": "HTML formatted content"
          }
        ]
      }
    ],
    "footer": {"title": "string", "content": "string"},
    "published": false,
    "scheduledTimestamp": "ISO date string or null"
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        console.warn('Empty response from AI service for material generation');
        return [];
      }
      
      // Clean the response text (remove markdown code blocks and any trailing text)
      let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Remove any explanatory text after the JSON array
      const jsonEndIndex = cleanedText.lastIndexOf(']');
      if (jsonEndIndex !== -1) {
        cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
      }
      
      // Parse the JSON response with enhanced error handling
      let parsedData;
      try {
        parsedData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parsing failed for material generation:', parseError);
        console.error('Raw response text:', text);
        console.error('Cleaned text:', cleanedText);
        console.warn('Falling back to empty materials array');
        return [];
      }
      
      // Validate that we got an array
      if (!Array.isArray(parsedData)) {
        console.warn('AI response is not an array, wrapping in array:', parsedData);
        return parsedData ? [parsedData] : [];
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error generating materials:', error);
      return [];
    }
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export const getGeminiService = (apiKey?: string): GeminiService => {
  // Use provided API key or fall back to environment variable
  const effectiveApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!geminiService && effectiveApiKey) {
    geminiService = new GeminiService(effectiveApiKey);
  }
  
  if (!geminiService) {
    throw new Error('Gemini service not initialized. Please configure VITE_GEMINI_API_KEY environment variable.');
  }
  
  return geminiService;
};

export const initializeGeminiService = (apiKey?: string): void => {
  const effectiveApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  if (!effectiveApiKey) {
    throw new Error('API key is required. Please configure VITE_GEMINI_API_KEY environment variable.');
  }
  geminiService = new GeminiService(effectiveApiKey);
};
