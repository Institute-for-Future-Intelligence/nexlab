import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  Visibility as ViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useQuizStore } from '../../stores/quizStore';
import { useUser } from '../../hooks/useUser';
import QuizButton from '../QuizIntegration/QuizButton';
import { getAllQuizSessions, getQuizEvents, QuizSessionDocument, QuizEventDocument } from '../../services/quizDataService';
import { QuizDifficulty } from '../../types/quiz';

const QuizManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  const { loading, error } = useQuizStore();

  const [difficultyFilter, setDifficultyFilter] = useState<QuizDifficulty | 'all'>('all');
  const [quizSessions, setQuizSessions] = useState<QuizSessionDocument[]>([]);
  const [quizEvents, setQuizEvents] = useState<QuizEventDocument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  // Load quiz sessions from Firestore
  console.log('🧩 QuizManagementPage: Loading quiz data from Firestore');

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoadingData(true);
        // Load both sessions and events for super-admin view
        const [sessions, events] = await Promise.all([
          getAllQuizSessions(),
          getQuizEvents()
        ]);
        setQuizSessions(sessions);
        setQuizEvents(events);
        console.log(`📊 Loaded ${sessions.length} quiz sessions and ${events.length} quiz events for super-admin view`);
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadQuizData();
  }, []);

  const filteredSessions = quizSessions.filter(session => 
    difficultyFilter === 'all' || session.difficulty === difficultyFilter
  );

  // Calculate statistics from loaded sessions
  const statistics = {
    totalQuizzes: quizSessions.length,
    completedQuizzes: quizSessions.filter(s => s.completed).length,
    averageScore: quizSessions.filter(s => s.summary).length > 0 
      ? quizSessions
          .filter(s => s.summary)
          .reduce((sum, s) => sum + (s.summary?.percent || 0), 0) / 
          quizSessions.filter(s => s.summary).length
      : 0,
    difficultyBreakdown: {
      easy: quizSessions.filter(s => s.difficulty === 'easy').length,
      medium: quizSessions.filter(s => s.difficulty === 'medium').length,
      hard: quizSessions.filter(s => s.difficulty === 'hard').length,
    },
    lastQuizDate: quizSessions.length > 0 ? quizSessions[0].startedAt.toDate().toISOString() : undefined
  };

  // Get events for a specific quiz
  const getEventsForQuiz = (quizId: string) => {
    return quizEvents.filter(event => event.quizId === quizId)
      .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
  };

  // Handle viewing quiz details
  const handleViewQuizDetails = (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowEventDetails(true);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'success';
    if (percent >= 60) return 'warning';
    return 'error';
  };

  const getDifficultyColor = (difficulty: QuizDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (isLoadingData) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading quiz data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-container" sx={{ p: 4 }}>
      {/* Back to Home Button */}
      <Button
        variant="outlined"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Quiz Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <QuizIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.totalQuizzes || 0}</Typography>
                  <Typography color="text.secondary">Total Quizzes</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.completedQuizzes || 0}</Typography>
                  <Typography color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{Math.round(statistics?.averageScore || 0)}%</Typography>
                  <Typography color="text.secondary">Average Score</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {statistics?.lastQuizDate 
                      ? formatDate(statistics.lastQuizDate).split(',')[0]
                      : 'Never'
                    }
                  </Typography>
                  <Typography color="text.secondary">Last Quiz</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Difficulty Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quiz Difficulty Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics?.difficultyBreakdown?.easy || 0}
                </Typography>
                <Chip label="Easy" color="success" size="small" />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statistics?.difficultyBreakdown?.medium || 0}
                </Typography>
                <Chip label="Medium" color="warning" size="small" />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {statistics?.difficultyBreakdown?.hard || 0}
                </Typography>
                <Chip label="Hard" color="error" size="small" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Start Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Start New Quiz
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyFilter}
                label="Difficulty"
                onChange={(e) => setDifficultyFilter(e.target.value as QuizDifficulty | 'all')}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Quiz difficulty will be automatically matched to your current learning material.
          </Typography>
        </CardContent>
      </Card>

      {/* Quiz History */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Quiz History ({filteredSessions.length})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={difficultyFilter}
                label="Filter"
                onChange={(e) => setDifficultyFilter(e.target.value as QuizDifficulty | 'all')}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {filteredSessions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <QuizIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No quiz sessions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {difficultyFilter === 'all' 
                  ? 'No quiz sessions have been completed yet.'
                  : `No ${difficultyFilter} difficulty quiz sessions found.`
                }
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Chatbot ID</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Performance</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSessions.map((session, index) => (
                    <TableRow key={`${session.quizId}-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {session.userId.substring(0, 12)}...
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          User ID
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.startedAt.toDate().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {session.chatbotId.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                          color={getDifficultyColor(session.difficulty as QuizDifficulty)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={session.completed ? 'Completed' : 'In Progress'}
                          color={session.completed ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {session.summary ? (
                          <Typography variant="body2" fontWeight="bold">
                            {session.summary.total_score}/{session.summary.total_max}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {session.summary ? (
                          <Chip
                            label={`${Math.round(session.summary.percent)}%`}
                            color={session.summary.percent >= 80 ? 'success' : session.summary.percent >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewQuizDetails(session.quizId)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Quiz Details Dialog */}
      <Dialog 
        open={showEventDetails} 
        onClose={() => setShowEventDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Quiz Event Details
            </Typography>
            <IconButton onClick={() => setShowEventDetails(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedQuizId && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Quiz ID: <code>{selectedQuizId}</code>
              </Typography>
              
              {getEventsForQuiz(selectedQuizId).map((event, index) => (
                <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={event.eventType.replace('_', ' ').toUpperCase()}
                        color={
                          event.eventType === 'quiz_started' ? 'primary' :
                          event.eventType === 'quiz_submitted' ? 'success' :
                          event.eventType === 'quiz_closed' ? 'default' : 'secondary'
                        }
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {event.timestamp.toDate().toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" component="pre" sx={{ 
                      backgroundColor: 'grey.50', 
                      p: 2, 
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontFamily: 'monospace'
                    }}>
                      {JSON.stringify(event.data, null, 2)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              
              {getEventsForQuiz(selectedQuizId).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No events found for this quiz.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEventDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagementPage;