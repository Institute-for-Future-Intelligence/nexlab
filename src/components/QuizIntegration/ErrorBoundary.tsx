import { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface QuizErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface QuizErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class QuizErrorBoundary extends Component<QuizErrorBoundaryProps, QuizErrorBoundaryState> {
  constructor(props: QuizErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): QuizErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Quiz Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
            minHeight: 200
          }}
        >
          <ErrorIcon 
            sx={{ 
              fontSize: 48, 
              color: 'error.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h6" gutterBottom>
            Quiz Loading Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Something went wrong while loading the quiz. Please try again.
          </Typography>
          {this.state.error && (
            <Typography variant="caption" color="error" sx={{ mb: 2, fontFamily: 'monospace' }}>
              {this.state.error.message}
            </Typography>
          )}
          <Button 
            variant="contained" 
            onClick={this.handleRetry}
            size="small"
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default QuizErrorBoundary;
