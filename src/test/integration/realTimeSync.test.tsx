// src/test/integration/realTimeSync.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../contexts/UserContext';
import SupplementalMaterials from '../../components/Supplemental/SupplementalMaterials';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import type { UserDetails } from '../../contexts/UserContext';

// Mock services and components
vi.mock('../../services/authService');
vi.mock('../../services/userService');
vi.mock('../../config/firestore.tsx', () => ({}));
vi.mock('../../components/Supplemental/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('../../components/Supplemental/CourseSelector', () => ({
  default: ({ courses }: { courses: any[] }) => (
    <div data-testid="course-selector">
      {courses.length} courses available
      {courses.map(course => (
        <div key={course.id} data-testid={`course-${course.id}`}>
          {course.number} - {course.title}
        </div>
      ))}
    </div>
  )
}));

const mockAuthService = vi.mocked(authService);
const mockUserService = vi.mocked(userService);

describe('Real-Time Sync Integration', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com'
  };

  const initialUserDetails: UserDetails = {
    uid: 'test-user-123',
    isAdmin: false,
    isSuperAdmin: false,
    classes: {
      'course1': { number: 'CS101', title: 'Intro to Computer Science', isCourseAdmin: false },
      'course2': { number: 'BIO201', title: 'Biology Fundamentals', isCourseAdmin: true }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display courses from user details', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(initialUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(initialUserDetails);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('2 courses available');
      expect(screen.getByTestId('course-course1')).toHaveTextContent('CS101 - Intro to Computer Science');
      expect(screen.getByTestId('course-course2')).toHaveTextContent('BIO201 - Biology Fundamentals');
    });
  });

  it('should update course list in real-time when new course is added', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(initialUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(initialUserDetails);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('2 courses available');
    });

    // Simulate real-time update with new course
    const updatedUserDetails: UserDetails = {
      ...initialUserDetails,
      classes: {
        ...initialUserDetails.classes!,
        'course3': { number: 'CHEM301', title: 'Advanced Chemistry', isCourseAdmin: false }
      }
    };

    act(() => {
      realtimeCallback!(updatedUserDetails);
    });

    // Verify the course list updates in real-time
    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('3 courses available');
      expect(screen.getByTestId('course-course3')).toHaveTextContent('CHEM301 - Advanced Chemistry');
    });
  });

  it('should remove course from list when course is removed', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(initialUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(initialUserDetails);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('2 courses available');
    });

    // Simulate real-time update with course removed
    const updatedUserDetails: UserDetails = {
      ...initialUserDetails,
      classes: {
        'course1': initialUserDetails.classes!['course1']
        // course2 removed
      }
    };

    act(() => {
      realtimeCallback!(updatedUserDetails);
    });

    // Verify the course is removed from the list
    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('1 courses available');
      expect(screen.queryByTestId('course-course2')).not.toBeInTheDocument();
      expect(screen.getByTestId('course-course1')).toHaveTextContent('CS101 - Intro to Computer Science');
    });
  });

  it('should handle course title/number updates in real-time', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(initialUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(initialUserDetails);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId('course-course1')).toHaveTextContent('CS101 - Intro to Computer Science');
    });

    // Simulate real-time update with course title changed
    const updatedUserDetails: UserDetails = {
      ...initialUserDetails,
      classes: {
        ...initialUserDetails.classes!,
        'course1': { 
          number: 'CS101', 
          title: 'Introduction to Programming', // Updated title
          isCourseAdmin: false 
        }
      }
    };

    act(() => {
      realtimeCallback!(updatedUserDetails);
    });

    // Verify the course title updates
    await waitFor(() => {
      expect(screen.getByTestId('course-course1')).toHaveTextContent('CS101 - Introduction to Programming');
    });
  });

  it('should handle empty course list gracefully', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    const userWithNoCourses: UserDetails = {
      uid: 'test-user-123',
      isAdmin: false,
      isSuperAdmin: false,
      classes: {}
    };

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(userWithNoCourses);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(userWithNoCourses);
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('0 courses available');
    });

    // Add first course via real-time update
    const updatedUserDetails: UserDetails = {
      ...userWithNoCourses,
      classes: {
        'course1': { number: 'PHYS101', title: 'Physics I', isCourseAdmin: false }
      }
    };

    act(() => {
      realtimeCallback!(updatedUserDetails);
    });

    await waitFor(() => {
      expect(screen.getByTestId('course-selector')).toHaveTextContent('1 courses available');
      expect(screen.getByTestId('course-course1')).toHaveTextContent('PHYS101 - Physics I');
    });
  });

  it('should maintain subscription across multiple updates', async () => {
    let authCallback: (user: any) => void;
    let realtimeCallback: (details: UserDetails | null) => void;
    const mockUnsubscribe = vi.fn();
    const mockUserUnsubscribe = vi.fn();

    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return mockUnsubscribe;
    });

    mockUserService.getUserDetails.mockResolvedValue(initialUserDetails);
    mockUserService.updateUserLogin.mockResolvedValue();
    mockUserService.ensurePublicCourseAccess.mockResolvedValue(initialUserDetails);
    
    let subscriptionCount = 0;
    mockUserService.subscribeToUserDetails.mockImplementation((uid, callback) => {
      subscriptionCount++;
      realtimeCallback = callback;
      return mockUserUnsubscribe;
    });

    render(
      <MemoryRouter>
        <UserProvider>
          <SupplementalMaterials />
        </UserProvider>
      </MemoryRouter>
    );

    // Simulate user authentication
    await act(async () => {
      authCallback!(mockUser);
      await vi.waitFor(() => {});
    });

    // Perform multiple updates
    for (let i = 0; i < 10; i++) {
      const updatedUserDetails: UserDetails = {
        ...initialUserDetails,
        classes: {
          ...initialUserDetails.classes!,
          [`course${i + 10}`]: { 
            number: `TEST${i}`, 
            title: `Test Course ${i}`, 
            isCourseAdmin: false 
          }
        }
      };

      act(() => {
        realtimeCallback!(updatedUserDetails);
      });
    }

    // Should only create one subscription despite multiple updates
    expect(subscriptionCount).toBe(1);
    
    // Should not call unsubscribe during updates
    expect(mockUserUnsubscribe).not.toHaveBeenCalled();
  });
});
