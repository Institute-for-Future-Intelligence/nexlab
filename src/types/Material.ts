import { Timestamp } from 'firebase/firestore';

export interface Section {
  id: string;
  title: string;
  content: string;
  subsections: Subsection[];
  images: { url: string; title: string }[];
  links: { title: string; url: string; description: string }[]; 
}

export interface Subsection {
  id: string;
  title: string;
  content: string;
  subSubsections: SubSubsection[];
  images: { url: string; title: string }[];
  links: { title: string; url: string; description: string }[];
}

export interface SubSubsection {
  id: string;
  title: string;
  content: string;
  images: { url: string; title: string }[];
  links: { title: string; url: string; description: string }[];
}

export interface Material {
  id: string;
  course: string;
  title: string;
  header: { title: string; content: string };
  footer: { title: string; content: string };
  sections: Section[];
  author: string;
  timestamp: Timestamp;
  published: boolean;
  scheduledTimestamp?: Timestamp;
  // Original file information for AI-imported materials
  originalFile?: {
    name: string;
    type: string;
    size: number;
    url: string; // Firebase Storage URL
    uploadedAt: Timestamp;
  };
}