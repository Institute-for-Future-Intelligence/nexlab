// Login/index.tsx
import { useState } from 'react';
import { Button, Typography, Container, Box, Snackbar, Alert, Checkbox, FormControlLabel, Tooltip, Divider, Grid, Link, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { authService } from '../../services/authService';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../config/designSystem';
import DashboardFooter from '../Layout/DashboardFooter';

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
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: colors.background.primary,
      overflow: 'hidden'
    }}>
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex', 
        backgroundColor: colors.background.primary,
        overflow: 'hidden'
      }}>
      {/* Left Side - Logo Section */}
      <Box sx={{
        flex: isMobile ? 'none' : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary[100],
        backgroundImage: `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.primary[200]} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        minHeight: isMobile ? '40vh' : '100vh',
        width: isMobile ? '100%' : '50%',
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, ${colors.primary[200]} 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, ${colors.primary[300]} 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, ${colors.primary[100]} 0%, transparent 50%)`,
          opacity: 0.3,
        }} />
        
        {/* Logo Container */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          px: spacing[6],
        }}>
          <img 
            src={`${import.meta.env.BASE_URL}nexlab-logo.png`} 
            alt="NexLab Logo" 
            style={{ 
              width: isMobile ? '450px' : '750px',
              maxWidth: '100%',
              height: 'auto',
              marginBottom: spacing[4],
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
            }}
          />
          <Typography 
            variant="h3" 
            sx={{
              fontFamily: typography.fontFamily.secondary,
              fontSize: isMobile ? typography.fontSize['2xl'] : typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.normal,
              color: colors.primary[700],
              mb: spacing[2],
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              lineHeight: typography.lineHeight.snug,
            }}
          >
            Next-Generation Experiments and Learning for Advanced Biotech
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form Section */}
      <Box sx={{
        flex: isMobile ? 'none' : 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary[100],
        minHeight: isMobile ? '60vh' : '100vh',
        width: isMobile ? '100%' : '50%',
        px: spacing[6],
        py: spacing[8],
      }}>
        <Paper sx={{
          p: spacing[8],
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.xl,
          border: `1px solid ${colors.neutral[200]}`,
          maxWidth: '400px',
          width: '100%',
          backgroundColor: colors.surface.elevated,
        }}>
          <Box sx={{ textAlign: 'center', mb: spacing[6] }}>
            <Typography 
              variant="h4" 
              sx={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize['4xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                mb: spacing[2],
              }}
            >
              Welcome!
            </Typography>
            <Typography 
              variant="body1" 
              sx={{
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              Please sign in to get started.
            </Typography>
          </Box>

          <Box sx={{ mb: spacing[6] }}>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              fullWidth
              sx={{ 
                py: spacing[4],
                borderRadius: borderRadius.xl,
                backgroundColor: colors.primary[500],
                color: colors.text.inverse,
                fontFamily: typography.fontFamily.secondary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                textTransform: 'none',
                boxShadow: shadows.md,
                transition: animations.transitions.normal,
                '&:hover': { 
                  backgroundColor: colors.primary[600],
                  boxShadow: shadows.lg,
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  backgroundColor: colors.neutral[300],
                  color: colors.neutral[500],
                  transform: 'none',
                }
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Tooltip 
              title="Keep you signed in on this device. Do not use on public or shared computers." 
              placement="top"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    sx={{
                      color: colors.primary[500],
                      '&.Mui-checked': {
                        color: colors.primary[600],
                      },
                    }}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontFamily: typography.fontFamily.primary,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    Keep me signed in
                  </Typography>
                }
              />
            </Tooltip>
          </Box>

          {/* Privacy Note */}
          <Box sx={{ mt: spacing[4], textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                lineHeight: typography.lineHeight.relaxed,
                fontStyle: 'italic',
              }}
            >
              Note: Your email is only used for Google Authentication. No private information is collected in our database.
            </Typography>
          </Box>

          <Box sx={{ mt: spacing[4], textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                lineHeight: typography.lineHeight.relaxed,
              }}
            >
              By signing in, you agree to our{' '}
              <Link 
                href="#" 
                sx={{ 
                  color: colors.primary[600],
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link 
                href="#" 
                sx={{ 
                  color: colors.primary[600],
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
      </Box>

      {/* Footer */}
      <DashboardFooter />

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: spacing[4] }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{
            borderRadius: borderRadius.lg,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;