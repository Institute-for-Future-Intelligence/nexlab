import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';

// Lazy loading components
const Login = lazy(() => import('../components/Login/index'));
const Dashboard = lazy(() => import('../components/Dashboard/index'));
const SupplementalMaterials = lazy(() => import('../components/Supplemental/SupplementalMaterials'));
const MessagesPage = lazy(() => import('../components/Messages/MessagesPage'));

// Direct imports for smaller components
import SelectionPage from '../components/SelectionPage';
import AddMaterialForm from '../components/Supplemental/AddMaterialFormModern';
import EditMaterialForm from '../components/Supplemental/EditMaterialForm';
import ViewMaterial from '../components/Supplemental/ViewMaterialModern';
import AddMessage from '../components/Messages/AddMessage';
import EditMessage from '../components/Messages/EditMessage';

// Wrapper for protected routes with error boundaries
interface ProtectedRouteProps {
  element: React.ComponentType;
}

// eslint-disable-next-line react/prop-types
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element: Component }) => (
  <RouteErrorBoundary>
    <PrivateRoute element={Component} />
  </RouteErrorBoundary>
);

// Wrapper for public routes with error boundaries  
interface PublicRouteProps {
  element: React.ReactElement;
}

// eslint-disable-next-line react/prop-types
const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => (
  <ErrorBoundary>
    {element}
  </ErrorBoundary>
);
import UserManagement from '../components/UserPermissions/UserManagement';
import MyProfile from '../components/UserAccount/MyProfile';
import CourseManagement from '../components/CourseManagement/CourseManagement';
import RequestEducatorPermissionsForm from '../components/UserAccount/RequestEducatorPermissionsForm';
import EducatorRequestsAdminPage from '../components/EducatorRequests/EducatorRequestsAdminPage';
import RequestNewCourseForm from '../components/CourseManagement/RequestNewCourseForm';
import CourseRequestsAdminPage from '../components/CourseRequests/CourseRequestsAdminPage';
import SuperAdminCourseManagement from '../components/SA_CourseManagement/SuperAdminCourseManagement';
import ChatbotManagementPage from '../components/Chatbot/ChatbotManagementPage';
import ChatbotRequestPage from '../components/Chatbot/ChatbotRequestPage';
import ChatbotConversationsPage from '../components/ChatbotConversations/ChatbotConversationsPage';
import SuperAdminChatbotRequestsPage from '../components/SA_Chatbot/SuperAdminChatbotRequestsPage';
import QuizManagementPage from '../components/Quiz/QuizManagementPage';

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  requiresAuth?: boolean;
  requiresSuperAdmin?: boolean;
}

export const createRoutes = (userDetails: any, isSuperAdmin: boolean): RouteObject[] => [
  {
    path: "/",
    element: userDetails ? (
      <RouteErrorBoundary>
        <SelectionPage />
      </RouteErrorBoundary>
    ) : (
      <PublicRoute element={<Login />} />
    )
  },
  {
    path: "/messages",
    element: <ProtectedRoute element={MessagesPage} />
  },
  {
    path: "/laboratory-notebooks",
    element: <ProtectedRoute element={Dashboard} />
  },
  {
    path: "/supplemental-materials",
    element: <ProtectedRoute element={SupplementalMaterials} />
  },
  {
    path: "/my-profile",
    element: <ProtectedRoute element={MyProfile} />
  },
  {
    path: "/add-material",
    element: <PrivateRoute element={AddMaterialForm} />
  },
  {
    path: "/edit-material/:id",
    element: <PrivateRoute element={EditMaterialForm} />
  },
  {
    path: "/view-material/:id",
    element: <PrivateRoute element={ViewMaterial} />
  },
  {
    path: "/add-message",
    element: <PrivateRoute element={AddMessage} />
  },
  {
    path: "/edit-message/:id",
    element: <PrivateRoute element={EditMessage} />
  },
  {
    path: "/chatbot-management",
    element: <PrivateRoute element={ChatbotManagementPage} />
  },
  {
    path: "/course-management",
    element: <PrivateRoute element={CourseManagement} />
  },
  {
    path: "/request-chatbot",
    element: <PrivateRoute element={ChatbotRequestPage} />
  },
  {
    path: "/quiz-management",
    element: <PrivateRoute element={QuizManagementPage} />
  },
  {
    path: "/request-educator-permissions",
    element: <PrivateRoute element={RequestEducatorPermissionsForm} />
  },
  {
    path: "/educator-requests",
    element: <PrivateRoute element={EducatorRequestsAdminPage} />
  },
  {
    path: "/request-new-course",
    element: <RequestNewCourseForm />
  },
  {
    path: "/course-requests",
    element: <CourseRequestsAdminPage />
  },
  {
    path: "/super-admin-course-management",
    element: <SuperAdminCourseManagement />
  },
  {
    path: "/super-admin-chatbot-requests",
    element: <PrivateRoute element={SuperAdminChatbotRequestsPage} />
  },
  // Conditional routes based on user roles
  ...(isSuperAdmin ? [
    {
      path: "/user-management",
      element: <PrivateRoute element={UserManagement} />
    },
    {
      path: "/chatbot-conversations",
      element: <PrivateRoute element={ChatbotConversationsPage} />
    }
  ] : []),
  {
    path: "*",
    element: <Navigate to="/" />
  }
];

// Route groups for better organization
export const routeGroups = {
  public: ['/request-new-course', '/course-requests', '/super-admin-course-management'],
  authenticated: ['/laboratory-notebooks', '/supplemental-materials', '/my-profile'],
  materials: ['/add-material', '/edit-material/:id', '/view-material/:id'],
  messages: ['/add-message', '/edit-message/:id'],
  educator: ['/chatbot-management', '/course-management', '/request-chatbot', '/request-educator-permissions', '/educator-requests'],
  superAdmin: ['/user-management', '/chatbot-conversations', '/super-admin-chatbot-requests', '/quiz-management']
}; 