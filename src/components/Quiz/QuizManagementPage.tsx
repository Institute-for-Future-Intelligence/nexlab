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
  Home as HomeIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
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
    chatbotsWithQuizzes,
    selectedChatbot,
    quizSessions,
    analytics,
    loading,
    error,
    filters,
    selectedSession,
    loadChatbotsWithQuizzes,
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

  // Load initial data
  useEffect(() => {
    console.log('🧩 Enhanced Quiz Management Page: Initializing...');
    loadChatbotsWithQuizzes();
  }, [loadChatbotsWithQuizzes]);

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
    <Box className="profile-container" sx={{ p: 4, maxWidth: '1400px', mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>
          <Typography variant="h4" gutterBottom>
            Quiz Management Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive quiz analytics and session management
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AnalyticsIcon />}
            disabled={!analytics}
            onClick={() => {/* TODO: Open analytics modal */}}
          >
            View Analytics
          </Button>
        </Stack>
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

      {/* Chatbot Selection Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            Chatbot & Quiz Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a chatbot to view its quiz sessions and manage quiz data. Each chatbot has an associated quiz with predefined questions.
          </Typography>
          
          <ChatbotSelector
            chatbots={chatbotsWithQuizzes}
            selectedChatbot={selectedChatbot}
            onSelect={handleChatbotSelect}
            loading={loading}
          />
          
          {selectedChatbot && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Material</Typography>
                  <Typography variant="body1">{selectedChatbot.materialTitle}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Course</Typography>
                  <Typography variant="body1">{selectedChatbot.courseTitle}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Quiz ID</Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedChatbot.quizId?.substring(0, 8)}...
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<QuestionAnswerIcon />}
                  onClick={() => selectedChatbot.quizId && handleViewQuizPool(selectedChatbot.quizId)}
                  size="small"
                >
                  View Quiz Questions
                </Button>
                <Badge badgeContent={quizSessions.length} color="primary">
                  <Button variant="outlined" size="small">
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
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QuizIcon color="primary" />
                Quiz Sessions
                <Badge badgeContent={quizSessions.length} color="primary" sx={{ ml: 1 }} />
              </Typography>
              
              {/* Filters */}
              <Stack direction="row" spacing={2} alignItems="center">
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