// src/components/ChatbotConversations/ConversationAnalysisModal.tsx

import React, { useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import ConversationAnalysisResults from './ConversationAnalysisResults';
import { useConversationAnalysis } from '../../hooks/useConversationAnalysis';

const StyledModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '1200px',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0px 8px 32px rgba(0,0,0,0.15)',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    width: '95%',
    padding: theme.spacing(2),
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `2px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  gap: '20px',
});

interface ConversationAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  conversationIds: string[];
  autoAnalyze?: boolean;
}

/**
 * Modal component for displaying conversation analysis results
 * 
 * Features:
 * - Auto-analyze on open
 * - Single or multiple conversation analysis
 * - Loading and error states
 * - Beautiful results display
 * - Responsive design
 */
const ConversationAnalysisModal: React.FC<ConversationAnalysisModalProps> = ({
  open,
  onClose,
  conversationIds,
  autoAnalyze = true,
}) => {
  const {
    loading,
    error,
    data,
    analysisType,
    analyze,
    reset,
    isSuccess,
  } = useConversationAnalysis();

  // Auto-analyze when modal opens
  useEffect(() => {
    if (open && autoAnalyze && conversationIds.length > 0) {
      analyze(conversationIds);
    }

    // Reset state when modal closes
    if (!open) {
      reset();
    }
  }, [open, autoAnalyze, conversationIds, analyze, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRetry = () => {
    analyze(conversationIds);
  };

  const isSingle = conversationIds.length === 1;
  const modalTitle = isSingle
    ? 'Conversation Analysis'
    : `Batch Analysis (${conversationIds.length} conversations)`;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      aria-labelledby="conversation-analysis-modal"
      aria-describedby="conversation-analysis-description"
    >
      <Fade in={open}>
        <StyledModalBox>
          <StyledHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon color="primary" />
              <Typography variant="h5" component="h2">
                {modalTitle}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              aria-label="close"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </StyledHeader>

          {/* Loading State */}
          {loading && (
            <LoadingContainer>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Analyzing conversation{conversationIds.length > 1 ? 's' : ''}...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a few moments
              </Typography>
            </LoadingContainer>
          )}

          {/* Error State */}
          {error && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Analysis Failed
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" onClick={handleRetry}>
                  Retry Analysis
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Close
                </Button>
              </Box>
            </Box>
          )}

          {/* Success State - Display Results */}
          {isSuccess && data && analysisType && !loading && (
            <Box>
              {/* Analysis Info */}
              <Box sx={{ mb: 3 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Analysis completed successfully!
                  </Typography>
                  {conversationIds.length > 1 && (
                    <Typography variant="body2">
                      Analyzed {conversationIds.length} conversations
                    </Typography>
                  )}
                </Alert>
              </Box>

              {/* Results Component */}
              <ConversationAnalysisResults data={data} analysisType={analysisType} />

              {/* Close Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  size="large"
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}

          {/* Initial State (if not auto-analyzing) */}
          {!loading && !error && !data && !autoAnalyze && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ready to analyze {conversationIds.length} conversation{conversationIds.length > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click the button below to start the analysis
              </Typography>
              <Button
                variant="contained"
                onClick={handleRetry}
                size="large"
                startIcon={<AnalyticsIcon />}
              >
                Start Analysis
              </Button>
            </Box>
          )}
        </StyledModalBox>
      </Fade>
    </Modal>
  );
};

export default ConversationAnalysisModal;

