// src/contexts/UserContext.tsx
import { createContext, useState, useEffect, useRef, ReactNode, Dispatch, SetStateAction } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseTimestamp } from '../types/firebase';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import '../config/firestore.tsx'; // Ensure Firebase is initialized

export interface UserDetails {
  uid: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  lastLogin?: FirebaseTimestamp;
  classes?: Record<string, { 
    number: string; 
    title: string; 
    isCourseAdmin: boolean;
    createdAt?: Date | FirebaseTimestamp;
  }>;
}

export interface UserContextType {
  user: FirebaseUser | null;
  userDetails: UserDetails | null;
  setUserDetails: Dispatch<SetStateAction<UserDetails | null>>;
  refreshUserDetails: () => Promise<void>;
  loading: boolean;
  error: Error | null;
  isSuperAdmin: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const userDetailsUnsubscribeRef = useRef<(() => void) | null>(null);



  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      setError(null);

      // Clean up previous user details subscription
      if (userDetailsUnsubscribeRef.current) {
        userDetailsUnsubscribeRef.current();
        userDetailsUnsubscribeRef.current = null;
      }

      try {
        if (authUser) {
          console.log('User is signed in with UID:', authUser.uid);
          
          // Try to get existing user details
          let details = await userService.getUserDetails(authUser.uid);
          
          if (details) {
            // Update last login for existing user
            await userService.updateUserLogin(authUser.uid);
            // Ensure user has access to public course
            details = await userService.ensurePublicCourseAccess(authUser.uid, details);
          } else {
            // Create new user document
            console.log("User document does not exist. Creating a new one...");
            details = await userService.createUserDocument(authUser);
          }
          
          // Set initial user details
          setUserDetails(details);
          setIsSuperAdmin(details.isSuperAdmin || false);

          // Set up real-time subscription for user details updates
          const userDetailsUnsub = userService.subscribeToUserDetails(authUser.uid, (updatedDetails) => {
            console.log('[UserContext] User details updated in real-time:', {
              uid: updatedDetails?.uid,
              classesCount: updatedDetails?.classes ? Object.keys(updatedDetails.classes).length : 0,
              classes: updatedDetails?.classes ? Object.keys(updatedDetails.classes) : [],
              timestamp: new Date().toISOString()
            });
            if (updatedDetails) {
              setUserDetails(updatedDetails);
              setIsSuperAdmin(updatedDetails.isSuperAdmin || false);
            }
          });
          userDetailsUnsubscribeRef.current = userDetailsUnsub;
          
        } else {
          // User signed out
          setUserDetails(null);
          setIsSuperAdmin(false);
        }
        
        setUser(authUser);
      } catch (err) {
        console.error("Error managing user authentication:", err);
        setError(err instanceof Error ? err : new Error("Failed to manage user authentication"));
        // Reset user state on error
        setUser(null);
        setUserDetails(null);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDetailsUnsubscribeRef.current) {
        userDetailsUnsubscribeRef.current();
        userDetailsUnsubscribeRef.current = null;
      }
    };
  }, []); // Remove userDetailsUnsubscribe from dependency array

  const refreshUserDetails = async () => {
    if (!user) {
      console.warn('No user signed in, cannot refresh user details');
      return;
    }

    try {
      const details = await userService.refreshUserDetails(user.uid);
      if (details) {
        setUserDetails(details);
        setIsSuperAdmin(details.isSuperAdmin || false);
      } else {
        console.error("User document does not exist. Unable to refresh user details.");
        setError(new Error("User document not found"));
      }
    } catch (error) {
      console.error("Error refreshing user details:", error);
      setError(error instanceof Error ? error : new Error("Failed to refresh user details"));
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