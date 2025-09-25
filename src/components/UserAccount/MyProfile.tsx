// src/components/UserAccount/MyProfile.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, Switch, FormControlLabel, Snackbar, Alert, Chip } from '@mui/material';
import { PageHeader } from '../common';

import { useUser } from '../../hooks/useUser';
import { UserDetails } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import AddCourseForm from './AddCourseForm';

import UserDetailsBox from './UserDetailsBox';

const MyProfile: React.FC = () => {
  const { userDetails, setUserDetails } = useUser();
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  const navigate = useNavigate();
  const db = getFirestore();

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateToRequestPermissions = () => {
    // Navigate to request permissions only if the user is not an admin
    if (!userDetails?.isAdmin) {
      navigate('/request-educator-permissions');
    }
  };

  const handleCourseAdded = (message: string, severity: 'success' | 'error' | 'info') => {
    // Action 1: Show a confirmation message or modal (using Snackbar component)
    setOpenSnackbar(true);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);

    if (severity === 'success' && userDetails) {
      const fetchUpdatedUserDetails = async () => {
        const userDoc = doc(db, 'users', userDetails.uid);
        const updatedUserDoc = await getDoc(userDoc);
        if (updatedUserDoc.exists()) {
          const updatedUserData = updatedUserDoc.data() as UserDetails;
          setUserDetails({ ...updatedUserData, uid: userDetails.uid });
        }
      };

      fetchUpdatedUserDetails();
    }
  };

  const handleToggleEnroll = () => {
    setIsEnrollOpen(!isEnrollOpen);
  };

  const handleToggleAdvanced = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  const getAccountStatus = () => {
    if (userDetails?.isSuperAdmin) return 'Super Admin';
    if (userDetails?.isAdmin) return 'Educator';
    return 'Student';
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderCourses = () => {
    if (!userDetails?.classes) return 'None';

    return Object.entries(userDetails.classes).map(([courseId, courseData]) => (
      <Chip
        key={courseId}
        label={`${courseData.number} - ${courseData.title}${courseData.isCourseAdmin ? ' (Admin)' : ''}`}
        variant="outlined"
        sx={{
          margin: '4px', // Add spacing between chips
          fontSize: '14px',
          fontWeight: 'bold',
          bgcolor: courseData.isCourseAdmin ? '#FFCDD2' : '#E3F2FD', // Lighter red for admin courses
          color: courseData.isCourseAdmin ? '#C62828' : '#1565C0', // Darker red for text
        }}
      />
    ));
  };

  return (
    <Box className="profile-container">
      <PageHeader 
        title="My Account"
        subtitle="Manage your account settings, course enrollments, and permissions"
      />

      {/* User Info Inside Paper Component */}
      {userDetails && (
        <UserDetailsBox
          userDetails={userDetails}
          getAccountStatus={getAccountStatus}
          renderCourses={renderCourses}
        />
      )}

      {/* Enroll in a Course Section - Hidden for educators */}
      {!userDetails?.isAdmin && (
        <Box className="profile-switch-container">
          <FormControlLabel
            control={<Switch checked={isEnrollOpen} onChange={handleToggleEnroll} />}
            label="Enroll in a Course (As a Student)"
          />
          {isEnrollOpen && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" className="profile-text">
                Use the area below to add a course access to your account.
              </Typography>
              <AddCourseForm onCourseAdded={handleCourseAdded} />
            </Box>
          )}
        </Box>
      )}

      {/* Advanced Section */}
      <Box className="profile-advanced-section">
        <FormControlLabel
          control={<Switch checked={isAdvancedOpen} onChange={handleToggleAdvanced} />}
          label="Advanced"
        />
        {isAdvancedOpen && (
          <>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={handleNavigateToRequestPermissions}
                disabled={userDetails?.isAdmin}
                className="profile-button"
              >
                {userDetails?.isAdmin ? (
                  <Typography>
                    <span className="success-text">✔ Educator Account Approved</span>
                  </Typography>
                ) : (
                  'Request Educator Permissions'
                )}
              </Button>
            </Box>
          </>
        )}
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfile;