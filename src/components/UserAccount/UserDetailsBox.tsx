import React from 'react';
import { Box, Typography, Chip, Divider, Avatar, Paper, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom'; // 👈 add this import
import { FirebaseTimestamp, formatFirebaseTimestamp } from '../../types/firebase';

interface UserDetailsBoxProps {
  userDetails: {
    uid: string;
    lastLogin?: FirebaseTimestamp;
    classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
  };
  getAccountStatus: () => string;
  renderCourses: () => JSX.Element[] | string;
}

const UserDetailsBox: React.FC<UserDetailsBoxProps> = ({ userDetails, getAccountStatus, renderCourses }) => {
  const navigate = useNavigate(); // 👈 hook for navigation

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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>{renderCourses()}</Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/update-profile')}>
          Update Profile
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/change-password')}>
          Change Password
        </Button>
      </Box>
    </Paper>
  );
};

export default UserDetailsBox;