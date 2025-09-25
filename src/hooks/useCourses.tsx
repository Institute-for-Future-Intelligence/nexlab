import { useMemo } from 'react';
import { useUser } from './useUser';
import { FirebaseTimestamp, getDateFromTimestamp } from '../types/firebase';

interface Course {
  id: string;
  number: string;
  title: string;
  isPublic?: boolean;
  createdAt?: Date;
  isCourseAdmin?: boolean;
}

interface SortedCourses {
  publicCourses: Course[];
  userCourses: Course[];
}

export const useCourses = (): SortedCourses => {
  const { userDetails } = useUser();

  const sortedCourses = useMemo(() => {
    if (!userDetails?.classes) {
      return { publicCourses: [], userCourses: [] };
    }

    // Convert user classes to course array
    const courses: Course[] = Object.entries(userDetails.classes).map(([id, course]) => {
      let createdAt: Date | undefined;
      
      // Handle different timestamp formats
      if (course.createdAt) {
        if (course.createdAt instanceof Date) {
          createdAt = course.createdAt;
        } else {
          // Use the helper function for Firebase timestamps
          createdAt = getDateFromTimestamp(course.createdAt as FirebaseTimestamp);
        }
      }

      return {
        id,
        number: course.number,
        title: course.title,
        isPublic: id === import.meta.env.VITE_PUBLIC_COURSE_ID, // Public course ID
        createdAt: createdAt || undefined,
        isCourseAdmin: course.isCourseAdmin,
      };
    });

    // Separate public and user courses
    const publicCourses = courses.filter(course => course.isPublic);
    const userCourses = courses.filter(course => !course.isPublic);

    // Sort user courses by creation date (newest first)
    userCourses.sort((a, b) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return { publicCourses, userCourses };
  }, [userDetails?.classes]);

  return sortedCourses;
};
