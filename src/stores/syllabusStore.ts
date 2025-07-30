import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  extractTextFromFile, 
  validateFileForExtraction, 
  getFileTypeDescription,
  estimateProcessingTime,
  type TextExtractionError 
} from '../utils/textExtraction';

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
      subSubsections: any[];
      images: any[];
      links: any[];
    }[];
    images: any[];
    links: any[];
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
  extractionMetadata: any;
  
  // Parsing results
  parsedCourseInfo: ParsedCourseInfo | null;
  
  // Generated materials
  generatedMaterials: GeneratedMaterial[];
  
  // UI state
  currentStep: 'upload' | 'processing' | 'review' | 'editing' | 'complete';
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  setUploadProgress: (progress: number) => void;
  setExtractedText: (text: string) => void;
  setParsedCourseInfo: (info: ParsedCourseInfo | null) => void;
  setGeneratedMaterials: (materials: GeneratedMaterial[]) => void;
  setCurrentStep: (step: SyllabusState['currentStep']) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Complex actions
  uploadSyllabus: (file: File) => Promise<void>;
  extractTextFromFile: () => Promise<void>;
  parseSyllabus: () => Promise<void>;
  generateMaterials: () => Promise<void>;
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
        parsedCourseInfo: null,
        generatedMaterials: [],
        currentStep: 'upload',
        isProcessing: false,
        error: null,
        
        // Simple setters
        setUploadedFile: (file) => set({ uploadedFile: file }),
        setUploadProgress: (progress) => set({ uploadProgress: progress }),
        setExtractedText: (text) => set({ extractedText: text }),
        setParsedCourseInfo: (info) => set({ parsedCourseInfo: info }),
        setGeneratedMaterials: (materials) => set({ generatedMaterials: materials }),
        setCurrentStep: (step) => set({ currentStep: step }),
        setIsProcessing: (processing) => set({ isProcessing: processing }),
        setError: (error) => set({ error }),
        
        // Complex actions
        uploadSyllabus: async (file: File) => {
          // Validate file before processing
          const validation = validateFileForExtraction(file);
          if (!validation.isValid) {
            set({ error: validation.error, currentStep: 'upload' });
            return;
          }

          set({ 
            uploadedFile: file, 
            uploadProgress: 0, 
            error: null,
            extractionMetadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: getFileTypeDescription(file),
              estimatedProcessingTime: estimateProcessingTime(file)
            }
          });
          
          try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
              set({ uploadProgress: i });
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            set({ currentStep: 'processing' });
            await get().extractTextFromFile();
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
            
            await get().parseSyllabus();
          } catch (error) {
            const extractionError = error as TextExtractionError;
            set({ 
              error: extractionError.message || 'Failed to extract text from file',
              isProcessing: false
            });
          }
        },
        
        parseSyllabus: async () => {
          const { extractedText } = get();
          if (!extractedText) {
            set({ error: 'No text to parse' });
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
            // Enhanced pattern-based parsing
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
                  // If no bullets found, take the next few lines as objectives
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
                // Create placeholder weeks
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
            
            const parsedInfo: ParsedCourseInfo = {
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
              schedule: schedule.slice(0, 15), // Limit to 15 weeks
              prerequisites: [],
              textbook: '',
              grading: ''
            };
            
            set({ parsedCourseInfo: parsedInfo, isProcessing: false });
            await get().generateMaterials();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to parse syllabus',
              isProcessing: false
            });
          }
        },
        
        generateMaterials: async () => {
          const { parsedCourseInfo } = get();
          if (!parsedCourseInfo) {
            set({ error: 'No parsed course info available' });
            return;
          }
          
          set({ isProcessing: true, error: null });
          
          try {
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
            parsedCourseInfo.schedule.slice(0, 6).forEach((week, _index) => {
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
            
            set({ 
              generatedMaterials: materials, 
              isProcessing: false, 
              currentStep: 'review' 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to generate materials',
              isProcessing: false
            });
          }
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
          parsedCourseInfo: null,
          generatedMaterials: [],
          currentStep: 'upload',
          isProcessing: false,
          error: null
        })
      }),
      {
        name: 'syllabus-store',
        partialize: (state) => ({
          // Only persist non-file data for performance
          extractedText: state.extractedText,
          extractionMetadata: state.extractionMetadata,
          parsedCourseInfo: state.parsedCourseInfo,
          generatedMaterials: state.generatedMaterials,
          currentStep: state.currentStep
        })
      }
    )
  )
); 