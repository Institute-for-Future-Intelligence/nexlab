// src/test/services/userService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService } from '../../services/userService';
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { UserDetails } from '../../contexts/UserContext';

// Mock Firebase functions
vi.mock('firebase/firestore');

const mockGetFirestore = vi.mocked(getFirestore);
const mockDoc = vi.mocked(doc);
const mockGetDoc = vi.mocked(getDoc);
const mockOnSnapshot = vi.mocked(onSnapshot);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockServerTimestamp = vi.mocked(serverTimestamp);

describe('UserService', () => {
  const mockDb = { _type: 'firestore' };
  const testUid = 'test-user-123';
  const mockUserDetails: UserDetails = {
    uid: testUid,
    isAdmin: false,
    isSuperAdmin: false,
    classes: {
      'course1': { number: 'CS101', title: 'Intro to CS', isCourseAdmin: false },
      'course2': { number: 'BIO201', title: 'Biology', isCourseAdmin: true }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFirestore.mockReturnValue(mockDb as any);
    mockServerTimestamp.mockReturnValue({ _type: 'serverTimestamp', seconds: Date.now() / 1000 } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserDetails', () => {
    it('should fetch user details successfully', async () => {
      const mockDocRef = { _type: 'docRef' };
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ ...mockUserDetails, uid: undefined }) // Firestore doesn't store uid in data
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await userService.getUserDetails(testUid);

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', testUid);
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual(mockUserDetails);
    });

    it('should return null when user document does not exist', async () => {
      const mockDocRef = { _type: 'docRef' };
      const mockDocSnap = {
        exists: () => false,
        data: () => null
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await userService.getUserDetails(testUid);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockDocRef = { _type: 'docRef' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(userService.getUserDetails(testUid)).rejects.toThrow('Failed to fetch user details');
    });
  });

  describe('subscribeToUserDetails', () => {
    it('should set up real-time subscription successfully', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockDocRef = { _type: 'docRef' };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);

      const unsubscribe = userService.subscribeToUserDetails(testUid, mockCallback);

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', testUid);
      expect(mockOnSnapshot).toHaveBeenCalledWith(
        mockDocRef,
        expect.any(Function),
        expect.any(Function)
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with user details when document exists', () => {
      const mockCallback = vi.fn();
      const mockDocRef = { _type: 'docRef' };
      let snapshotCallback: (snapshot: any) => void;

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockImplementation((ref, onNext, onError) => {
        snapshotCallback = onNext as any;
        return vi.fn();
      });

      userService.subscribeToUserDetails(testUid, mockCallback);

      // Simulate document snapshot
      const mockSnapshot = {
        exists: () => true,
        data: () => ({ ...mockUserDetails, uid: undefined })
      };

      snapshotCallback!(mockSnapshot);

      expect(mockCallback).toHaveBeenCalledWith(mockUserDetails);
    });

    it('should call callback with null when document does not exist', () => {
      const mockCallback = vi.fn();
      const mockDocRef = { _type: 'docRef' };
      let snapshotCallback: (snapshot: any) => void;

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockImplementation((ref, onNext, onError) => {
        snapshotCallback = onNext as any;
        return vi.fn();
      });

      userService.subscribeToUserDetails(testUid, mockCallback);

      // Simulate non-existent document
      const mockSnapshot = {
        exists: () => false,
        data: () => null
      };

      snapshotCallback!(mockSnapshot);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });

    it('should handle subscription errors', () => {
      const mockCallback = vi.fn();
      const mockDocRef = { _type: 'docRef' };
      let errorCallback: (error: any) => void;

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockImplementation((ref, onNext, onError) => {
        errorCallback = onError as any;
        return vi.fn();
      });

      userService.subscribeToUserDetails(testUid, mockCallback);

      // Simulate error
      const mockError = new Error('Subscription error');
      errorCallback!(mockError);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('updateUserLogin', () => {
    it('should update user login timestamp', async () => {
      const mockDocRef = { _type: 'docRef' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await userService.updateUserLogin(testUid);

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', testUid);
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, {
        lastLogin: expect.any(Object) // serverTimestamp
      });
    });

    it('should handle update errors', async () => {
      const mockDocRef = { _type: 'docRef' };
      mockDoc.mockReturnValue(mockDocRef as any);
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(userService.updateUserLogin(testUid)).rejects.toThrow('Failed to update user login');
    });
  });

  describe('refreshUserDetails', () => {
    it('should call getUserDetails', async () => {
      const mockDocRef = { _type: 'docRef' };
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ ...mockUserDetails, uid: undefined })
      };

      mockDoc.mockReturnValue(mockDocRef as any);
      mockGetDoc.mockResolvedValue(mockDocSnap as any);

      const result = await userService.refreshUserDetails(testUid);

      expect(result).toEqual(mockUserDetails);
      expect(mockGetDoc).toHaveBeenCalled();
    });
  });

  describe('Real-time sync integration', () => {
    it('should trigger callback when user classes are updated', () => {
      const mockCallback = vi.fn();
      const mockDocRef = { _type: 'docRef' };
      let snapshotCallback: (snapshot: any) => void;

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockImplementation((ref, onNext, onError) => {
        snapshotCallback = onNext as any;
        return vi.fn();
      });

      userService.subscribeToUserDetails(testUid, mockCallback);

      // Initial state
      const initialSnapshot = {
        exists: () => true,
        data: () => ({ ...mockUserDetails, uid: undefined })
      };
      snapshotCallback!(initialSnapshot);

      // Updated state with new course
      const updatedUserDetails = {
        ...mockUserDetails,
        classes: {
          ...mockUserDetails.classes!,
          'course3': { number: 'CHEM301', title: 'Chemistry', isCourseAdmin: false }
        }
      };

      const updatedSnapshot = {
        exists: () => true,
        data: () => ({ ...updatedUserDetails, uid: undefined })
      };
      snapshotCallback!(updatedSnapshot);

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenLastCalledWith(updatedUserDetails);
    });

    it('should handle multiple rapid updates without issues', () => {
      const mockCallback = vi.fn();
      const mockDocRef = { _type: 'docRef' };
      let snapshotCallback: (snapshot: any) => void;

      mockDoc.mockReturnValue(mockDocRef as any);
      mockOnSnapshot.mockImplementation((ref, onNext, onError) => {
        snapshotCallback = onNext as any;
        return vi.fn();
      });

      userService.subscribeToUserDetails(testUid, mockCallback);

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const snapshot = {
          exists: () => true,
          data: () => ({ 
            ...mockUserDetails, 
            uid: undefined,
            lastLogin: { seconds: Date.now() / 1000 + i }
          })
        };
        snapshotCallback!(snapshot);
      }

      expect(mockCallback).toHaveBeenCalledTimes(10);
    });
  });
});
