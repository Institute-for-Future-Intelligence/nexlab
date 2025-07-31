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
    try {
      // Set persistence based on user preference
      const persistence = keepSignedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(this.auth!, persistence);
      
      // Sign in with popup
      const result = await signInWithPopup(this.auth!, this.googleProvider!);
      
      if (!result.user) {
        throw new Error('No user returned from authentication');
      }
      
      return result.user;
    } catch (error: any) {
      // Transform Firebase errors into user-friendly messages
      const errorMessage = this.getErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    this.initialize();
    try {
      await signOut(this.auth!);
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
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