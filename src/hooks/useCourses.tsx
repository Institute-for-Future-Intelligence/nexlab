import { useMemo } from 'react';
import { useUser } from './useUser';
import { FirebaseTimestamp, getDateFromTimestamp } from '../types/firebase';

interface Course {
  id: string;
  number: string;
  title: string;
  isPublic?: boolean;
  courseCreatedAt?: Date; // When the course was originally created
  enrolledAt?: Date; // When the user was enrolled in this course
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
      let courseCreatedAt: Date | undefined;
      let enrolledAt: Date | undefined;
      
      // Handle courseCreatedAt timestamp
      if (course.courseCreatedAt) {
        if (course.courseCreatedAt instanceof Date) {
          courseCreatedAt = course.courseCreatedAt;
        } else {
          courseCreatedAt = getDateFromTimestamp(course.courseCreatedAt as FirebaseTimestamp);
        }
      }
      
      // Handle enrolledAt timestamp
      if (course.enrolledAt) {
        if (course.enrolledAt instanceof Date) {
          enrolledAt = course.enrolledAt;
        } else {
          enrolledAt = getDateFromTimestamp(course.enrolledAt as FirebaseTimestamp);
        }
      }

      return {
        id,
        number: course.number,
        title: course.title,
        isPublic: id === import.meta.env.VITE_PUBLIC_COURSE_ID, // Public course ID
        courseCreatedAt: courseCreatedAt || undefined,
        enrolledAt: enrolledAt || undefined,
        isCourseAdmin: course.isCourseAdmin,
      };
    });

    // Separate public and user courses
    const publicCourses = courses.filter(course => course.isPublic);
    const userCourses = courses.filter(course => !course.isPublic);

    // Sort user courses by enrollment date (newest enrollment first)
    // This shows recently enrolled courses at the top
    userCourses.sort((a, b) => {
      if (!a.enrolledAt && !b.enrolledAt) return 0;
      if (!a.enrolledAt) return 1;
      if (!b.enrolledAt) return -1;
      return b.enrolledAt.getTime() - a.enrolledAt.getTime();
    });

    return { publicCourses, userCourses };
  }, [userDetails?.classes]);

  return sortedCourses;
};
