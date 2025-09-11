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
  IconButton,
  Autocomplete,
  TextField,
  Stack,
  Tooltip,
  Badge
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../hooks/useUser';
import { useQuizManagementStore } from '../../stores/quizManagementStore';
import { QuizDifficulty, ChatbotWithQuiz, EnhancedQuizSession } from '../../types/quiz';

// Component imports
import {
  CourseSelector,
  ChatbotSelector,
  QuizSessionsTable,
  QuizAnalyticsCard,
  QuizPoolViewer,
  SessionDetailsModal
} from './components';

const QuizManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userDetails } = useUser();
  
  // Quiz Management Store
  const {
    courses,
    selectedCourse,
    chatbotsWithQuizzes,
    filteredChatbots,
    selectedChatbot,
    quizSessions,
    analytics,
    loading,
    error,
    filters,
    selectedSession,
    loadChatbotsWithQuizzes,
    selectCourse,
    selectChatbot,
    loadQuizSessions,
    loadQuizPool,
    updateFilters,
    selectSession,
    exportSessionData,
    clearError
  } = useQuizManagementStore();

  // Local state for UI
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showQuizPool, setShowQuizPool] = useState(false);
  const [userIdFilter, setUserIdFilter] = useState<string>('');

  // Load initial data
  useEffect(() => {
    console.log('🧩 Enhanced Quiz Management Page: Initializing...');
    loadChatbotsWithQuizzes();
  }, [loadChatbotsWithQuizzes]);

  // Handle course selection
  const handleCourseSelect = (course: any) => {
    selectCourse(course);
    if (course) {
      console.log('🧩 Selected course:', course.courseTitle, 'with', course.chatbotCount, 'chatbots');
    }
  };

  // Handle chatbot selection
  const handleChatbotSelect = (chatbot: ChatbotWithQuiz | null) => {
    selectChatbot(chatbot);
    if (chatbot) {
      console.log('🧩 Selected chatbot:', chatbot.title, 'with quiz ID:', chatbot.quizId);
    }
  };

  // Handle session selection and details view
  const handleViewSessionDetails = (session: EnhancedQuizSession) => {
    selectSession(session);
    setShowSessionDetails(true);
  };

  // Handle quiz pool viewing
  const handleViewQuizPool = async (quizId: string) => {
    await loadQuizPool(quizId);
    setShowQuizPool(true);
  };

  // Handle data refresh
  const handleRefresh = () => {
    loadChatbotsWithQuizzes();
    if (selectedChatbot) {
      loadQuizSessions(selectedChatbot.chatbotId);
    }
  };

  // Handle session data export
  const handleExportSession = async (sessionId: string) => {
    await exportSessionData(sessionId);
  };

  // Filter handlers
  const handleDifficultyFilter = (difficulty: QuizDifficulty | 'all') => {
    updateFilters({ difficulty });
  };

  const handleCompletionFilter = (status: 'all' | 'completed' | 'incomplete') => {
    updateFilters({ completionStatus: status });
  };

  const handleUserIdFilter = (userId: string) => {
    setUserIdFilter(userId);
    updateFilters({ userId: userId || undefined });
  };

  if (loading && chatbotsWithQuizzes.length === 0) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
          Loading quiz management data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-container">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
      <Button
          variant="text" 
          startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')}
          className="profile-button"
          sx={{ mb: 2 }}
      >
          Home Page
      </Button>
      
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography className="webpage_title">
        Quiz Management
      </Typography>
            <Typography variant="body1" className="profile-text">
              Comprehensive quiz analytics and session management
            </Typography>
          </Box>
        
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Course & Chatbot Selection Section */}
      <Card sx={{ 
        mb: 4, 
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontFamily: 'Staatliches, sans-serif',
              color: '#0B53C0',
              fontSize: '1.5rem'
            }}
          >
            <SchoolIcon color="primary" />
            Course & Quiz Selection
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3,
              fontFamily: 'Gabarito, sans-serif',
              color: '#666666'
            }}
          >
            First select a course to filter materials, then choose a specific chatbot to view its quiz sessions and manage quiz data.
          </Typography>
          
          {/* Course Selection */}
          <Box sx={{ mb: 3 }}>
            <CourseSelector
              courses={courses}
              selectedCourse={selectedCourse}
              onSelect={handleCourseSelect}
              loading={loading}
            />
          </Box>
          
          {/* Chatbot Selection - Only show if course is selected or show all */}
          <Box>
            <ChatbotSelector
              chatbots={filteredChatbots}
              selectedChatbot={selectedChatbot}
              onSelect={handleChatbotSelect}
              loading={loading}
            />
          </Box>
          
          {selectedChatbot && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: '#F0F4FF', 
              borderRadius: 2,
              border: '1px solid #CDDAFF'
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: 'Gabarito, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0'
                    }}
                  >
                    Material
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ fontFamily: 'Gabarito, sans-serif' }}
                  >
                    {selectedChatbot.materialTitle}
                  </Typography>
        </Grid>
                <Grid item xs={12} md={3}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: 'Gabarito, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0'
                    }}
                  >
                    Course
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ fontFamily: 'Gabarito, sans-serif' }}
                  >
                    {selectedChatbot.courseTitle}
                  </Typography>
        </Grid>
                <Grid item xs={12} md={3}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontFamily: 'Gabarito, sans-serif',
                      fontWeight: 'bold',
                      color: '#0B53C0'
                    }}
                  >
                    Quiz ID
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontFamily="monospace" 
                    sx={{ 
                      fontSize: '0.875rem',
                      wordBreak: 'break-all',
                      lineHeight: 1.2
                    }}
                  >
                    {selectedChatbot.quizId || 'No Quiz ID Available'}
                  </Typography>
        </Grid>
      </Grid>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<QuestionAnswerIcon />}
                  onClick={() => selectedChatbot.quizId && handleViewQuizPool(selectedChatbot.quizId)}
                  size="small"
                  sx={{
                    fontFamily: 'Gabarito, sans-serif',
                    color: '#0B53C0',
                    borderColor: '#0B53C0',
                    '&:hover': {
                      backgroundColor: '#0B53C0',
                      color: '#FFFFFF'
                    }
                  }}
                >
                  View Quiz Questions
                </Button>
                <Badge badgeContent={quizSessions.length} color="primary">
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{
                      fontFamily: 'Gabarito, sans-serif',
                      color: '#0B53C0',
                      borderColor: '#0B53C0'
                    }}
                  >
                    Quiz Sessions
                  </Button>
                </Badge>
              </Box>
              </Box>
          )}
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      {analytics && (
        <QuizAnalyticsCard analytics={analytics} />
      )}

      {/* Quiz Sessions Section */}
      {selectedChatbot && (
        <Card sx={{ 
          backgroundColor: '#FFFFFF',
          borderRadius: 2,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontFamily: 'Staatliches, sans-serif',
                  color: '#0B53C0',
                  fontSize: '1.5rem'
                }}
              >
                <QuizIcon color="primary" />
                Quiz Sessions
                <Badge badgeContent={quizSessions.length} color="primary" sx={{ ml: 1 }} />
          </Typography>
              
              {/* Filters */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                  size="small"
                  label="Filter by User ID"
                  placeholder="Enter user ID..."
                  value={userIdFilter}
                  onChange={(e) => handleUserIdFilter(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Difficulty</InputLabel>
              <Select
                    value={filters.difficulty || 'all'}
                label="Difficulty"
                    onChange={(e) => handleDifficultyFilter(e.target.value as QuizDifficulty | 'all')}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.completionStatus || 'all'}
                    label="Status"
                    onChange={(e) => handleCompletionFilter(e.target.value as 'all' | 'completed' | 'incomplete')}
                  >
                    <MenuItem value="all">All Sessions</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="incomplete">In Progress</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <QuizSessionsTable
              sessions={quizSessions}
              loading={loading}
              onViewDetails={handleViewSessionDetails}
              onExportSession={handleExportSession}
            />
        </CardContent>
      </Card>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          open={showSessionDetails}
          onClose={() => setShowSessionDetails(false)}
        />
      )}

      {/* Quiz Pool Viewer Modal */}
      {selectedChatbot?.quizId && (
        <QuizPoolViewer
          quizId={selectedChatbot.quizId}
          open={showQuizPool}
          onClose={() => setShowQuizPool(false)}
        />
      )}
    </Box>
  );
};

export default QuizManagementPage;