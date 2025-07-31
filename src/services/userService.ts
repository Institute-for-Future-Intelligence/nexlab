import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  setDoc,
  Firestore 
} from "firebase/firestore";
import { UserDetails } from '../contexts/UserContext';
import { FirebaseUser } from './authService';

export interface UserService {
  getUserDetails: (uid: string) => Promise<UserDetails | null>;
  createUserDocument: (user: FirebaseUser) => Promise<UserDetails>;
  updateUserLogin: (uid: string) => Promise<void>;
  refreshUserDetails: (uid: string) => Promise<UserDetails | null>;
}

class FirestoreUserService implements UserService {
  private db: Firestore;
  private publicCourseId: string;

  constructor() {
    this.db = getFirestore();
    this.publicCourseId = import.meta.env.VITE_PUBLIC_COURSE_ID;
    
    if (!this.publicCourseId) {
      throw new Error("Public course ID is not defined in environment variables.");
    }
  }

  async getUserDetails(uid: string): Promise<UserDetails | null> {
    try {
      const userRef = doc(this.db, "users", uid);
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
    try {
      const publicCourse = await this.getPublicCourseInfo();
      const userRef = doc(this.db, "users", user.uid);
      
      const newUserData = {
        isAdmin: false,
        isSuperAdmin: false,
        lastLogin: serverTimestamp(),
        classes: {
          [this.publicCourseId]: publicCourse,
        },
      };
      
      await setDoc(userRef, newUserData);
      
      return {
        uid: user.uid,
        isAdmin: false,
        isSuperAdmin: false,
        lastLogin: serverTimestamp(),
        classes: {
          [this.publicCourseId]: publicCourse,
        },
      };
    } catch (error) {
      console.error("Error creating user document:", error);
      throw new Error("Failed to create user document");
    }
  }

  async updateUserLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(this.db, "users", uid);
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

  async ensurePublicCourseAccess(uid: string, existingUserDetails: UserDetails): Promise<UserDetails> {
    try {
      // Check if user already has access to public course
      if (existingUserDetails.classes && existingUserDetails.classes[this.publicCourseId]) {
        return existingUserDetails;
      }
      
      // Add public course access
      const publicCourse = await this.getPublicCourseInfo();
      const userRef = doc(this.db, "users", uid);
      
      await updateDoc(userRef, {
        [`classes.${this.publicCourseId}`]: publicCourse,
      });
      
      return {
        ...existingUserDetails,
        classes: {
          ...(existingUserDetails.classes || {}),
          [this.publicCourseId]: publicCourse,
        },
      };
    } catch (error) {
      console.error("Error ensuring public course access:", error);
      throw new Error("Failed to ensure public course access");
    }
  }

  private async getPublicCourseInfo() {
    try {
      const publicCourseRef = doc(this.db, "courses", this.publicCourseId);
      const publicCourseDoc = await getDoc(publicCourseRef);
      
      if (!publicCourseDoc.exists()) {
        throw new Error("Public course document does not exist in the courses collection!");
      }
      
      const publicCourseData = publicCourseDoc.data();
      
      if (!publicCourseData || !publicCourseData.number || !publicCourseData.title) {
        throw new Error("Public course data is incomplete or invalid.");
      }
      
      return {
        number: publicCourseData.number,
        title: publicCourseData.title,
        isCourseAdmin: false,
      };
    } catch (error) {
      console.error("Error fetching public course info:", error);
      throw new Error("Failed to fetch public course information");
    }
  }
}

// Export singleton instance
export const userService = new FirestoreUserService(); 