import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { EnhancedQuizSession, QuizDifficulty } from '../../../types/quiz';

interface SessionDetailsModalProps {
  session: EnhancedQuizSession;
  open: boolean;
  onClose: () => void;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  open,
  onClose
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: QuizDifficulty): 'success' | 'warning' | 'error' => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'warning';
    }
  };

  const getVerdictColor = (verdict: string): 'success' | 'error' => {
    return verdict === 'correct' ? 'success' : 'error';
  };

  const handleExportSession = () => {
    const exportData = {
      sessionId: session.id,
      quizId: session.quizId,
      chatbotId: session.chatbotId,
      student: {
        userId: session.userId,
        name: session.userName,
        email: session.userEmail
      },
      quiz: {
        difficulty: session.difficulty,
        startedAt: session.startedAt,
        submittedAt: session.submittedAt,
        completed: session.completed,
        timeSpent: session.timeSpent
      },
      answers: session.answers,
      summary: session.summary,
      exportedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-session-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="div">
              Quiz Session Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Session ID: {session.id}
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* User Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              User Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Display Name</Typography>
                <Typography variant="body1">{session.userName || 'Anonymous User'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                <Typography variant="body1" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                  {session.userId}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quiz Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuizIcon color="primary" />
              Quiz Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Quiz ID</Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {session.quizId.substring(0, 16)}...
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Chatbot ID</Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {session.chatbotId.substring(0, 16)}...
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Difficulty</Typography>
                <Chip
                  label={session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                  color={getDifficultyColor(session.difficulty)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={session.completed ? 'Completed' : 'In Progress'}
                  color={session.completed ? 'success' : 'warning'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Questions Attempted</Typography>
                <Typography variant="body1">
                  {session.questionsAttempted} questions answered
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Quiz Mode</Typography>
                <Typography variant="body1">
                  {session.difficulty === 'easy' ? '~5 questions (Remember/Understand focus)' :
                   session.difficulty === 'medium' ? '~8 questions (Mixed difficulty)' :
                   '~10 questions (Analyze/Evaluate focus)'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Session Timeline */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Session Timeline
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Started At</Typography>
                <Typography variant="body1">{formatDate(session.startedAt)}</Typography>
              </Grid>
              {session.submittedAt && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted At</Typography>
                  <Typography variant="body1">{formatDate(session.submittedAt)}</Typography>
                </Grid>
              )}
              {session.timeSpentFormatted && (
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Time Spent</Typography>
                  <Typography variant="body1">{session.timeSpentFormatted}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Quiz Results */}
        {session.summary && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Results
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary.contrastText">
                      {session.summary.total_score}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Total Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.contrastText">
                      {session.summary.total_max}
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Maximum Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.contrastText">
                      {Math.round(session.summary.percent)}%
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Percentage
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Question-by-Question Results */}
              <Typography variant="h6" gutterBottom>
                Question Results
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Question ID</TableCell>
                      <TableCell align="center">Score</TableCell>
                      <TableCell align="center">Max Score</TableCell>
                      <TableCell align="center">Verdict</TableCell>
                      <TableCell>Reasoning</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(session.summary.items).map(([questionId, result]) => (
                      <TableRow key={questionId}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {questionId}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="bold">
                            {result.score}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {result.max_score}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={result.verdict}
                            color={getVerdictColor(result.verdict)}
                            size="small"
                            icon={result.verdict === 'correct' ? <CheckCircleIcon /> : <CancelIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {result.reasoning}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* User Answers */}
        {Object.keys(session.answers).length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Answers
              </Typography>
              {Object.entries(session.answers).map(([questionId, answer], index) => (
                <Accordion key={questionId}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      Question {index + 1} ({questionId})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {answer}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleExportSession}
          variant="outlined"
        >
          Export Session Data
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionDetailsModal;
