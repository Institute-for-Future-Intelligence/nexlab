import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { handleAsyncError } from '../utils/errorHandling';

export interface AuthService {
  signInWithGoogle: (keepSignedIn: boolean) => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => () => void;
  getCurrentUser: () => FirebaseUser | null;
}

class FirebaseAuthService implements AuthService {
  private auth: Auth | null = null;
  private googleProvider: GoogleAuthProvider | null = null;

  private initialize() {
    if (!this.auth) {
      // Import Firebase config to ensure initialization
      import('../config/firestore');
      this.auth = getAuth();
      this.googleProvider = new GoogleAuthProvider();
    }
  }

  async signInWithGoogle(keepSignedIn: boolean = true): Promise<FirebaseUser> {
    this.initialize();
    
    const result = await handleAsyncError(async () => {
      // Set persistence based on user preference
      const persistence = keepSignedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(this.auth!, persistence);
      
      // Configure Google provider - only force account selection if needed
      // Don't use prompt: 'select_account' as it can cause issues with single-account scenarios
      this.googleProvider!.setCustomParameters({
        // prompt: 'select_account' // Removed - causes issues when only one account is logged in
      });
      
      // Sign in with popup
      const authResult = await signInWithPopup(this.auth!, this.googleProvider!);
      
      if (!authResult.user) {
        throw new Error('No user returned from authentication');
      }
      
      return authResult.user;
    }, { operation: 'google_sign_in', keepSignedIn });

    if (result.error) {
      // Provide more specific error messages
      const errorCode = (result.error.originalError as any)?.code;
      console.error('Google Auth Error:', {
        code: errorCode,
        message: result.error.message,
        originalError: result.error.originalError
      });
      
      if (errorCode === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again and complete the sign-in process. If you only have one Google account logged in, try logging out and back in to your Google account.');
      } else if (errorCode === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (errorCode === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email address. Please use a different sign-in method.');
      }
      throw result.error;
    }
    
    return result.data!;
  }

  async signOut(): Promise<void> {
    this.initialize();
    
    const result = await handleAsyncError(async () => {
      await signOut(this.auth!);
    }, { operation: 'sign_out' });

    if (result.error) {
      throw result.error;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    this.initialize();
    return onAuthStateChanged(this.auth!, callback);
  }

  getCurrentUser(): FirebaseUser | null {
    this.initialize();
    return this.auth!.currentUser;
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/network-request-failed': 'Login Failed: Network error, please check your connection.',
      'auth/popup-closed-by-user': 'Login Failed: The sign-in popup was closed before completion.',
      'auth/cancelled-popup-request': 'Login Failed: Another sign-in request was made before the first one was completed.',
      'auth/popup-blocked': 'Login Failed: The sign-in popup was blocked by the browser. Please allow popups for this site.',
      'auth/user-disabled': 'Login Failed: This account has been disabled.',
      'auth/user-not-found': 'Login Failed: No account found with this email.',
      'auth/wrong-password': 'Login Failed: Incorrect password.',
      'auth/too-many-requests': 'Login Failed: Too many failed attempts. Please try again later.',
    };

    return errorMessages[errorCode] || 'Login Failed: An unexpected error occurred.';
  }
}

// Export singleton instance
export const authService = new FirebaseAuthService();

// Export types
export type { FirebaseUser }; 