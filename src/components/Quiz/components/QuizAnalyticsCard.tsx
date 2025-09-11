import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { QuizAnalytics } from '../../../types/quiz';

interface QuizAnalyticsCardProps {
  analytics: QuizAnalytics;
}

const QuizAnalyticsCard: React.FC<QuizAnalyticsCardProps> = ({ analytics }) => {
  const getDifficultyColor = (difficulty: string): 'success' | 'warning' | 'error' => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'warning';
    }
  };

  const getCategoryColor = (successRate: number): 'success' | 'warning' | 'error' => {
    if (successRate >= 70) return 'success';
    if (successRate >= 50) return 'warning';
    return 'error';
  };

  const formatTimeFromSeconds = (totalSeconds: number): string => {
    if (totalSeconds === 0) return '0s';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds}s`;
    if (seconds === 0) return `${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  return (
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
          <AnalyticsIcon color="primary" />
          Quiz Analytics & Insights
        </Typography>
        
        {/* Key Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: '#CDDAFF', 
              borderRadius: 2,
              border: '1px solid #0B53C0'
            }}>
              <QuizIcon sx={{ fontSize: 40, color: '#0B53C0', mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#0B53C0',
                  fontFamily: 'Staatliches, sans-serif'
                }}
              >
                {analytics.totalSessions}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#0B53C0',
                  fontFamily: 'Gabarito, sans-serif'
                }}
              >
                Total Sessions
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: '#C8E6C9', 
              borderRadius: 2,
              border: '1px solid #2E7D32'
            }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#2E7D32', mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#2E7D32',
                  fontFamily: 'Staatliches, sans-serif'
                }}
              >
                {Math.round(analytics.completionRate)}%
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#2E7D32',
                  fontFamily: 'Gabarito, sans-serif'
                }}
              >
                Completion Rate
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: '#E3F2FD', 
              borderRadius: 2,
              border: '1px solid #1565C0'
            }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#1565C0', mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#1565C0',
                  fontFamily: 'Staatliches, sans-serif'
                }}
              >
                {Math.round(analytics.averageScore)}%
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#1565C0',
                  fontFamily: 'Gabarito, sans-serif'
                }}
              >
                Average Score
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: '#FFF3E0', 
              borderRadius: 2,
              border: '1px solid #F57C00'
            }}>
              <ScheduleIcon sx={{ fontSize: 40, color: '#F57C00', mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#F57C00',
                  fontFamily: 'Staatliches, sans-serif'
                }}
              >
                {formatTimeFromSeconds(analytics.averageTimeSpent)}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#F57C00',
                  fontFamily: 'Gabarito, sans-serif'
                }}
              >
                Avg. Time Spent
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          {/* Difficulty Distribution */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuizIcon color="primary" />
              Difficulty Distribution
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(analytics.difficultyDistribution).map(([difficulty, count]) => {
                const percentage = analytics.totalSessions > 0 
                  ? (count / analytics.totalSessions) * 100 
                  : 0;
                
                return (
                  <Box key={difficulty} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          color={getDifficultyColor(difficulty)}
                          size="small"
                        />
                        <Typography variant="body2">
                          {count} sessions
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(percentage)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      color={getDifficultyColor(difficulty)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Category Performance */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" />
              Bloom's Taxonomy Performance
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(analytics.categoryPerformance).map(([category, performance]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {performance.totalAttempts} attempts
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {Math.round(performance.averageScore)}%
                      </Typography>
                      <Chip
                        label={`${performance.successRate}% success`}
                        color={getCategoryColor(performance.successRate)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={performance.successRate}
                    color={getCategoryColor(performance.successRate)}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Time-based Statistics Summary */}
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Activity Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                {Object.keys(analytics.timeBasedStats.daily).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Days
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                {Object.keys(analytics.timeBasedStats.weekly).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Weeks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" color="primary">
                {Object.keys(analytics.timeBasedStats.monthly).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Months
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuizAnalyticsCard;
