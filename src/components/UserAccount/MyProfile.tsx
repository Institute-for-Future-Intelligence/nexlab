// src/components/UserAccount/MyProfile.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, Switch, FormControlLabel, Snackbar, Alert } from '@mui/material';
import { PageHeader } from '../common';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

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


  return (
    <Box 
      sx={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        padding: spacing[4],
      }}
    >
      <PageHeader 
        title="My Account"
        subtitle="Manage your account settings, course enrollments, and permissions"
      />

      {/* User Info Inside Paper Component */}
      {userDetails && (
        <Box sx={{ mb: spacing[6] }}>
          <UserDetailsBox
            userDetails={userDetails}
          />
        </Box>
      )}

      {/* Enroll in a Course Section - Hidden for educators */}
      {!userDetails?.isAdmin && (
        <Box 
          sx={{
            mb: spacing[4],
            p: spacing[4],
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.neutral[200]}`,
            boxShadow: shadows.sm,
          }}
        >
          <FormControlLabel
            control={
              <Switch 
                checked={isEnrollOpen} 
                onChange={handleToggleEnroll}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: colors.primary[600],
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: colors.primary[600],
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.secondary,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                Enroll in a Course (As a Student)
              </Typography>
            }
          />
          {isEnrollOpen && (
            <Box sx={{ mt: spacing[3] }}>
              <Typography 
                variant="body1" 
                sx={{
                  mb: spacing[3],
                  color: colors.text.secondary,
                  fontFamily: typography.fontFamily.secondary,
                }}
              >
                Use the area below to add a course access to your account.
              </Typography>
              <AddCourseForm onCourseAdded={handleCourseAdded} />
            </Box>
          )}
        </Box>
      )}

      {/* Advanced Section */}
      <Box 
        sx={{
          mb: spacing[4],
          p: spacing[4],
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.sm,
        }}
      >
        <FormControlLabel
          control={
            <Switch 
              checked={isAdvancedOpen} 
              onChange={handleToggleAdvanced}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: colors.primary[600],
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.primary[600],
                },
              }}
            />
          }
          label={
            <Typography
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              Advanced
            </Typography>
          }
        />
        {isAdvancedOpen && (
          <Box sx={{ mt: spacing[3] }}>
            <Button
              variant={userDetails?.isAdmin ? "outlined" : "contained"}
              onClick={handleNavigateToRequestPermissions}
              disabled={userDetails?.isAdmin}
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontWeight: typography.fontWeight.medium,
                borderRadius: borderRadius.md,
                textTransform: 'none',
                px: spacing[4],
                py: spacing[2],
                ...(userDetails?.isAdmin ? {
                  borderColor: colors.success[500],
                  color: colors.success[700],
                  backgroundColor: colors.success[50],
                  '&:hover': {
                    backgroundColor: colors.success[100],
                  },
                } : {
                  backgroundColor: colors.primary[600],
                  color: colors.text.inverse,
                  '&:hover': {
                    backgroundColor: colors.primary[700],
                  },
                }),
              }}
            >
              {userDetails?.isAdmin ? (
                <Typography
                  sx={{
                    fontFamily: typography.fontFamily.secondary,
                    fontWeight: typography.fontWeight.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <span>✔</span>
                  Educator Account Approved
                </Typography>
              ) : (
                'Request Educator Permissions'
              )}
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            fontFamily: typography.fontFamily.secondary,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfile;