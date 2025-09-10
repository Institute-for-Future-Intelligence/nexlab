import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Chip,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Send as SubmitIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon
} from '@mui/icons-material';
import { QuizModal } from 'rag-quiz-modal-ifi';
import { QuizSessionDocument } from '../../services/quizDataService';
import { QuizDifficulty } from '../../types/quiz';

interface QuizSessionControlsProps {
  session: QuizSessionDocument;
  onSessionUpdate?: (sessionId: string) => void;
}

interface QuizRefMethods {
  reloadQuiz: () => void;
  clearProgress: () => void;
  submit: () => void;
  getAnswers: () => Record<string, string>;
  getSummary: () => any;
  close: () => void;
}

const QuizSessionControls: React.FC<QuizSessionControlsProps> = ({
  session,
  onSessionUpdate
}) => {
  const quizRef = useRef<QuizRefMethods | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string> | null>(null);
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleReloadQuiz = async () => {
    if (!quizRef.current) return;
    
    try {
      setIsLoading(true);
      setActionResult(null);
      quizRef.current.reloadQuiz();
      setActionResult({ type: 'success', message: 'Quiz reloaded successfully' });
      onSessionUpdate?.(session.quizId);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to reload quiz' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearProgress = async () => {
    if (!quizRef.current) return;
    
    try {
      setIsLoading(true);
      setActionResult(null);
      quizRef.current.clearProgress();
      setActionResult({ type: 'success', message: 'Quiz progress cleared successfully' });
      onSessionUpdate?.(session.quizId);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to clear progress' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceSubmit = async () => {
    if (!quizRef.current) return;
    
    try {
      setIsLoading(true);
      setActionResult(null);
      quizRef.current.submit();
      setActionResult({ type: 'success', message: 'Quiz submitted successfully' });
      onSessionUpdate?.(session.quizId);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to submit quiz' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCurrentAnswers = () => {
    if (!quizRef.current) return;
    
    try {
      const answers = quizRef.current.getAnswers();
      setCurrentAnswers(answers);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to get current answers' });
    }
  };

  const handleViewSummary = () => {
    if (!quizRef.current) return;
    
    try {
      const summary = quizRef.current.getSummary();
      setCurrentSummary(summary);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Failed to get quiz summary' });
    }
  };

  const handleStartQuizManagement = () => {
    setShowQuizModal(true);
  };

  const handleCloseQuizModal = () => {
    if (quizRef.current) {
      quizRef.current.close();
    }
    setShowQuizModal(false);
    setCurrentAnswers(null);
    setCurrentSummary(null);
    setActionResult(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Session Info */}
        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Quiz Session Management
                </Typography>
                <Typography variant="body2" fontFamily="monospace">
                  {session.quizId.substring(0, 16)}...
                </Typography>
              </Box>
              <Chip 
                label={session.completed ? 'Completed' : 'In Progress'}
                color={session.completed ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Action Result */}
        {actionResult && (
          <Alert severity={actionResult.type} onClose={() => setActionResult(null)}>
            {actionResult.message}
          </Alert>
        )}

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<StartIcon />}
            onClick={handleStartQuizManagement}
            fullWidth
          >
            Manage Quiz Session
          </Button>

          <ButtonGroup orientation="vertical" fullWidth variant="outlined" disabled={!showQuizModal}>
            <Button
              startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleReloadQuiz}
              disabled={isLoading}
            >
              Reload Quiz
            </Button>
            
            <Button
              startIcon={isLoading ? <CircularProgress size={16} /> : <ClearIcon />}
              onClick={handleClearProgress}
              disabled={isLoading}
              color="warning"
            >
              Clear Progress
            </Button>
            
            {!session.completed && (
              <Button
                startIcon={isLoading ? <CircularProgress size={16} /> : <SubmitIcon />}
                onClick={handleForceSubmit}
                disabled={isLoading}
                color="success"
              >
                Force Submit
              </Button>
            )}
          </ButtonGroup>

          <ButtonGroup orientation="vertical" fullWidth variant="text" disabled={!showQuizModal}>
            <Button
              startIcon={<ViewIcon />}
              onClick={handleViewCurrentAnswers}
            >
              View Current Answers
            </Button>
            
            <Button
              startIcon={<ViewIcon />}
              onClick={handleViewSummary}
              disabled={!session.completed}
            >
              View Summary
            </Button>
          </ButtonGroup>
        </Box>

        {/* Current Answers Display */}
        {currentAnswers && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Current Answers
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                backgroundColor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '200px',
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(currentAnswers, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Summary Display */}
        {currentSummary && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Quiz Summary
              </Typography>
              <Typography variant="body2" component="pre" sx={{ 
                backgroundColor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '300px',
                fontFamily: 'monospace'
              }}>
                {JSON.stringify(currentSummary, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Quiz Management Modal */}
      <Dialog 
        open={showQuizModal} 
        onClose={handleCloseQuizModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Quiz Session Management - {session.quizId.substring(0, 16)}...
        </DialogTitle>
        <DialogContent>
          <QuizModal
            ref={quizRef}
            chatbotId={session.chatbotId}
            open={showQuizModal}
            onClose={handleCloseQuizModal}
            difficulty={session.difficulty as QuizDifficulty}
            onQuizStart={(data) => console.log('Admin Quiz started:', data)}
            onAnswerChange={(event) => console.log('Admin Answer changed:', event)}
            onQuizSubmit={(result) => {
              console.log('Admin Quiz submitted:', result);
              onSessionUpdate?.(session.quizId);
            }}
            onQuizClose={(info) => {
              console.log('Admin Quiz closed:', info);
              onSessionUpdate?.(session.quizId);
            }}
            onError={(err, phase) => {
              console.error('Admin Quiz error in', phase, err);
              setActionResult({ type: 'error', message: `Quiz error in ${phase}: ${err.message}` });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuizModal}>
            Close Management
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuizSessionControls;
