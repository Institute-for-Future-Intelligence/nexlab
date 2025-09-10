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
import QuizSessionControls from './QuizSessionControls';
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
  const [selectedSession, setSelectedSession] = useState<QuizSessionDocument | null>(null);
  const [showQuestionAnalysis, setShowQuestionAnalysis] = useState(false);
  
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        console.log('🧩 QuizManagementPage: Loading quiz data from Firestore');
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

    // Only load data once on mount
    if (userDetails?.uid) {
      loadQuizData();
    }
  }, [userDetails?.uid]); // Only re-run if user changes

  const filteredSessions = quizSessions.filter(session => 
    difficultyFilter === 'all' || session.difficulty === difficultyFilter
  );

  // Calculate enhanced statistics from loaded sessions
  const statistics = {
    totalQuizzes: quizSessions.length,
    completedQuizzes: quizSessions.filter(s => s.completed).length,
    inProgressQuizzes: quizSessions.filter(s => !s.completed).length,
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
    performanceBreakdown: {
      excellent: quizSessions.filter(s => s.summary && s.summary.percent >= 90).length,
      good: quizSessions.filter(s => s.summary && s.summary.percent >= 70 && s.summary.percent < 90).length,
      average: quizSessions.filter(s => s.summary && s.summary.percent >= 50 && s.summary.percent < 70).length,
      poor: quizSessions.filter(s => s.summary && s.summary.percent < 50).length,
    },
    questionAnalytics: (() => {
      const questionStats: Record<string, { correct: number; incorrect: number; total: number }> = {};
      quizSessions.forEach(session => {
        if (session.summary?.items) {
          Object.entries(session.summary.items).forEach(([questionId, result]) => {
            if (!questionStats[questionId]) {
              questionStats[questionId] = { correct: 0, incorrect: 0, total: 0 };
            }
            questionStats[questionId].total++;
            if (result.verdict === 'correct') {
              questionStats[questionId].correct++;
            } else {
              questionStats[questionId].incorrect++;
            }
          });
        }
      });
      return questionStats;
    })(),
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

  // Handle viewing question-level analysis
  const handleViewQuestionAnalysis = (session: QuizSessionDocument) => {
    setSelectedSession(session);
    setShowQuestionAnalysis(true);
  };

  // Handle session updates from admin controls
  const handleSessionUpdate = async (sessionId: string) => {
    console.log('🔄 Refreshing quiz data after session update:', sessionId);
    try {
      const [sessions, events] = await Promise.all([
        getAllQuizSessions(),
        getQuizEvents()
      ]);
      setQuizSessions(sessions);
      setQuizEvents(events);
      console.log('✅ Quiz data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh quiz data:', error);
    }
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
        <Grid item xs={12} sm={6} md={2.4}>
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

        <Grid item xs={12} sm={6} md={2.4}>
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

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{statistics?.inProgressQuizzes || 0}</Typography>
                  <Typography color="text.secondary">In Progress</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
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

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="secondary" sx={{ mr: 2 }} />
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

      {/* Performance Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {statistics?.performanceBreakdown?.excellent || 0}
                </Typography>
                <Chip label="Excellent (90%+)" color="success" size="small" />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {statistics?.performanceBreakdown?.good || 0}
                </Typography>
                <Chip label="Good (70-89%)" color="info" size="small" />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {statistics?.performanceBreakdown?.average || 0}
                </Typography>
                <Chip label="Average (50-69%)" color="warning" size="small" />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {statistics?.performanceBreakdown?.poor || 0}
                </Typography>
                <Chip label="Poor (<50%)" color="error" size="small" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Question Analytics */}
      {Object.keys(statistics?.questionAnalytics || {}).length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question Performance Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing the most challenging questions based on answer accuracy
            </Typography>
            {Object.entries(statistics.questionAnalytics)
              .sort(([,a], [,b]) => (a.incorrect / a.total) - (b.incorrect / b.total))
              .slice(0, 5)
              .map(([questionId, stats]) => (
                <Box key={questionId} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontFamily="monospace">
                      Question: {questionId.substring(0, 20)}...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.total} attempts
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip 
                      label={`${stats.correct} correct`}
                      color="success"
                      size="small"
                    />
                    <Chip 
                      label={`${stats.incorrect} incorrect`}
                      color="error"
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {Math.round((stats.correct / stats.total) * 100)}% accuracy
                    </Typography>
                  </Box>
                </Box>
              ))}
          </CardContent>
        </Card>
      )}

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
                    <TableCell align="center">View Details</TableCell>
                    <TableCell align="center">Admin Controls</TableCell>
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
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewQuizDetails(session.quizId)}
                          >
                            Events
                          </Button>
                          {session.summary && (
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => handleViewQuestionAnalysis(session)}
                              color="info"
                            >
                              Questions
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <QuizSessionControls
                          session={session}
                          onSessionUpdate={handleSessionUpdate}
                        />
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

      {/* Question Analysis Dialog */}
      <Dialog 
        open={showQuestionAnalysis} 
        onClose={() => setShowQuestionAnalysis(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Question-Level Analysis
            </Typography>
            <IconButton onClick={() => setShowQuestionAnalysis(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSession && selectedSession.summary && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Quiz ID: <code>{selectedSession.quizId.substring(0, 16)}...</code>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Overall Score: {selectedSession.summary.total_score}/{selectedSession.summary.total_max} 
                ({Math.round(selectedSession.summary.percent)}%)
              </Typography>
              
              {Object.entries(selectedSession.summary.items || {}).map(([questionId, result]) => (
                <Card key={questionId} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontFamily="monospace">
                        Question: {questionId.substring(0, 24)}...
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={result.verdict.toUpperCase()}
                          color={result.verdict === 'correct' ? 'success' : 'error'}
                          size="small"
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {result.score}/{result.max_score}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {result.reasoning && (
                      <Box sx={{ 
                        backgroundColor: result.verdict === 'correct' ? 'success.50' : 'error.50', 
                        p: 2, 
                        borderRadius: 1,
                        border: `1px solid ${result.verdict === 'correct' ? '#4caf50' : '#f44336'}20`
                      }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          <strong>Feedback:</strong> {result.reasoning}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {Object.keys(selectedSession.summary.items || {}).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No question details available for this quiz.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionAnalysis(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagementPage;