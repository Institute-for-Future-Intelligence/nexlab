import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import Logout from './Logout';

const Header: React.FC = React.memo(() => {
  const { userDetails, isSuperAdmin } = useUser();
  const [copied, setCopied] = React.useState(false);

  const handleCopyUserId = () => {
    if (userDetails?.uid) {
      navigator.clipboard.writeText(userDetails.uid)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
        .catch(err => console.error('Could not copy text: ', err));
    } else {
      console.error('User details are null or undefined');
    }
  };

  return (
    <Box className="header-box" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#CDDAFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={`${import.meta.env.BASE_URL}nexlab-logo.png`} alt="ATE Logo" style={{ width: 300 }}/>
        <Box className="divider" sx={{ height: '40px', borderLeft: '2px solid #0B53C0', marginRight: '20px' }} />
        <Typography variant="body1" component="p" className="subtitle" sx={{ color: '#0B53C0', fontFamily: 'Gabarito', maxWidth: '300px' }}>
          Next-Generation Experiments and <br />
          Learning for Advanced Biotech
        </Typography>
      </Box>
      <Box className="user-info-box" sx={{ display: 'flex', alignItems: 'center' }}>
        {isSuperAdmin && (
          <Chip 
            label="Super-Admin" 
            variant="outlined" 
            sx={{ borderRadius: '15px', fontWeight: 'bold', background: '#ffcdd2', color: '#c62828', mr: 2, fontFamily: 'Staatliches, sans-serif', fontSize: '20px' }} 
          />
        )}
        {userDetails?.isAdmin && !isSuperAdmin && (
          <Chip 
            label="Educator" 
            variant="outlined" 
            sx={{ borderRadius: '15px', fontWeight: 'bold', background: '#ffcdd2', color: '#c62828', mr: 2, fontFamily: 'Staatliches, sans-serif', fontSize: '20px' }} 
          />
        )}
        {!userDetails?.isAdmin && (
          <Chip 
            label="Student" 
            variant="outlined" 
            sx={{ borderRadius: '15px', fontWeight: 'bold', background: '#bbdefb', color: '#1e88e5', mr: 2, fontFamily: 'Staatliches, sans-serif', fontSize: '20px' }} 
          />
        )}
        {userDetails && (
          <Tooltip title={copied ? "Copied!" : "Click to Copy"} enterDelay={300} leaveDelay={200}>
            <Chip
              label={`User ID: ${userDetails.uid}`}
              variant="outlined"
              onClick={handleCopyUserId}
              sx={{
                borderRadius: '15px',
                fontSize: '20px',
                fontWeight: 'bold',
                background: '#e0f2f1',
                color: '#00695c',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                mr: 2,
                fontFamily: 'Staatliches, sans-serif',
              }}
            />
          </Tooltip>
        )}
        <Logout />
      </Box>
    </Box>
  );
});

Header.displayName = 'Header';

export default Header;