import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

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
          set({ uploadedFile: file, uploadProgress: 0, error: null });
          
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
            let extractedText = '';
            const fileType = uploadedFile.type;
            
            if (fileType === 'text/plain') {
              extractedText = await uploadedFile.text();
            } else if (fileType === 'application/pdf') {
              // For now, we'll implement a basic PDF text extraction
              // In a real implementation, you'd use pdf-parse
              extractedText = await uploadedFile.text(); // Fallback
              set({ error: 'PDF parsing not yet implemented. Please use a text file for now.' });
              return;
            } else if (fileType.includes('wordprocessingml')) {
              // For now, we'll implement a basic DOCX text extraction
              // In a real implementation, you'd use mammoth
              set({ error: 'DOCX parsing not yet implemented. Please use a text file for now.' });
              return;
            } else {
              throw new Error(`Unsupported file format: ${fileType}`);
            }
            
            set({ extractedText, isProcessing: false });
            await get().parseSyllabus();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to extract text from file',
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
            // Basic pattern-based parsing (will be enhanced with AI later)
            const lines = extractedText.split('\n').filter(line => line.trim());
            
            // Extract course info
            const titleMatch = lines.find(line => 
              line.toLowerCase().includes('course') && 
              (line.toLowerCase().includes('title') || line.includes(':'))
            );
            
            const descriptionMatch = lines.find(line => 
              line.toLowerCase().includes('description') ||
              line.toLowerCase().includes('overview')
            );
            
            // Extract objectives
            const objectivesStartIndex = lines.findIndex(line => 
              line.toLowerCase().includes('objective') ||
              line.toLowerCase().includes('learning outcome') ||
              line.toLowerCase().includes('goals')
            );
            
            const objectives: string[] = [];
            if (objectivesStartIndex !== -1) {
              for (let i = objectivesStartIndex + 1; i < lines.length && i < objectivesStartIndex + 10; i++) {
                const line = lines[i].trim();
                if (line && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
                  objectives.push(line.replace(/^[-•\d\.]\s*/, ''));
                }
              }
            }
            
            // Create basic schedule (will be enhanced)
            const schedule: WeeklyTopic[] = Array.from({ length: 15 }, (_, i) => ({
              week: i + 1,
              topic: `Week ${i + 1} Topic`,
              description: `Content for week ${i + 1}`,
              readings: [],
              assignments: []
            }));
            
            const parsedInfo: ParsedCourseInfo = {
              suggestedTitle: titleMatch ? titleMatch.split(':')[1]?.trim() || 'Course Title' : 'Course Title',
              suggestedNumber: 'COURSE 101',
              suggestedDescription: descriptionMatch ? descriptionMatch.split(':')[1]?.trim() || extractedText.substring(0, 200) + '...' : 'Course description extracted from syllabus.',
              objectives: objectives.length > 0 ? objectives : ['Course objective 1', 'Course objective 2'],
              schedule,
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
            
            // 2. Weekly Topic Materials (first 5 weeks as example)
            parsedCourseInfo.schedule.slice(0, 5).forEach((week, index) => {
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
          parsedCourseInfo: state.parsedCourseInfo,
          generatedMaterials: state.generatedMaterials,
          currentStep: state.currentStep
        })
      }
    )
  )
); 