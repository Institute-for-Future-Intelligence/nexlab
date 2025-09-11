import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  Box,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { EnhancedQuizSession, QuizDifficulty } from '../../../types/quiz';

interface QuizSessionsTableProps {
  sessions: EnhancedQuizSession[];
  loading?: boolean;
  onViewDetails: (session: EnhancedQuizSession) => void;
  onExportSession: (sessionId: string) => void;
}

const QuizSessionsTable: React.FC<QuizSessionsTableProps> = ({
  sessions,
  loading = false,
  onViewDetails,
  onExportSession
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getScoreColor = (percent: number): 'success' | 'warning' | 'error' => {
    if (percent >= 80) return 'success';
    if (percent >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading quiz sessions...
        </Typography>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No quiz sessions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No quiz sessions have been completed for this chatbot yet. 
          Students need to take quizzes to see data here.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuizIcon fontSize="small" />
                Session ID
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" />
                User ID
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" />
                Date & Time
              </Box>
            </TableCell>
            <TableCell>Difficulty</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Questions</TableCell>
            <TableCell align="center">Time Spent</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell align="center">Performance</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id} hover>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>
                  {session.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>
                  {session.userId}
                </Typography>
              </TableCell>
              
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {formatDate(session.startedAt)}
                  </Typography>
                  {session.submittedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Submitted: {formatDate(session.submittedAt)}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              
              <TableCell>
                <Chip 
                  label={session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                  color={getDifficultyColor(session.difficulty)}
                  size="small"
                />
              </TableCell>
              
              <TableCell>
                <Chip 
                  label={session.completed ? 'Completed' : 'In Progress'}
                  color={session.completed ? 'success' : 'warning'}
                  size="small"
                  variant={session.completed ? 'filled' : 'outlined'}
                />
              </TableCell>
              
              <TableCell align="center">
                <Typography variant="body2" fontWeight="medium">
                  {session.questionsAttempted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  attempted
                </Typography>
              </TableCell>
              
              <TableCell align="center">
                {session.timeSpentFormatted ? (
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {session.timeSpentFormatted}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      duration
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              
              <TableCell align="center">
                {session.summary ? (
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {session.summary.total_score}/{session.summary.total_max}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      points
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              
              <TableCell align="center">
                {session.summary ? (
                  <Chip
                    label={`${Math.round(session.summary.percent)}%`}
                    color={getScoreColor(session.summary.percent)}
                    size="small"
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(session)}
                      color="primary"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Export Data">
                    <IconButton
                      size="small"
                      onClick={() => onExportSession(session.id)}
                      color="secondary"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuizSessionsTable;
