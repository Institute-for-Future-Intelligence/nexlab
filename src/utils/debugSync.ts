// src/utils/debugSync.ts

/**
 * Utility functions for debugging real-time synchronization issues
 */

export const logUserDetailsUpdate = (context: string, userDetails: any) => {
  console.log(`[${context}] User details updated:`, {
    uid: userDetails?.uid,
    classesCount: userDetails?.classes ? Object.keys(userDetails.classes).length : 0,
    classes: userDetails?.classes ? Object.keys(userDetails.classes) : [],
    timestamp: new Date().toISOString()
  });
};

export const logCourseListChange = (context: string, courses: any[]) => {
  console.log(`[${context}] Course list changed:`, {
    count: courses.length,
    courseIds: courses.map(c => c.id),
    courseNames: courses.map(c => `${c.number} - ${c.title}`),
    timestamp: new Date().toISOString()
  });
};

export const simulateUserCourseUpdate = async (uid: string, courseId: string, courseData: any) => {
  console.log(`[DEBUG] Simulating course update for user ${uid}:`, {
    courseId,
    courseData,
    timestamp: new Date().toISOString()
  });
  
  // This is for testing purposes only
  // In production, this would be handled by the admin approval process
};
