// src/components/UserAccount/UserDetailsBox.tsx
import React from 'react';
import { Box, Typography, Chip, Divider, Avatar, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { FirebaseTimestamp, formatFirebaseTimestamp } from '../../types/firebase'; // Import proper types and utilities

interface UserDetailsBoxProps {
  userDetails: {
    uid: string;
    lastLogin?: FirebaseTimestamp; // Now properly typed
    classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
  };
  getAccountStatus: () => string;
  renderCourses: () => React.ReactElement[] | string;
}

const UserDetailsBox: React.FC<UserDetailsBoxProps> = ({ userDetails, getAccountStatus, renderCourses }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        maxWidth: '500px',
        margin: 'auto',
      }}
    >
      {/* Avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: '#1054c4' }}>
          <AccountCircleIcon sx={{ fontSize: 48, color: '#f8f4fc' }} />
        </Avatar>
      </Box>

      {/* User Details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'left' }}>
        {/* User ID */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>User ID:</Typography>
          <Chip
            label={userDetails.uid}
            variant="outlined"
            sx={{
              fontSize: '14px',
              fontWeight: 'bold',
              bgcolor: '#E3F2FD',
              color: '#1565C0',
            }}
          />
        </Box>

        {/* Account Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Account Status:</Typography>
          <Chip
            label={getAccountStatus()}
            variant="outlined"
            sx={{
              fontSize: '14px',
              fontWeight: 'bold',
              bgcolor: '#C8E6C9',
              color: '#2E7D32',
            }}
          />
        </Box>

        {/* Last Login */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Last Login:</Typography>
          <Chip
            label={formatFirebaseTimestamp(userDetails.lastLogin)}
            variant="outlined"
            sx={{
              fontSize: '14px',
              fontWeight: 'bold',
              bgcolor: '#FFF3E0',
              color: '#EF6C00',
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Current Courses */}
      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Current Courses:</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>{renderCourses()}</Box>
    </Paper>
  );
};

export default UserDetailsBox;