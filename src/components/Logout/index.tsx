// Logout/index.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { authService } from '../../services/authService';

// Define the correct type for the ref prop
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Logout = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log("Logout loaded");

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleDisagree = () => {
    setOpenDialog(false);
  };
  
  const handleAgree = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await authService.signOut();
      setOpenDialog(false);
      setOpenSnackbar(true);
      setSnackbarMessage('Logged out successfully');
      navigate('/');
    } catch (error) {
      setOpenDialog(false);
      setOpenSnackbar(true);
      const errorMessage = error instanceof Error ? error.message : 'Logout failed: An unexpected error occurred';
      setSnackbarMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={handleClickOpen}
        disabled={loading}
        sx={{ 
          fontSize: '1rem',
          fontFamily: 'Staatliches, sans-serif',
          textTransform: 'none',
          minWidth: '120px',
          color: '#FBFADA',
          borderColor: '#FBFADA',
          borderRadius: '15px',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#FFFFFF',
            backgroundColor: '#ffcdd2',
            color: '#c62828',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            borderColor: '#ccc',
            color: '#999',
          },
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease-in-out',
        }}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </Button>
      <Dialog
        open={openDialog}
        onClose={handleDisagree}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Logging Out"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAgree} autoFocus disabled={loading}>
            {loading ? 'Please wait...' : 'Yes'}
          </Button>
          <Button onClick={handleDisagree} disabled={loading}>No</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(Logout);