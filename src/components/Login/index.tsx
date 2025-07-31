// Login/index.tsx
import { useState } from 'react';
import { Button, Typography, Container, Box, Snackbar, Alert, Checkbox, FormControlLabel, Tooltip, Divider, Grid, Link } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { authService } from '../../services/authService';

const Login = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'info' | 'success' | 'warning'>('success');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await authService.signInWithGoogle(keepSignedIn);
      showSnackbar('Successfully logged in with Google!', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login Failed: An unexpected error occurred.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'error' | 'info' | 'success' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={isMobile ? 2 : 4} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          <img src={`${import.meta.env.BASE_URL}nexlab-logo.png`} alt="ATE Logo" style={{ width: 600, marginBottom: 20 }}/>
        </Grid>
        {!isMobile && <Grid item><Divider orientation="vertical" flexItem /></Grid>}
        <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>Welcome! Please sign in to get started.</Typography>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ 
                textTransform: 'none', 
                fontSize: '1rem', 
                minWidth: '250px', 
                boxShadow: 'none', 
                '&:hover': { 
                  backgroundColor: '#357ae8', 
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', 
                  transform: 'scale(1.05)' 
                }, 
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:disabled': {
                  backgroundColor: '#ccc',
                  color: '#999'
                }
              }}
            >
              {loading ? 'Signing in...' : 'Google Authentication'}
            </Button>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2, textAlign: 'center', maxWidth: 300 }}>
              Note: Your email is only used for Google Authentication. No private information is collected in our database. For more details, please review our{' '}
              <Link href="https://intofuture.org/nexlab-privacy.html" target="_blank" rel="noopener" underline="hover">Privacy Policy</Link>.
            </Typography>
            <Tooltip title="Keep you signed in on this device. Do not use on public or shared computers." placement="right">
              <FormControlLabel
                control={<Checkbox checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} />}
                label="Keep me signed in"
              />
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          <Typography>{snackbarMessage}</Typography>
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;