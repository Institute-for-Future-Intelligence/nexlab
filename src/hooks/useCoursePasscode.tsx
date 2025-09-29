// src/hooks/useCoursePasscode.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface CoursePasscodeState {
  passcode: string | null;
  loading: boolean;
  error: string | null;
}

interface UseCoursePasscodeReturn extends CoursePasscodeState {
  fetchPasscode: (courseId: string) => Promise<void>;
  clearPasscode: () => void;
  clearCache: () => void;
}

/**
 * Custom hook for managing course passcode retrieval with caching
 * Follows React best practices with proper error handling, loading states, and caching
 */
export const useCoursePasscode = (): UseCoursePasscodeReturn => {
  const [state, setState] = useState<CoursePasscodeState>({
    passcode: null,
    loading: false,
    error: null,
  });

  // Cache to store passcodes by courseId to avoid redundant queries
  const passcodeCache = useRef<Map<string, string>>(new Map());
  const db = getFirestore();

  const fetchPasscode = useCallback(async (courseId: string): Promise<void> => {
    if (!courseId) {
      setState(prev => ({ ...prev, error: 'Course ID is required' }));
      return;
    }

    // Check cache first
    const cachedPasscode = passcodeCache.current.get(courseId);
    if (cachedPasscode) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null,
        passcode: cachedPasscode 
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      
      if (!courseDoc.exists()) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Course not found',
          passcode: null 
        }));
        return;
      }

      const courseData = courseDoc.data();
      const passcode = courseData?.passcode;

      if (!passcode) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'No passcode found for this course',
          passcode: null 
        }));
        return;
      }

      // Cache the passcode for future use
      passcodeCache.current.set(courseId, passcode);

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null,
        passcode 
      }));

    } catch (error) {
      console.error('Error fetching course passcode:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch passcode. Please try again.',
        passcode: null 
      }));
    }
  }, [db]);

  const clearPasscode = useCallback((): void => {
    setState(prev => ({ 
      ...prev, 
      passcode: null, 
      error: null 
    }));
  }, []);

  const clearCache = useCallback((): void => {
    passcodeCache.current.clear();
  }, []);

  return {
    ...state,
    fetchPasscode,
    clearPasscode,
    clearCache,
  };
};
