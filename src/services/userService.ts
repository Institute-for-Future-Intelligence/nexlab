import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  setDoc,
  onSnapshot,
  Unsubscribe,
  Firestore,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { UserDetails } from '../contexts/UserContext';
import { FirebaseUser } from './authService';

/** Course info stored in user's classes object */
export interface UserCourseInfo {
  number: string;
  title: string;
  isCourseAdmin: boolean;
  isPublic?: boolean;
  courseCreatedAt?: Date;
  enrolledAt?: Date;
}

/** Public course data fetched from Firestore */
export interface PublicCourseData {
  id: string;
  number: string;
  title: string;
  isPublic: boolean;
  courseCreatedAt?: Date;
}

export interface UserService {
  getUserDetails: (uid: string) => Promise<UserDetails | null>;
  createUserDocument: (user: FirebaseUser) => Promise<UserDetails>;
  updateUserLogin: (uid: string) => Promise<void>;
  refreshUserDetails: (uid: string) => Promise<UserDetails | null>;
  subscribeToUserDetails: (uid: string, callback: (details: UserDetails | null) => void) => Unsubscribe;
  getPublicCourses: () => Promise<PublicCourseData[]>;
}

class FirestoreUserService implements UserService {
  private db: Firestore | null = null;
  // Keep legacy env var for backwards compatibility during migration
  private legacyPublicCourseId: string | undefined;

  constructor() {
    this.legacyPublicCourseId = import.meta.env.VITE_PUBLIC_COURSE_ID;
  }

  private initialize() {
    if (!this.db) {
      // Import Firebase config to ensure initialization
      import('../config/firestore');
      this.db = getFirestore();
    }
  }

  async getUserDetails(uid: string): Promise<UserDetails | null> {
    this.initialize();
    try {
      const userRef = doc(this.db!, "users", uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const data = userDoc.data() as Omit<UserDetails, 'uid'>;
      return { ...data, uid };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw new Error("Failed to fetch user details");
    }
  }

  async createUserDocument(user: FirebaseUser): Promise<UserDetails> {
    this.initialize();
    try {
      // Fetch all public courses and add them to the new user
      const publicCourses = await this.getPublicCourses();
      const classesObj: Record<string, UserCourseInfo> = {};
      
      for (const course of publicCourses) {
        classesObj[course.id] = {
          number: course.number,
          title: course.title,
          isCourseAdmin: false,
          isPublic: true,
          courseCreatedAt: course.courseCreatedAt,
          enrolledAt: new Date(),
        };
      }

      const userRef = doc(this.db!, "users", user.uid);
      
      const newUserData = {
        isAdmin: false,
        isSuperAdmin: false,
        lastLogin: serverTimestamp(),
        classes: classesObj,
      };
      
      await setDoc(userRef, newUserData);
      
      return {
        uid: user.uid,
        isAdmin: false,
        isSuperAdmin: false,
        lastLogin: serverTimestamp(),
        classes: classesObj,
      };
    } catch (error) {
      console.error("Error creating user document:", error);
      throw new Error("Failed to create user document");
    }
  }

  async updateUserLogin(uid: string): Promise<void> {
    this.initialize();
    try {
      const userRef = doc(this.db!, "users", uid);
      await updateDoc(userRef, { 
        lastLogin: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error updating user login:", error);
      throw new Error("Failed to update user login");
    }
  }

  async refreshUserDetails(uid: string): Promise<UserDetails | null> {
    return this.getUserDetails(uid);
  }

  subscribeToUserDetails(uid: string, callback: (details: UserDetails | null) => void): Unsubscribe {
    this.initialize();
    
    const userRef = doc(this.db!, "users", uid);
    
    return onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Omit<UserDetails, 'uid'>;
          callback({ ...data, uid });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("Error in user details subscription:", error);
        callback(null);
      }
    );
  }

  async ensurePublicCourseAccess(uid: string, existingUserDetails: UserDetails): Promise<UserDetails> {
    this.initialize();
    try {
      // Fetch all public courses from Firestore
      const publicCourses = await this.getPublicCourses();
      
      if (publicCourses.length === 0) {
        console.warn("No public courses found in database");
        return existingUserDetails;
      }

      const existingClasses = existingUserDetails.classes || {};
      const updates: Record<string, UserCourseInfo> = {};
      let hasUpdates = false;
      
      // Check which public courses the user doesn't have and add them
      for (const course of publicCourses) {
        if (!existingClasses[course.id]) {
          updates[`classes.${course.id}`] = {
            number: course.number,
            title: course.title,
            isCourseAdmin: false,
            isPublic: true,
            courseCreatedAt: course.courseCreatedAt,
            enrolledAt: new Date(),
          };
          hasUpdates = true;
        } else if (!existingClasses[course.id].isPublic) {
          // Course exists but isPublic flag is not set - update it
          updates[`classes.${course.id}.isPublic`] = true as unknown as UserCourseInfo;
          hasUpdates = true;
        }
      }
      
      // If no updates needed, return existing details
      if (!hasUpdates) {
        return existingUserDetails;
      }
      
      // Apply updates to Firestore
      const userRef = doc(this.db!, "users", uid);
      await updateDoc(userRef, updates);
      
      // Build updated classes object for return
      const updatedClasses = { ...existingClasses };
      for (const course of publicCourses) {
        if (!updatedClasses[course.id]) {
          updatedClasses[course.id] = {
            number: course.number,
            title: course.title,
            isCourseAdmin: false,
            isPublic: true,
            courseCreatedAt: course.courseCreatedAt,
            enrolledAt: new Date(),
          };
        } else {
          updatedClasses[course.id] = {
            ...updatedClasses[course.id],
            isPublic: true,
          };
        }
      }
      
      return {
        ...existingUserDetails,
        classes: updatedClasses,
      };
    } catch (error) {
      console.error("Error ensuring public course access:", error);
      throw new Error("Failed to ensure public course access");
    }
  }

  /**
   * Fetch all public courses from Firestore
   * Queries courses collection for documents where isPublic === true
   * Falls back to legacy single public course ID if no isPublic courses found
   */
  async getPublicCourses(): Promise<PublicCourseData[]> {
    this.initialize();
    try {
      const coursesRef = collection(this.db!, "courses");
      const publicQuery = query(coursesRef, where("isPublic", "==", true));
      const querySnapshot = await getDocs(publicQuery);
      
      const publicCourses: PublicCourseData[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.number && data.title) {
          publicCourses.push({
            id: docSnapshot.id,
            number: data.number,
            title: data.title,
            isPublic: true,
            courseCreatedAt: data.courseCreatedAt?.toDate?.() || data.createdAt?.toDate?.() || undefined,
          });
        }
      });
      
      // Fallback: If no public courses found via isPublic field,
      // check legacy env var for backwards compatibility
      if (publicCourses.length === 0 && this.legacyPublicCourseId) {
        console.log("No public courses found via isPublic field, falling back to legacy env var");
        const legacyCourse = await this.getLegacyPublicCourseInfo();
        if (legacyCourse) {
          publicCourses.push(legacyCourse);
        }
      }
      
      return publicCourses;
    } catch (error) {
      console.error("Error fetching public courses:", error);
      throw new Error("Failed to fetch public courses");
    }
  }

  /**
   * Legacy method for backwards compatibility
   * Fetches single public course by ID from environment variable
   */
  private async getLegacyPublicCourseInfo(): Promise<PublicCourseData | null> {
    if (!this.legacyPublicCourseId) {
      return null;
    }
    
    this.initialize();
    try {
      const publicCourseRef = doc(this.db!, "courses", this.legacyPublicCourseId);
      const publicCourseDoc = await getDoc(publicCourseRef);
      
      if (!publicCourseDoc.exists()) {
        console.warn("Legacy public course document does not exist");
        return null;
      }
      
      const data = publicCourseDoc.data();
      
      if (!data || !data.number || !data.title) {
        console.warn("Legacy public course data is incomplete");
        return null;
      }
      
      return {
        id: this.legacyPublicCourseId,
        number: data.number,
        title: data.title,
        isPublic: true,
        courseCreatedAt: data.courseCreatedAt?.toDate?.() || data.createdAt?.toDate?.() || undefined,
      };
    } catch (error) {
      console.error("Error fetching legacy public course info:", error);
      return null;
    }
  }
}

// Export singleton instance
export const userService = new FirestoreUserService(); 