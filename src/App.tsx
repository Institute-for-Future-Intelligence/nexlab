// App.tsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Use BrowserRouter for clean URLs
import { useUser } from './contexts/UserContext';

// Importing MUI components
import { ThemeProvider, CssBaseline, CircularProgress, createTheme } from '@mui/material';

// Import custom components
import DeviceVersion from './components/DeviceVersion';
import Header from './components/Header';
import Footer from './components/Dashboard/Footer';
import SelectionPage from './components/SelectionPage';
import AddMaterialForm from './components/Supplemental/AddMaterialForm';
import EditMaterialForm from './components/Supplemental/EditMaterialForm';
import ViewMaterial from './components/Supplemental/ViewMaterial';
import PrivateRoute from './components/PrivateRoute';
import AddMessage from './components/Messages/AddMessage';
import EditMessage from './components/Messages/EditMessage';
import UserManagement from './components/UserPermissions/UserManagement';
import MyProfile from './components/UserAccount/MyProfile';
import CourseManagement from './components/CourseManagement/CourseManagement';
import RequestEducatorPermissionsForm from './components/UserAccount/RequestEducatorPermissionsForm';
import EducatorRequestsAdminPage from './components/EducatorRequests/EducatorRequestsAdminPage';
import RequestNewCourseForm from './components/CourseManagement/RequestNewCourseForm';
import CourseRequestsAdminPage from './components/CourseRequests/CourseRequestsAdminPage';
import SuperAdminCourseManagement from './components/SA_CourseManagement/SuperAdminCourseManagement';

import ChatbotManagementPage from './components/Chatbot/ChatbotManagementPage';
import ChatbotRequestPage from './components/Chatbot/ChatbotRequestPage';
import ChatbotConversationsPage from './components/ChatbotConversations/ChatbotConversationsPage';

import ChatbotManager from './components/ChatbotIntegration/ChatbotManager';

import SuperAdminChatbotRequestsPage from './components/SA_Chatbot/SuperAdminChatbotRequestsPage';

// Lazy loading components
const Login = lazy(() => import('./components/Login/index'));
const Dashboard = lazy(() => import('./components/Dashboard/index'));
const SupplementalMaterials = lazy(() => import('./components/Supplemental/SupplementalMaterials'));

const App = () => {
  const { userDetails, loading, isSuperAdmin } = useUser();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {/* Using Material-UI CircularProgress component */}
        <CircularProgress />
      </div>
    );
  }

  const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  });

  console.log("App loaded")

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Conditionally render the Header based on whether the user is logged in */}
        {userDetails && <Header />}
        <div className="content">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></div>}>
            <Routes>
              <Route path="/" element={userDetails ? <SelectionPage /> : <Login />} />
              <Route path="/laboratory-notebooks" element={<PrivateRoute element={Dashboard} />} />
              <Route path="/supplemental-materials" element={<PrivateRoute element={SupplementalMaterials} />} />
              <Route path="/my-profile" element={<PrivateRoute element={MyProfile} />} />
              <Route path="/add-material" element={<PrivateRoute element={AddMaterialForm} />} />
              <Route path="/edit-material/:id" element={<PrivateRoute element={EditMaterialForm} />} />
              <Route path="/view-material/:id" element={<PrivateRoute element={ViewMaterial} />} />
              <Route path="/add-message" element={<PrivateRoute element={AddMessage} />} />
              <Route path="/edit-message/:id" element={<PrivateRoute element={EditMessage} />} />
              {isSuperAdmin && <Route path="/user-management" element={<PrivateRoute element={UserManagement} />} />}
              <Route path="/chatbot-management" element={<PrivateRoute element={ChatbotManagementPage} />} />
              <Route path="/course-management" element={<PrivateRoute element={CourseManagement} />} />
              <Route path="/request-chatbot" element={<PrivateRoute element={ChatbotRequestPage} />} />
              <Route path="/request-educator-permissions" element={<PrivateRoute element={RequestEducatorPermissionsForm} />} />
              <Route path="/educator-requests" element={<PrivateRoute element={EducatorRequestsAdminPage} />} />
              <Route path="/request-new-course" element={<RequestNewCourseForm />} />
              <Route path="/course-requests" element={<CourseRequestsAdminPage />} />
              <Route path="/super-admin-course-management" element={<SuperAdminCourseManagement />} />
              <Route path="/super-admin-chatbot-requests" element={<PrivateRoute element={SuperAdminChatbotRequestsPage} />} />
              {isSuperAdmin && <Route path="/chatbot-conversations" element={<PrivateRoute element={ChatbotConversationsPage} />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
        <DeviceVersion />
        {/* Chatbot Manager */}
        {userDetails && <ChatbotManager />}
      </Router>
    </ThemeProvider>
  );
};

export default App;