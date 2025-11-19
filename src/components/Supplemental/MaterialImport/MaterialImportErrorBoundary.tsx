// src/components/Supplemental/MaterialImport/MaterialImportErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Error as ErrorIcon,
  Refresh as RetryIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

interface MaterialImportErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface MaterialImportErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

class MaterialImportErrorBoundary extends Component<
  MaterialImportErrorBoundaryProps,
  MaterialImportErrorBoundaryState
> {
  constructor(props: MaterialImportErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MaterialImportErrorBoundaryState> {
    // Generate a unique error ID for debugging
    const errorId = `MI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Material Import Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service if configured
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a production environment, you might want to log to a service like Sentry
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: 'MaterialImport'
    };

    // For now, just log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Material Import Error Report');
      console.error('Error ID:', errorReport.errorId);
      console.error('Message:', errorReport.message);
      console.error('Stack:', errorReport.stack);
      console.error('Component Stack:', errorReport.componentStack);
      console.error('Full Report:', errorReport);
      console.groupEnd();
    }

    // TODO: In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private getErrorSeverity = (error: Error): 'error' | 'warning' => {
    // Classify error severity based on error message/type
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('api key') || message.includes('rate limit')) {
      return 'warning'; // These are recoverable
    }
    
    return 'error'; // Default to error for unknown issues
  };

  private getErrorSuggestion = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    // Check for leaked API key (most specific first)
    if (message.includes('leaked') || message.includes('reported as leaked')) {
      return 'Your API key has been reported as leaked by Google. Generate a new key from Google AI Studio (https://ai.google.dev), update your environment variables, and restart your development server. See docs/API_KEY_SECURITY.md for long-term security solutions.';
    }
    
    if (message.includes('403') || message.includes('access denied')) {
      return 'API access denied. Your API key may be invalid, expired, or restricted. Get a new key from https://ai.google.dev and update your VITE_GEMINI_MATERIAL_API_KEY or VITE_GEMINI_API_KEY environment variable.';
    }
    
    if (message.includes('api key') || message.includes('api_key_invalid')) {
      return 'Invalid API key configuration. Please check that VITE_GEMINI_MATERIAL_API_KEY or VITE_GEMINI_API_KEY is correctly set in your .env file. Get a valid key from https://ai.google.dev';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Please check your internet connection and try again.';
    }
    
    if (message.includes('rate limit') || message.includes('quota')) {
      return 'You have exceeded the API rate limit or quota. Please wait a few minutes before trying again, or consider using a separate API key for material imports.';
    }
    
    if (message.includes('file') || message.includes('upload')) {
      return 'Please try uploading a different file or check that your file is not corrupted.';
    }
    
    return 'Please try refreshing the page or contact support if the issue persists.';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity(this.state.error);
      const suggestion = this.getErrorSuggestion(this.state.error);

      return (
        <Paper elevation={3} sx={{ p: 3, m: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ErrorIcon color="error" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" color="error.main">
                Material Import Error
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Something went wrong while processing your material
              </Typography>
            </Box>
          </Box>

          <Alert severity={severity} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Error:</strong> {this.state.error.message}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Suggestion:</strong> {suggestion}
            </Typography>
          </Alert>

          {/* Error Details (Expandable) */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugIcon fontSize="small" />
                <Typography variant="body2">
                  Technical Details (Error ID: {this.state.errorId})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="caption" component="pre" sx={{ 
                bgcolor: 'grey.100', 
                p: 1, 
                borderRadius: 1, 
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {this.state.error.stack}
              </Typography>
              {this.state.errorInfo && (
                <Typography variant="caption" component="pre" sx={{ 
                  bgcolor: 'grey.100', 
                  p: 1, 
                  mt: 1,
                  borderRadius: 1, 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  Component Stack:
                  {this.state.errorInfo.componentStack}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={this.handleRetry}
              startIcon={<RetryIcon />}
              color="primary"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              color="secondary"
            >
              Reload Page
            </Button>
          </Box>

          {/* Help Text */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            If this error persists, please take a screenshot and contact support with Error ID: {this.state.errorId}
          </Typography>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default MaterialImportErrorBoundary;
