import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useQuizManagementStore } from '../../../stores/quizManagementStore';
import { QuizDifficulty } from '../../../types/quiz';

interface QuizPoolViewerProps {
  quizId: string;
  open: boolean;
  onClose: () => void;
}

const QuizPoolViewer: React.FC<QuizPoolViewerProps> = ({
  quizId,
  open,
  onClose
}) => {
  const { quizPools, loading } = useQuizManagementStore();
  const quizPool = quizPools[quizId];

  const getDifficultyColor = (difficulty: QuizDifficulty): 'success' | 'warning' | 'error' => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'warning';
    }
  };

  const getCategoryColor = (category: string): 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
    const colors: Record<string, any> = {
      'Remember': 'success',
      'Understand': 'info',
      'Apply': 'primary',
      'Analyze': 'warning',
      'Evaluate': 'error',
      'Create': 'secondary'
    };
    return colors[category] || 'primary';
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%', mb: 2 }} />
            <Typography variant="body1">Loading quiz questions...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!quizPool) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Quiz Pool</Typography>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Quiz pool not found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to load questions for quiz ID: {quizId}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

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
              Quiz Question Pool
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quiz ID: {quizId.substring(0, 16)}...
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Pool Statistics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              Pool Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.contrastText">
                    {quizPool.totalQuestions}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Total Questions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.contrastText">
                    {quizPool.difficultyBreakdown.easy || 0}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Easy Questions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.contrastText">
                    {quizPool.difficultyBreakdown.medium || 0}
                  </Typography>
                  <Typography variant="body2" color="warning.contrastText">
                    Medium Questions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="error.contrastText">
                    {quizPool.difficultyBreakdown.hard || 0}
                  </Typography>
                  <Typography variant="body2" color="error.contrastText">
                    Hard Questions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon color="primary" />
              Bloom's Taxonomy Categories
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(quizPool.categoryCounts).map(([category, count]) => {
                const percentage = (count / quizPool.totalQuestions) * 100;
                return (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={category}
                          color={getCategoryColor(category)}
                          size="small"
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {count} questions
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={getCategoryColor(category)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {Math.round(percentage)}% of total
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuestionAnswerIcon color="primary" />
              Quiz Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These are the questions that students can be quizzed on. The quiz modal automatically selects 
              questions based on difficulty and Bloom's taxonomy distribution.
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question ID</TableCell>
                    <TableCell>Question</TableCell>
                    <TableCell align="center">Category</TableCell>
                    <TableCell align="center">Difficulty</TableCell>
                    <TableCell align="center">Max Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizPool.questions.map((question, index) => (
                    <TableRow key={question.questionId} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {question.questionId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {question.question.length > 100 
                            ? `${question.question.substring(0, 100)}...` 
                            : question.question
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={question.category}
                          color={getCategoryColor(question.category)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          color={getDifficultyColor(question.difficulty)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {question.maxScore}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Pool Information */}
        <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Quiz Question Pool:</strong> This shows the available questions that can be selected for quizzes. 
            When students take a quiz, questions are automatically chosen from this pool based on the selected difficulty mode:
            Easy (~5 questions), Medium (~8 questions), Hard (~10 questions).
          </Typography>
          <Typography variant="caption" color="info.contrastText" sx={{ mt: 1, display: 'block' }}>
            <strong>Note:</strong> This is placeholder data for demonstration. Actual questions will be loaded from the quiz API.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizPoolViewer;
