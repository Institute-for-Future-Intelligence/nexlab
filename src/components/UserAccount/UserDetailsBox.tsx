// src/components/UserAccount/UserDetailsBox.tsx
import React from 'react';
import { Box, Typography, Divider, Avatar, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { FirebaseTimestamp } from '../../types/firebase'; // Import proper types and utilities
import { formatFirebaseTimestampFull } from '../common/TableComponents';
import { CopyableUserID, UserStatusChip, CourseHyperlink } from '../common';
import { colors, typography, spacing, borderRadius, shadows } from '../../config/designSystem';

interface UserDetailsBoxProps {
  userDetails: {
    uid: string;
    lastLogin?: FirebaseTimestamp; // Now properly typed
    classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
    isSuperAdmin?: boolean;
    isAdmin?: boolean;
  };
}

const UserDetailsBox: React.FC<UserDetailsBoxProps> = ({ userDetails }) => {
  const getUserType = (): 'superAdmin' | 'educator' | 'student' => {
    if (userDetails.isSuperAdmin) return 'superAdmin';
    if (userDetails.isAdmin) return 'educator';
    return 'student';
  };

  const getStatusType = (): 'superAdmin' | 'educator' | 'student' => {
    return getUserType();
  };

  const renderCourses = () => {
    if (!userDetails?.classes) {
      return (
        <Box 
          sx={{ 
            p: spacing[3],
            textAlign: 'center',
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: colors.text.secondary,
              fontStyle: 'italic',
              fontFamily: typography.fontFamily.secondary,
            }}
          >
            No courses enrolled
          </Typography>
        </Box>
      );
    }

    return (
      <Box 
        sx={{ 
          border: `1px solid ${colors.neutral[200]}`,
          borderRadius: borderRadius.md,
          overflow: 'hidden',
        }}
      >
        {Object.entries(userDetails.classes).map(([courseId, courseData], index) => (
          <Box 
            key={courseId} 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: spacing[3],
              backgroundColor: index % 2 === 0 ? colors.background.primary : colors.neutral[50],
              borderBottom: index < Object.keys(userDetails.classes!).length - 1 
                ? `1px solid ${colors.neutral[200]}` 
                : 'none',
              '&:hover': {
                backgroundColor: colors.primary[50],
              },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <CourseHyperlink
                courseId={courseId}
                courseNumber={courseData.number}
                courseTitle={courseData.title}
                variant="link"
                maxTitleLength={30}
              />
            </Box>
            {courseData.isCourseAdmin && (
              <Box 
                sx={{ 
                  ml: spacing[2],
                  px: spacing[2],
                  py: spacing[1],
                  backgroundColor: colors.success[100],
                  color: colors.success[700],
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  fontFamily: typography.fontFamily.secondary,
                }}
              >
                Admin
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        padding: spacing[6],
        borderRadius: borderRadius.xl,
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: shadows.lg,
        maxWidth: '600px',
        margin: 'auto',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: shadows.xl,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: spacing[4] }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: colors.primary[500],
            border: `3px solid ${colors.primary[100]}`,
            boxShadow: shadows.md,
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 48, color: colors.text.inverse }} />
        </Avatar>
      </Box>

      {/* User Details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {/* User ID */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <Typography 
            sx={{ 
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.secondary,
              color: colors.text.primary,
              minWidth: '100px',
            }}
          >
            User ID:
          </Typography>
          <CopyableUserID 
            userId={userDetails.uid} 
            userType={getUserType()}
            maxLength={999}
          />
        </Box>

        {/* Account Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <Typography 
            sx={{ 
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.secondary,
              color: colors.text.primary,
              minWidth: '100px',
            }}
          >
            Status:
          </Typography>
          <UserStatusChip 
            status={getStatusType()}
            size="medium"
          />
        </Box>

        {/* Last Login */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <Typography 
            sx={{ 
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.secondary,
              color: colors.text.primary,
              minWidth: '100px',
            }}
          >
            Last Login:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              backgroundColor: colors.neutral[100],
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.neutral[300]}`,
            }}
          >
            {formatFirebaseTimestampFull(userDetails.lastLogin)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ 
        my: spacing[4],
        borderColor: colors.neutral[200],
      }} />

      {/* Enrolled Courses */}
      <Box>
        <Typography 
          sx={{ 
            fontWeight: typography.fontWeight.semibold,
            fontFamily: typography.fontFamily.secondary,
            color: colors.text.primary,
            mb: spacing[3],
            fontSize: typography.fontSize.lg,
          }}
        >
          Enrolled Courses:
        </Typography>
        {renderCourses()}
      </Box>
    </Paper>
  );
};

export default UserDetailsBox;