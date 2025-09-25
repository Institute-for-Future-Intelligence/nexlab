import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  extractTextFromFile, 
  validateFileForExtraction, 
  getFileTypeDescription,
  estimateProcessingTime,
  type TextExtractionError 
} from '../utils/textExtraction';
import { 
  getGeminiService, 
  type AIExtractedCourseInfo 
} from '../services/geminiService';
import { 
  uploadSyllabusFile,
  type StoredSyllabusFile 
} from '../services/syllabusFileService';
import type { SubSubsection } from '../types/Material';

// Type for extraction metadata
interface ExtractionMetadata {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  estimatedProcessingTime?: number;
  wordCount?: number;
  pageCount?: number;
  processingTime?: number;
  confidence?: number;
}

// Enhanced progress tracking
interface ProcessingProgress {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete';
  percentage: number;
  currentOperation: string;
  subSteps?: {
    current: number;
    total: number;
    description: string;
  };
}

// Type definitions for material components
interface ImageItem {
  url: string;
  title: string;
}

interface LinkItem {
  title: string;
  url: string;
  description: string;
}

export interface WeeklyTopic {
  week: number;
  topic: string;
  description?: string;
  readings?: string[];
  assignments?: string[];
  date?: Date;
}

export interface ParsedCourseInfo {
  suggestedTitle: string;
  suggestedNumber: string;
  suggestedDescription: string;
  objectives: string[];
  schedule: WeeklyTopic[];
  prerequisites?: string[];
  textbook?: string;
  grading?: string;
  // Enhanced fields from AI extraction
  instructor?: string;
  department?: string;
  institution?: string;
  credits?: number;
  semester?: string;
  year?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    office?: string;
    officeHours?: string;
    website?: string;
  };
  policies?: {
    attendance?: string;
    lateWork?: string;
    academicIntegrity?: string;
    accommodations?: string;
  };
  textbooks?: {
    title: string;
    author?: string;
    edition?: string;
    required: boolean;
  }[];
  gradingComponents?: {
    component: string;
    percentage: number;
    description?: string;
  }[];
  assignments?: {
    name: string;
    description: string;
    type: string;
    dueDate?: string;
    points?: number;
  }[];
}

export interface GeneratedMaterial {
  id: string;
  title: string;
  header: { title: string; content: string };
  footer: { title: string; content: string };
  sections: {
    id: string;
    title: string;
    content: string;
    subsections: {
      id: string;
      title: string;
      content: string;
      subSubsections: SubSubsection[];
      images: ImageItem[];
      links: LinkItem[];
    }[];
    images: ImageItem[];
    links: LinkItem[];
  }[];
  published: boolean;
  scheduledTimestamp?: Date;
}

interface SyllabusState {
  // File upload state
  uploadedFile: File | null;
  uploadProgress: number;
  
  // Text extraction
  extractedText: string;
  extractionMetadata: ExtractionMetadata | null;
  
  // File storage
  storedSyllabusFile: StoredSyllabusFile | null;
  
  // AI processing
  aiExtractedInfo: AIExtractedCourseInfo | null;
  useAIProcessing: boolean;
  
  // Parsing results
  parsedCourseInfo: ParsedCourseInfo | null;
  
  // Generated materials
  generatedMaterials: GeneratedMaterial[];
  
  // UI state
  currentStep: 'upload' | 'processing' | 'review' | 'editing' | 'complete';
  isProcessing: boolean;
  error: string | null;
  processingProgress: ProcessingProgress | null;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  setUploadProgress: (progress: number) => void;
  setExtractedText: (text: string) => void;
  setStoredSyllabusFile: (file: StoredSyllabusFile | null) => void;
  setAIExtractedInfo: (info: AIExtractedCourseInfo | null) => void;
  setUseAIProcessing: (use: boolean) => void;
  setParsedCourseInfo: (info: ParsedCourseInfo | null) => void;
  setGeneratedMaterials: (materials: GeneratedMaterial[]) => void;
  setCurrentStep: (step: SyllabusState['currentStep']) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setProcessingProgress: (progress: ProcessingProgress | null) => void;
  
  // Complex actions
  uploadSyllabus: (file: File, educatorUid?: string) => Promise<void>;
  extractTextFromFile: () => Promise<void>;
  parseSyllabus: () => Promise<void>;
  generateMaterials: () => Promise<void>;
  fallbackParsing: (extractedText: string) => Promise<ParsedCourseInfo>;
  generateFallbackMaterials: (parsedCourseInfo: ParsedCourseInfo) => GeneratedMaterial[];
  editMaterial: (index: number, updates: Partial<GeneratedMaterial>) => void;
  editCourseInfo: (updates: Partial<ParsedCourseInfo>) => void;
  reset: () => void;
}

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const formatObjectives = (objectives: string[]): string => {
  if (!objectives.length) return '<p>No objectives specified</p>';
  
  const listItems = objectives.map(obj => `<li>${obj}</li>`).join('');
  return `<ul>${listItems}</ul>`;
};

const formatReadings = (readings: string[]): string => {
  if (!readings.length) return '<p>No readings assigned</p>';
  
  const listItems = readings.map(reading => `<li>${reading}</li>`).join('');
  return `<ul>${listItems}</ul>`;
};

export const useSyllabusStore = create<SyllabusState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        uploadedFile: null,
        uploadProgress: 0,
        extractedText: '',
        extractionMetadata: null,
        storedSyllabusFile: null,
        aiExtractedInfo: null,
        useAIProcessing: true, // Default to using AI
        parsedCourseInfo: null,
        generatedMaterials: [],
        currentStep: 'upload',
        isProcessing: false,
        error: null,
        processingProgress: null,
        
        // Simple setters
        setUploadedFile: (file) => set({ uploadedFile: file }),
        setUploadProgress: (progress) => set({ uploadProgress: progress }),
        setExtractedText: (text) => set({ extractedText: text }),
        setStoredSyllabusFile: (file) => set({ storedSyllabusFile: file }),
        setAIExtractedInfo: (info) => set({ aiExtractedInfo: info }),
        setUseAIProcessing: (use) => set({ useAIProcessing: use }),
        setParsedCourseInfo: (info) => set({ parsedCourseInfo: info }),
        setGeneratedMaterials: (materials) => set({ generatedMaterials: materials }),
        setCurrentStep: (step) => set({ currentStep: step }),
        setIsProcessing: (processing) => set({ isProcessing: processing }),
        setError: (error) => set({ error }),
        setProcessingProgress: (progress) => set({ processingProgress: progress }),
        
        // Complex actions
        uploadSyllabus: async (file: File, educatorUid?: string) => {
          // Validate file before processing
          const validation = validateFileForExtraction(file);
          if (!validation.isValid) {
            set({ error: validation.error, currentStep: 'upload' });
            return;
          }

          const estimatedTime = estimateProcessingTime(file);
          
          set({ 
            uploadedFile: file, 
            uploadProgress: 0, 
            error: null,
            extractionMetadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: getFileTypeDescription(file),
              estimatedProcessingTime: estimatedTime
            },
            processingProgress: {
              stage: 'uploading',
              percentage: 0,
              
              currentOperation: 'Preparing file for processing...'
            }
          });
          
          try {
            // Simulate upload progress with enhanced feedback
            for (let i = 0; i <= 100; i += 20) {
              set({ 
                uploadProgress: i,
                processingProgress: {
                  stage: 'uploading',
                  percentage: i,
                  
                  currentOperation: i === 100 ? 'Upload complete, starting text extraction...' : `Uploading file... ${i}%`
                }
              });
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            set({ 
              currentStep: 'processing', 
              isProcessing: true,
              processingProgress: {
                stage: 'extracting',
                percentage: 0,
                
                currentOperation: 'Extracting text from document...'
              }
            });
            
            await get().extractTextFromFile();
            
            // Upload file to storage if educator UID is provided
            if (educatorUid) {
              try {
                set({
                  processingProgress: {
                    stage: 'uploading',
                    percentage: 90,
                    currentOperation: 'Storing syllabus file...'
                  }
                });
                
                const storedFile = await uploadSyllabusFile(file, educatorUid);
                set({ storedSyllabusFile: storedFile });
                
                console.log('Syllabus file stored successfully:', storedFile.url);
              } catch (storageError) {
                console.warn('Failed to store syllabus file, continuing with processing:', storageError);
                // Don't fail the entire process if file storage fails
              }
            }
            
            // Update progress for analysis phase
            set({
              processingProgress: {
                stage: 'analyzing',
                percentage: 0,
                
                currentOperation: get().useAIProcessing ? 'Analyzing syllabus with AI...' : 'Parsing syllabus content...'
              }
            });
            
            // Now parse the syllabus with appropriate method
            await get().parseSyllabus();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to upload file',
              currentStep: 'upload'
            });
          }
        },
        
        extractTextFromFile: async () => {
          const { uploadedFile } = get();
          if (!uploadedFile) {
            set({ error: 'No file uploaded' });
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            const result = await extractTextFromFile(uploadedFile);
            
            set({ 
              extractedText: result.text,
              extractionMetadata: {
                ...get().extractionMetadata,
                ...result.metadata
              },
              isProcessing: false 
            });
            
            // Don't automatically parse here - let the upload method handle it
          } catch (error) {
            const extractionError = error as TextExtractionError;
            set({ 
              error: extractionError.message || 'Failed to extract text from file',
              isProcessing: false
            });
          }
        },
        
        parseSyllabus: async () => {
          const { extractedText, uploadedFile, useAIProcessing } = get();
          if (!extractedText) {
            set({ error: 'No text to parse' });
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            let parsedInfo: ParsedCourseInfo;
            
            // Use AI processing if enabled
            if (useAIProcessing) {
              try {
                // Update progress for AI analysis
                set({
                  processingProgress: {
                    stage: 'analyzing',
                    percentage: 25,

                    currentOperation: 'Sending syllabus to AI for analysis...'
                  }
                });
                
                const geminiService = getGeminiService(); // API key from environment only
                const aiResult = await geminiService.processSyllabusText(
                  extractedText,
                  uploadedFile?.name
                );
                
                // Update progress after AI analysis
                set({
                  processingProgress: {
                    stage: 'analyzing',
                    percentage: 75,

                    currentOperation: 'Processing AI analysis results...'
                  }
                });
                
                set({ aiExtractedInfo: aiResult });
                
                // Convert AI result to ParsedCourseInfo format
                parsedInfo = {
                  suggestedTitle: aiResult.courseInfo.title || 'Course Title',
                  suggestedNumber: aiResult.courseInfo.number || 'COURSE 101',
                  suggestedDescription: aiResult.courseInfo.description || 'Course description not available',
                  objectives: aiResult.learningObjectives.length > 0 ? aiResult.learningObjectives : [
                    'Students will understand key concepts',
                    'Students will develop practical skills',
                    'Students will apply knowledge to real-world scenarios'
                  ],
                  schedule: aiResult.schedule.map(week => ({
                    week: week.week,
                    topic: week.topic,
                    description: week.description,
                    readings: week.readings || [],
                    assignments: week.assignments || [],
                    date: week.dueDate ? new Date(week.dueDate) : undefined
                  })),
                  prerequisites: aiResult.prerequisites,
                  textbook: aiResult.textbooks.length > 0 ? aiResult.textbooks[0].title : '',
                  grading: aiResult.gradingPolicy.map(g => `${g.component}: ${g.percentage}%`).join(', '),
                  // Enhanced fields from AI
                  instructor: aiResult.courseInfo.instructor,
                  department: aiResult.courseInfo.department,
                  institution: aiResult.courseInfo.institution,
                  credits: aiResult.courseInfo.credits,
                  semester: aiResult.courseInfo.semester,
                  year: aiResult.courseInfo.year,
                  contactInfo: aiResult.contactInfo,
                  policies: aiResult.policies,
                  textbooks: aiResult.textbooks,
                  gradingComponents: aiResult.gradingPolicy,
                  assignments: aiResult.assignments
                };
              } catch (aiError) {
                console.warn('AI processing failed, falling back to pattern-based parsing:', aiError);
                // Set a more specific error message for AI failures
                set({ 
                  error: `AI analysis failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}. Using pattern-based parsing instead.`,
                  processingProgress: {
                    stage: 'analyzing',
                    percentage: 50,
                    currentOperation: 'AI failed, using pattern-based parsing...'
                  }
                });
                // Fall back to pattern-based parsing
                parsedInfo = await get().fallbackParsing(extractedText);
              }
            } else {
              // Use pattern-based parsing
              parsedInfo = await get().fallbackParsing(extractedText);
            }
            
            set({ parsedCourseInfo: parsedInfo });
            
            // Update progress for material generation
            set({
              processingProgress: {
                stage: 'generating',
                percentage: 0,

                currentOperation: 'Generating course materials...'
              }
            });
            
            await get().generateMaterials();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to parse syllabus',
              isProcessing: false
            });
          }
        },
        
        // Fallback parsing method (original logic)
        fallbackParsing: async (extractedText: string): Promise<ParsedCourseInfo> => {
          const lines = extractedText.split('\n').filter(line => line.trim());
          
          // Extract course info with better patterns
          const titleMatch = lines.find(line => {
            const lower = line.toLowerCase();
            return (lower.includes('course') || lower.includes('class')) && 
                   (lower.includes('title') || lower.includes('name') || line.includes(':'));
          });
          
          const descriptionMatch = lines.find(line => {
            const lower = line.toLowerCase();
            return lower.includes('description') || 
                   lower.includes('overview') || 
                   lower.includes('about this course');
          });
          
          // Extract course number with better patterns
          const courseNumberMatch = lines.find(line => {
            return /[A-Z]{2,4}\s*\d{3,4}/.test(line) || 
                   line.toLowerCase().includes('course number');
          });
          
          // Extract objectives with improved detection
          const objectivesStartIndex = lines.findIndex(line => {
            const lower = line.toLowerCase();
            return lower.includes('objective') ||
                   lower.includes('learning outcome') ||
                   lower.includes('goals') ||
                   lower.includes('by the end of this course');
          });
          
          const objectives: string[] = [];
          if (objectivesStartIndex !== -1) {
            for (let i = objectivesStartIndex + 1; i < lines.length && i < objectivesStartIndex + 15; i++) {
              const line = lines[i].trim();
              if (line && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./) || line.startsWith('*'))) {
                objectives.push(line.replace(/^[-•\d.*]\s*/, ''));
              } else if (line && objectives.length === 0) {
                objectives.push(line);
              }
            }
          }
          
          // Enhanced schedule detection
          const schedule: WeeklyTopic[] = [];
          for (let i = 1; i <= 16; i++) {
            const weekPattern = new RegExp(`week\\s*${i}|${i}\\s*week`, 'i');
            const weekLine = lines.find(line => weekPattern.test(line));
            
            if (weekLine) {
              const topic = weekLine.replace(/week\s*\d+:?\s*/i, '').trim() || `Week ${i} Topic`;
              schedule.push({
                week: i,
                topic,
                description: `Content and activities for week ${i}`,
                readings: [],
                assignments: []
              });
            } else {
              schedule.push({
                week: i,
                topic: `Week ${i} Topic`,
                description: `Content for week ${i}`,
                readings: [],
                assignments: []
              });
            }
          }
          
          // Extract course number from text
          let extractedCourseNumber = 'COURSE 101';
          if (courseNumberMatch) {
            const numberMatch = courseNumberMatch.match(/[A-Z]{2,4}\s*\d{3,4}/);
            if (numberMatch) {
              extractedCourseNumber = numberMatch[0];
            }
          }
          
          return {
            suggestedTitle: titleMatch ? 
              titleMatch.split(':').slice(-1)[0]?.trim() || 'Course Title' : 
              'Course Title',
            suggestedNumber: extractedCourseNumber,
            suggestedDescription: descriptionMatch ? 
              descriptionMatch.split(':').slice(-1)[0]?.trim() || extractedText.substring(0, 300) + '...' : 
              extractedText.substring(0, 300) + '...',
            objectives: objectives.length > 0 ? objectives : [
              'Students will understand key concepts',
              'Students will develop practical skills',
              'Students will apply knowledge to real-world scenarios'
            ],
            schedule: schedule.slice(0, 15),
            prerequisites: [],
            textbook: '',
            grading: ''
          };
        },
        
        generateMaterials: async () => {
          const { parsedCourseInfo, aiExtractedInfo, useAIProcessing } = get();
          if (!parsedCourseInfo) {
            set({ error: 'No parsed course info available' });
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            let materials: GeneratedMaterial[] = [];
            
            // Use AI-enhanced material generation if available
            if (useAIProcessing && aiExtractedInfo) {
              try {
                const geminiService = getGeminiService(); // API key from environment only
                const aiMaterials = await geminiService.generateCourseMaterials(aiExtractedInfo, {
                  includeWeeks: aiExtractedInfo.schedule.length, // Generate for all weeks/sessions
                  materialTypes: ['overview', 'weekly', 'assignment']
                });
                
                // Convert AI materials to GeneratedMaterial format if we got valid results
                if (aiMaterials && aiMaterials.length > 0) {
                  materials = aiMaterials.map((material: any) => ({
                    id: material.id || generateId(),
                    title: material.title || 'Generated Material',
                    header: material.header || { title: "Header", content: `<p>${material.title || 'Material'}</p>` },
                    footer: material.footer || { title: "Footer", content: "<p>Contact instructor for questions</p>" },
                    sections: material.sections || [],
                    published: material.published || false,
                    scheduledTimestamp: material.scheduledTimestamp ? new Date(material.scheduledTimestamp) : undefined
                  }));
                } else {
                  console.warn('AI material generation returned empty results, using fallback');
                  materials = get().generateFallbackMaterials(parsedCourseInfo);
                }
              } catch (aiError) {
                console.warn('AI material generation failed, using fallback:', aiError);
                // Set a more specific error message for AI material generation failures
                set({ 
                  error: `AI material generation failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}. Using fallback material generation instead.`,
                  processingProgress: {
                    stage: 'generating',
                    percentage: 75,
                    currentOperation: 'AI material generation failed, using fallback...'
                  }
                });
                materials = get().generateFallbackMaterials(parsedCourseInfo);
              }
            } else {
              materials = get().generateFallbackMaterials(parsedCourseInfo);
            }
            
            set({ 
              generatedMaterials: materials, 
              isProcessing: false, 
              currentStep: 'review',
              processingProgress: {
                stage: 'complete',
                percentage: 100,

                currentOperation: 'Processing complete! Review your course materials below.'
              }
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to generate materials',
              isProcessing: false
            });
          }
        },
        
        // Fallback material generation (original logic)
        generateFallbackMaterials: (parsedCourseInfo: ParsedCourseInfo): GeneratedMaterial[] => {
          const materials: GeneratedMaterial[] = [];
          
          // 1. Course Overview Material
          materials.push({
            id: generateId(),
            title: `${parsedCourseInfo.suggestedNumber} - Course Overview`,
              header: { 
                title: "Course Overview", 
                content: `<p>${parsedCourseInfo.suggestedTitle}</p>` 
              },
              footer: { 
                title: "Footer", 
                content: "<p>Contact instructor for questions</p>" 
              },
              sections: [
                {
                  id: generateId(),
                  title: "Course Description",
                  content: `<p>${parsedCourseInfo.suggestedDescription}</p>`,
                  subsections: [],
                  images: [],
                  links: []
                },
                {
                  id: generateId(),
                  title: "Learning Objectives",
                  content: formatObjectives(parsedCourseInfo.objectives),
                  subsections: [],
                  images: [],
                  links: []
                }
              ],
              published: false
            });
            
            // 2. Weekly Topic Materials (first 6 weeks as example)
            parsedCourseInfo.schedule.slice(0, 6).forEach((week) => {
              materials.push({
                id: generateId(),
                title: `Week ${week.week}: ${week.topic}`,
                header: { 
                  title: `Week ${week.week}`, 
                  content: `<p>${week.topic}</p>` 
                },
                footer: { 
                  title: "Footer", 
                  content: "<p>Review materials before next class</p>" 
                },
                sections: [
                  {
                    id: generateId(),
                    title: "Overview",
                    content: `<p>${week.description || `Topics and activities for week ${week.week}`}</p>`,
                    subsections: week.readings && week.readings.length > 0 ? [{
                      id: generateId(),
                      title: "Required Readings",
                      content: formatReadings(week.readings),
                      subSubsections: [],
                      images: [],
                      links: []
                    }] : [],
                    images: [],
                    links: []
                  }
                ],
                published: false,
                scheduledTimestamp: week.date
              });
            });
            
            return materials;
        },
        
        editMaterial: (index: number, updates: Partial<GeneratedMaterial>) => {
          const { generatedMaterials } = get();
          const updatedMaterials = [...generatedMaterials];
          updatedMaterials[index] = { ...updatedMaterials[index], ...updates };
          set({ generatedMaterials: updatedMaterials });
        },
        
        editCourseInfo: (updates: Partial<ParsedCourseInfo>) => {
          const { parsedCourseInfo } = get();
          if (parsedCourseInfo) {
            set({ parsedCourseInfo: { ...parsedCourseInfo, ...updates } });
          }
        },
        
        reset: () => set({
          uploadedFile: null,
          uploadProgress: 0,
          extractedText: '',
          extractionMetadata: null,
          storedSyllabusFile: null,
          aiExtractedInfo: null,
          useAIProcessing: true,
          parsedCourseInfo: null,
          generatedMaterials: [],
          currentStep: 'upload',
          isProcessing: false,
          error: null,
          processingProgress: null
        })
      }),
      {
        name: 'syllabus-store',
        partialize: (state) => ({
          // Only persist non-file data for performance
          extractedText: state.extractedText,
          extractionMetadata: state.extractionMetadata,
          storedSyllabusFile: state.storedSyllabusFile,
          aiExtractedInfo: state.aiExtractedInfo,
          useAIProcessing: state.useAIProcessing,
          parsedCourseInfo: state.parsedCourseInfo,
          generatedMaterials: state.generatedMaterials,
          currentStep: state.currentStep
        })
      }
    )
  )
); 