import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            m: 2, 
            textAlign: 'center',
            backgroundColor: '#fafafa',
            border: '1px solid #e0e0e0'
          }}
        >
          <ErrorOutlineIcon 
            color="error" 
            sx={{ fontSize: 48, mb: 2 }} 
          />
          
          <Typography variant="h5" gutterBottom color="error">
            Something went wrong
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>

          {this.props.showDetails && this.state.error && (
            <Alert severity="error" sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Error Details:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}>
                {this.state.error.message}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </Typography>
            </Alert>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 