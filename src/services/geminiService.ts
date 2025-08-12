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
    type: string; // 'exam', 'project', 'homework', 'quiz', 'presentation'
    dueDate?: string;
    points?: number;
  }[];
  policies: {
    attendance?: string;
    lateWork?: string;
    academicIntegrity?: string;
    accommodations?: string;
    communication?: string;
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
    equipment?: string[];
    websites?: string[];
    tutoring?: string;
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
        maxOutputTokens: 8192,
      }
    });
  }

  /**
   * Process syllabus text and extract structured course information
   */
  async processSyllabusText(
    extractedText: string,
    fileName?: string,
    options?: GeminiProcessingOptions
  ): Promise<AIExtractedCourseInfo> {
    const prompt = this.buildSyllabusAnalysisPrompt(extractedText, fileName);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response text (remove markdown code blocks if present)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanedText);
      
      // Validate and sanitize the response
      return this.validateAndSanitizeResponse(parsedData);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to process syllabus with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
7. Look for course schedules in various formats (weekly, by date, by topic)

Required JSON structure:
{
  "courseInfo": {
    "title": "string",
    "number": "string (e.g., CS 350, BIOL 301)",
    "description": "string",
    "instructor": "string or null",
    "department": "string or null",
    "institution": "string or null",
    "credits": "number or null",
    "meetingTimes": "string or null",
    "semester": "string or null",
    "year": "string or null"
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
      "notes": "string or null"
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
      "type": "string (exam|project|homework|quiz|presentation|lab)",
      "dueDate": "string or null",
      "points": "number or null"
    }
  ],
  "policies": {
    "attendance": "string or null",
    "lateWork": "string or null",
    "academicIntegrity": "string or null",
    "accommodations": "string or null",
    "communication": "string or null"
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
    "tutoring": "string or null"
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

Create materials for:
1. Course Overview (with detailed description, objectives, and policies)
2. Weekly topic materials for the first ${options?.includeWeeks || 6} weeks
3. Assignment descriptions and rubrics where applicable

Course Information:
${JSON.stringify(extractedInfo, null, 2)}

Return a JSON array of materials with this structure:
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
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
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
