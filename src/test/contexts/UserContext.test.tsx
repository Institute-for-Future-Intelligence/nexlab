// src/test/contexts/UserContext.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import UserProvider, { UserContext } from '../../contexts/UserContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { useContext } from 'react';
import type { UserDetails } from '../../contexts/UserContext';

// Mock services
vi.mock('../../services/authService');
vi.mock('../../services/userService');
vi.mock('../../config/firestore.tsx', () => ({}));

const mockAuthService = vi.mocked(authService);
const mockUserService = vi.mocked(userService);

// Test component to access context
const TestComponent = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('UserContext not found');
  
  const { user, userDetails, loading, error, isSuperAdmin } = context;
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.uid : 'no-user'}</div>
      <div data-testid="user-details">{userDetails ? JSON.stringify(userDetails) : 'no-details'}</div>
      <div data-testid="is-super-admin">{isSuperAdmin ? 'true' : 'false'}</div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
    </div>
  );
};

describe('UserContext', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com'
  };

  const mockUserDetails: UserDetails = {
    uid: 'test-user-123',
    isAdmin: false,
    isSuperAdmin: false,
    classes: {
      'course1': { number: 'CS101', title: 'Intro to CS', isCourseAdmin: false },
      'course2': { number: 'BIO201', title: 'Biology', isCourseAdmin: true }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial loading state', () => {
    mockAuthService.onAuthStateChanged.mockImplementation(() => vi.fn());

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('user-details')).toHaveTextContent('no-details');
    expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('should handle successful user authentication', async () => {
    let authCallback: (user: any) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(mockUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(mockUserDetails);
    mockUserService.subscribeToUserDetails.mockReturnValue(mockUserUnsubscribe);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Simulate user sign in
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test-user-123');
    expect(screen.getByTestId('user-details')).toHaveTextContent(JSON.stringify(mockUserDetails));
    expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');

    expect(mockUserService.getUserDetails).toHaveBeenCalledWith('test-user-123');
    expect(mockUserService.updateUserLogin).toHaveBeenCalledWith('test-user-123');
    expect(mockUserService.subscribeToUserDetails).toHaveBeenCalledWith(
      'test-user-123',
      expect.any(Function)
    );
  });

  it('should handle real-time user details updates', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(mockUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(mockUserDetails);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Simulate user sign in
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Simulate real-time update with new course
    const updatedUserDetails = {
      ...mockUserDetails,
      classes: {
        ...mockUserDetails.classes!,
        'course3': { number: 'CHEM301', title: 'Chemistry', isCourseAdmin: false }
      }
    };

    act(() => {
      realtimeCallback!(updatedUserDetails);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details')).toHaveTextContent(JSON.stringify(updatedUserDetails));
    });
  });

  it('should handle super admin user', async () => {
    let authCallback: (user: any) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    const superAdminDetails = {
      ...mockUserDetails,
      isSuperAdmin: true
    };

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(superAdminDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(superAdminDetails);
    mockUserService.subscribeToUserDetails.mockReturnValue(mockUserUnsubscribe);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('true');
    });
  });

  it('should handle user sign out', async () => {
    let authCallback: (user: any) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(mockUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(mockUserDetails);
    mockUserService.subscribeToUserDetails.mockReturnValue(mockUserUnsubscribe);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Sign in first
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test-user-123');
    });

    // Sign out
    await act(async () => {
      authCallback!(null);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-details')).toHaveTextContent('no-details');
      expect(screen.getByTestId('is-super-admin')).toHaveTextContent('false');
    });
  });

  it('should handle authentication errors', async () => {
    let authCallback: (user: any) => void;
    const mockUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockRejectedValue(new Error('Firebase error'));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Firebase error');
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });
  });

  it('should create new user document when none exists', async () => {
    let authCallback: (user: any) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(null);
    mockUserService.createUserDocument.mockResolvedValue(mockUserDetails);
    mockUserService.subscribeToUserDetails.mockReturnValue(mockUserUnsubscribe);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-details')).toHaveTextContent(JSON.stringify(mockUserDetails));
    });

    expect(mockUserService.createUserDocument).toHaveBeenCalledWith(mockUser);
  });

  it('should properly cleanup subscriptions on unmount', () => {
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockReturnValue(mockUnsubscribe);
    mockUserService.subscribeToUserDetails.mockReturnValue(mockUserUnsubscribe);

    const { unmount } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should prevent infinite loops with proper subscription management', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(mockUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(mockUserDetails);
    
    let subscriptionCallCount = 0;
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      subscriptionCallCount++;
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Simulate user sign in
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    // Trigger multiple real-time updates
    for (let i = 0; i < 5; i++) {
      act(() => {
        realtimeCallback!(mockUserDetails);
      });
    }

    // Should only create one subscription
    expect(subscriptionCallCount).toBe(1);
  });
});
