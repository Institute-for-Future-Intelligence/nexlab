import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Service to enhance course-related operations with creation date tracking
 */
class CourseEnhancementService {
  private db = getFirestore();

  /**
   * Updates user's course enrollment with creation date from the course document
   * @param userId - User ID
   * @param courseId - Course ID
   */
  async enhanceUserCourseWithCreationDate(userId: string, courseId: string): Promise<void> {
    try {
      // Get the course document to retrieve creation date
      const courseRef = doc(this.db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        console.warn(`Course ${courseId} not found`);
        return;
      }

      const courseData = courseDoc.data();
      const courseCreatedAt = courseData.createdAt || courseData.timestamp;

      // Get user document
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn(`User ${userId} not found`);
        return;
      }

      const userData = userDoc.data();
      const existingClasses = userData.classes || {};

      // Update the specific course in user's classes with creation date
      if (existingClasses[courseId]) {
        await updateDoc(userRef, {
          [`classes.${courseId}.createdAt`]: courseCreatedAt || serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error enhancing user course with creation date:', error);
    }
  }

  /**
   * Enhances all user courses with creation dates
   * @param userId - User ID
   */
  async enhanceAllUserCoursesWithCreationDates(userId: string): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn(`User ${userId} not found`);
        return;
      }

      const userData = userDoc.data();
      const classes = userData.classes || {};

      // Process each course
      const updatePromises = Object.keys(classes).map(async (courseId) => {
        try {
          const courseRef = doc(this.db, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            const courseCreatedAt = courseData.createdAt || courseData.timestamp;

            if (courseCreatedAt && !classes[courseId].createdAt) {
              await updateDoc(userRef, {
                [`classes.${courseId}.createdAt`]: courseCreatedAt,
              });
            }
          }
        } catch (error) {
          console.error(`Error enhancing course ${courseId}:`, error);
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error enhancing all user courses:', error);
    }
  }
}

export const courseEnhancementService = new CourseEnhancementService();
