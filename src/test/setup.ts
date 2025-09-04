// src/test/setup.ts
import { beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  User: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp', seconds: Date.now() / 1000 })),
  setDoc: vi.fn()
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn()
}));

// Mock environment variables
beforeAll(() => {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-auth-domain');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project-id');
  vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-storage-bucket');
  vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'test-sender-id');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
  vi.stubEnv('VITE_PUBLIC_COURSE_ID', 'test-public-course-id');
  vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key');
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};
