// Login/index.tsx
import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { Button, Typography, Container, Box, Snackbar, Alert, TextField, Checkbox, FormControlLabel, Tooltip,  Divider, Grid } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Login = () => {
  const auth = getAuth();

  console.log("Login loaded")

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'info' | 'success' | 'warning'>('success');

  const [passcode, setPasscode] = useState('');
  const [isPasscodeValid, setIsPasscodeValid] = useState(false);

  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const VALID_PASSCODE = import.meta.env.VITE_VALID_PASSCODE;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const validatePasscode = (input: string): void => {
    if (input === VALID_PASSCODE) {
      setIsPasscodeValid(true);
      setSnackbarMessage("Passcode Entered Correctly.");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } else {
      setSnackbarMessage("Invalid passcode. Please try again.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Set persistence based on the checkbox state
      await setPersistence(auth, keepSignedIn ? browserLocalPersistence : browserSessionPersistence);
      
      // Proceed with Google sign-in
      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);
      setSnackbarMessage('Successfully logged in with Google!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error: any) {
      let errorMessage = 'Login Failed: An unexpected error occurred.';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch (error.code) {
          case 'auth/network-request-failed':
            errorMessage = 'Login Failed: Network error, please check your connection.';
            break;
          case 'auth/popup-closed-by-user':
            errorMessage = 'Login Failed: The sign-in popup was closed before completion.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Login Failed: Another sign-in request was made before the first one was completed.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Login Failed: The sign-in popup was blocked by the browser. Please allow popups for this site.';
            break;
        }
      }
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={isMobile ? 2 : 4} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          <img src={`${import.meta.env.VITE_DEPLOY_ENV === 'github' ? '/ate-micr/' : '/'}ate-logo.png`} alt="ATE Logo" style={{ width: 150, marginBottom: 20 }} />
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" gutterBottom>
            ATE 2.0: MICR 230
          </Typography>
        </Grid>
        {!isMobile && (
          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>
        )}
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          {!isPasscodeValid && (
            <form onSubmit={(e) => {
              e.preventDefault(); // Prevent the default form submission
              validatePasscode(passcode);
            }}>
              <TextField 
                fullWidth 
                label="Enter Passcode" 
                variant="outlined" 
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)} 
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ mt: 2, textTransform: 'none', minWidth: '250px', boxShadow: 'none', '&:hover': { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', transform: 'scale(1.05)' }, transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
                >
                  Continue
                </Button>
              </Box>
            </form>
          )}
          {isPasscodeValid && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Welcome! Please sign in to get started.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<GoogleIcon />} 
                onClick={handleGoogleSignIn} 
                sx={{ textTransform: 'none', fontSize: '1rem', minWidth: '250px', boxShadow: 'none', '&:hover': { backgroundColor: '#357ae8', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', transform: 'scale(1.05)' }, transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out' }}
              >
                Sign In with Google
              </Button>
              <Tooltip title="Keep you signed in on this device. Do not use on public or shared computers." placement="right">
                <FormControlLabel
                  control={<Checkbox checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />}
                  label="Keep me signed in"
                />
              </Tooltip>
            </Box>
          )}
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;