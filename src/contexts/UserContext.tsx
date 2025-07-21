// src/contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser  } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import '../config/firestore.tsx'; // Ensure Firebase is initialized

export interface UserDetails {
  uid: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: any; // You can further specify the type for date/time if needed
  classes?: Record<string, { number: string; title: string; isCourseAdmin: boolean }>; // Use Record to define the map structure, include isCourseAdmin
}

interface UserContextType {
  user: FirebaseUser | null;
  userDetails: UserDetails | null;
  setUserDetails: Dispatch<SetStateAction<UserDetails | null>>;
  refreshUserDetails: () => Promise<void>; // Add refresh function
  loading: boolean;
  error: Error | null;
  isSuperAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  // Additional state for managing errors
  const [error, setError] = useState<Error | null>(null);

  console.log("UserContext loaded");

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      setError(null); // Reset error state on auth state change
  
      if (authUser) {
        const userRef = doc(db, "users", authUser.uid);
        const publicCourseId = import.meta.env.VITE_PUBLIC_COURSE_ID;

        if (!publicCourseId) {
          console.error("Public course ID is not defined in environment variables.");
          setLoading(false);
          return;
        }
        
        const publicCourseRef = doc(db, "courses", publicCourseId);
  
        try {
          const userDoc = await getDoc(userRef);
          const publicCourseDoc = await getDoc(publicCourseRef);
  
          if (!publicCourseDoc.exists()) {
            throw new Error("Public course document does not exist in the courses collection!");
          }
  
          const publicCourseData = publicCourseDoc.data();

          if (!publicCourseData || !publicCourseData.number || !publicCourseData.title) {
            throw new Error("Public course data is incomplete or invalid.");
          }
          
          const publicCourse = {
            number: publicCourseData.number,
            title: publicCourseData.title,
            isCourseAdmin: false,
          };
  
          if (userDoc.exists()) {
            console.log("User document exists.");
            console.log('User is signed in with UID:', authUser.uid);
            await updateDoc(userRef, { lastLogin: serverTimestamp() });
  
            // Check if "Public" course is already added
            const data = userDoc.data() as UserDetails;
            if (!data.classes || !data.classes[publicCourseId]) {
              await updateDoc(userRef, {
                [`classes.${publicCourseId}`]: publicCourse,
              });
            }
  
            setUserDetails({
              ...data, // Copy all existing fields from `data` (like isAdmin, isSuperAdmin, etc.)
              uid: authUser.uid, // Ensure the UID of the authenticated user is set
              classes: {
                ...(data.classes || {}), // Spread existing `classes` (or initialize to an empty object if `classes` is undefined)
                [publicCourseId]: publicCourse, // Add the new `Public` course with `publicCourseId` as the key
              },
            });            
            setIsSuperAdmin(data.isSuperAdmin || false);
          } else {
            console.error("User document does not exist. Creating a new one...");
            await setDoc(userRef, {
              isAdmin: false,
              isSuperAdmin: false,
              lastLogin: serverTimestamp(),
              classes: {
                [publicCourseId]: publicCourse,
              },
            });
  
            setUserDetails({
              uid: authUser.uid,
              isAdmin: false,
              classes: {
                [publicCourseId]: publicCourse,
              },
              lastLogin: serverTimestamp(),
            });
            setIsSuperAdmin(false);
          }
        } catch (e) {
          console.error("Error managing user document:", e);
          setError(e instanceof Error ? e : new Error("Failed to manage user document"));
        }
      } else {
        setUserDetails(null); // No user signed in
        setIsSuperAdmin(false);
      }
      setUser(authUser);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);  

  const refreshUserDetails = async () => {
    if (!user) return; // Ensure there's a signed-in user
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
  
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as UserDetails;
        setUserDetails({ ...data, uid: user.uid });
      } else {
        console.error("User document does not exist. Unable to refresh user details.");
      }
    } catch (error) {
      console.error("Error refreshing user details:", error);
    }
  };  

  return (
    <UserContext.Provider
      value={{
        user,
        userDetails,
        setUserDetails,
        refreshUserDetails,
        loading,
        error,
        isSuperAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;