// src/components/ChatbotConversations/ConversationAnalysisResults.tsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Psychology,
  Quiz,
  AutoStories,
  Insights,
} from '@mui/icons-material';
import {
  SingleConversationAnalysis,
  MultipleConversationsAnalysis,
  BloomLevel,
  EngagementLevel,
  IndividualAnalysis,
} from '../../types/conversationAnalysis';

// Type guard to check if an analysis is successful (not failed)
function isSuccessfulAnalysis(analysis: IndividualAnalysis): analysis is SingleConversationAnalysis {
  return !('error' in analysis);
}

interface ConversationAnalysisResultsProps {
  data: SingleConversationAnalysis | MultipleConversationsAnalysis;
  analysisType: 'single' | 'multiple';
}

// Helper function to get color for Bloom's level
const getBloomLevelColor = (level: BloomLevel): string => {
  const colors: Record<BloomLevel, string> = {
    REMEMBER: '#9E9E9E',
    UNDERSTAND: '#2196F3',
    APPLY: '#4CAF50',
    ANALYZE: '#FF9800',
    EVALUATE: '#F44336',
    CREATE: '#9C27B0',
  };
  return colors[level];
};

// Helper function to get engagement color
const getEngagementColor = (level: EngagementLevel): string => {
  const colors: Record<EngagementLevel, string> = {
    low: '#F44336',
    moderate: '#FF9800',
    high: '#4CAF50',
  };
  return colors[level];
};

// Helper function to get trajectory icon
const getTrajectoryIcon = (trajectory: string) => {
  if (trajectory.includes('improving')) return <TrendingUp color="success" />;
  if (trajectory.includes('declining')) return <TrendingDown color="error" />;
  return <TrendingFlat color="action" />;
};

// Metric card component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}> = ({ title, value, subtitle, icon, color = '#1976d2' }) => (
  <Card sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1, display: 'flex' }}>{icon}</Box>}
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Single Conversation Results Component
const SingleConversationResults: React.FC<{
  data: SingleConversationAnalysis;
}> = ({ data }) => {
  // Debug: Log the data structure to console
  console.log('Single Conversation Analysis Data:', data);

  // Defensive checks for undefined/null data
  if (!data) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2">No analysis data available</Typography>
        <Typography variant="body2">The API response was empty or invalid.</Typography>
      </Alert>
    );
  }

  if (!data.engagement || !data.blooms_progression) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2">Incomplete analysis data</Typography>
        <Typography variant="body2">
          Missing required fields in API response. Please check the conversation ID or try again.
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" component="pre" sx={{ fontSize: '10px' }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Questions"
            value={data.total_questions || 0}
            icon={<Quiz />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Engagement Level"
            value={data.engagement?.engagement_level?.toUpperCase() || 'N/A'}
            subtitle={`${data.engagement?.message_count || 0} messages`}
            icon={<Psychology />}
            color={data.engagement?.engagement_level ? getEngagementColor(data.engagement.engagement_level) : '#9E9E9E'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Highest Bloom Level"
            value={data.blooms_progression?.highest_level_reached || 'N/A'}
            icon={<TrendingUp />}
            color={data.blooms_progression?.highest_level_reached ? getBloomLevelColor(data.blooms_progression.highest_level_reached) : '#9E9E9E'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conversation Date"
            value={data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}
            icon={<AutoStories />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Bloom's Taxonomy Progression */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1 }} />
          Bloom&apos;s Taxonomy Progression
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pattern: <strong>{data.blooms_progression.pattern.replace(/_/g, ' ').toUpperCase()}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {data.blooms_progression.pattern_explanation}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Dominant Levels:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {data.blooms_progression.dominant_levels.map((level) => (
              <Chip
                key={level}
                label={level}
                sx={{
                  backgroundColor: getBloomLevelColor(level),
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Knowledge Building */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Insights sx={{ mr: 1 }} />
          Knowledge Building Patterns
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {Object.entries(data.knowledge_building).map(([key, indicator]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </Typography>
                    <Chip
                      label={indicator.detected ? 'Detected' : 'Not Detected'}
                      size="small"
                      color={indicator.detected ? 'success' : 'default'}
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {indicator.explanation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Topics */}
      {data.topics && data.topics.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Topics Discussed
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {data.topics.map((topic, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">{topic.topic}</Typography>
                    <Chip
                      label={`${topic.depth} depth`}
                      size="small"
                      color={
                        topic.depth === 'deep'
                          ? 'success'
                          : topic.depth === 'moderate'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {topic.question_count} question{topic.question_count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Interpretation */}
      <Alert severity="info" icon={<Insights />}>
        <Typography variant="subtitle2" gutterBottom>
          Overall Interpretation
        </Typography>
        <Typography variant="body2">{data.interpretation}</Typography>
      </Alert>
    </Box>
  );
};

// Multiple Conversations Results Component
const MultipleConversationsResults: React.FC<{
  data: MultipleConversationsAnalysis;
}> = ({ data }) => {
  // Debug: Log the data structure to console
  console.log('Multiple Conversations Analysis Data:', data);
  console.log('Individual Analyses:', data.individual_analyses);

  // Defensive checks for undefined/null data
  if (!data) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2">No analysis data available</Typography>
        <Typography variant="body2">The API response was empty or invalid.</Typography>
      </Alert>
    );
  }

  if (!data.engagement || !data.progression_analysis) {
    return (
      <Alert severity="error">
        <Typography variant="subtitle2">Incomplete analysis data</Typography>
        <Typography variant="body2">
          Missing required fields in API response. Please try again or check the conversation IDs.
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" component="pre" sx={{ fontSize: '10px' }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Analysis Status Alert */}
      {(data.failed_analyses || 0) > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Partial Analysis Completed
          </Typography>
          <Typography variant="body2">
            {data.successful_analyses || 0} of {data.total_conversations || 0} conversations analyzed successfully.
            {data.failed_analyses || 0} failed.
          </Typography>
        </Alert>
      )}

      {/* Overview Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Conversations"
            value={data.total_conversations || 0}
            subtitle={`${data.successful_analyses || 0} successful${(data.failed_analyses || 0) > 0 ? `, ${data.failed_analyses} failed` : ''}`}
            icon={<AutoStories />}
            color={(data.failed_analyses || 0) > 0 ? '#FF9800' : '#2196F3'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Questions"
            value={data.total_questions || 0}
            subtitle={`Avg: ${(data.engagement?.avg_questions_per_conversation || 0).toFixed(1)}`}
            icon={<Quiz />}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Overall Engagement"
            value={data.engagement?.overall_engagement_level?.toUpperCase() || 'N/A'}
            icon={<Psychology />}
            color={data.engagement?.overall_engagement_level ? getEngagementColor(data.engagement.overall_engagement_level) : '#9E9E9E'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Learning Trajectory"
            value={data.progression_analysis?.learning_trajectory?.toUpperCase() || 'N/A'}
            icon={getTrajectoryIcon(data.progression_analysis?.learning_trajectory || '')}
            color={
              data.progression_analysis?.learning_trajectory?.includes('improving')
                ? '#4CAF50'
                : data.progression_analysis?.learning_trajectory?.includes('declining')
                ? '#F44336'
                : '#FF9800'
            }
          />
        </Grid>
      </Grid>

      {/* Progression Analysis */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1 }} />
          Learning Progression
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Trajectory Explanation:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {data.progression_analysis?.trajectory_explanation || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pattern Evolution:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {data.progression_analysis?.pattern_evolution || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bloom Level Progression:
          </Typography>
          <Typography variant="body2">
            {data.progression_analysis?.bloom_level_progression || 'N/A'}
          </Typography>
        </Box>

        {/* Mastery Indicators */}
        {data.progression_analysis?.mastery_indicators && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mastery Indicators:
            </Typography>
            <Alert
              severity={data.progression_analysis.mastery_indicators.detected ? 'success' : 'info'}
              sx={{ mt: 1 }}
            >
              <Typography variant="body2">
                {data.progression_analysis.mastery_indicators.explanation || 'N/A'}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Topic Depth Analysis */}
        {data.progression_analysis?.topic_depth_analysis && 
         Object.keys(data.progression_analysis.topic_depth_analysis).length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Topic Depth Analysis:
            </Typography>
            {(() => {
              console.log('Topic Depth Analysis Data:', data.progression_analysis.topic_depth_analysis);
              return null;
            })()}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(data.progression_analysis.topic_depth_analysis).map(([topic, analysis]) => {
                // Type guard and defensive check
                const topicAnalysis = analysis as { progression?: string; total_questions?: number } | string;
                const hasProgression = topicAnalysis && typeof topicAnalysis === 'object' && 'progression' in topicAnalysis;
                const hasTotalQuestions = topicAnalysis && typeof topicAnalysis === 'object' && 'total_questions' in topicAnalysis;

                return (
                  <Grid item xs={12} sm={6} key={topic}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {topic}
                        </Typography>
                        {hasTotalQuestions && (
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Total Questions: <strong>{topicAnalysis.total_questions}</strong>
                          </Typography>
                        )}
                        {hasProgression && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {topicAnalysis.progression}
                          </Typography>
                        )}
                        {!hasProgression && !hasTotalQuestions && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {typeof topicAnalysis === 'string' ? topicAnalysis : 'No additional details available'}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Key Insights */}
      {data.insights && data.insights.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Insights sx={{ mr: 1 }} />
            Key Insights
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {data.insights.map((insight, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${index + 1}. ${insight}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Overall Interpretation */}
      <Alert severity="info" icon={<Insights />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Overall Interpretation
        </Typography>
        <Typography variant="body2">{data.interpretation}</Typography>
      </Alert>

      {/* Individual Conversations Summary */}
      {data.individual_analyses && data.individual_analyses.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Individual Conversations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box>
            {data.individual_analyses.map((analysis, index) => {
              // Defensive check: Skip conversations with missing critical data
              if (!analysis || !analysis.conversation_id) {
                return null;
              }

              // Check if this is a failed analysis
              const isSuccess = isSuccessfulAnalysis(analysis);

              return (
                <Card key={analysis.conversation_id} sx={{ mb: 2 }} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Conversation {index + 1} - {analysis.conversation_id}
                    </Typography>
                    {!isSuccess && 'error' in analysis && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        {analysis.error}
                      </Alert>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Questions
                        </Typography>
                        <Typography variant="body2">{analysis.total_questions || 0}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Engagement
                        </Typography>
                        <Typography variant="body2">
                          {isSuccess ? analysis.engagement.engagement_level : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Highest Level
                        </Typography>
                        {isSuccess ? (
                          <Chip
                            label={analysis.blooms_progression.highest_level_reached}
                            size="small"
                            sx={{
                              backgroundColor: getBloomLevelColor(
                                analysis.blooms_progression.highest_level_reached
                              ),
                              color: 'white',
                            }}
                          />
                        ) : (
                          <Typography variant="body2">N/A</Typography>
                        )}
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body2">
                          {isSuccess ? new Date(analysis.date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Main Component
const ConversationAnalysisResults: React.FC<ConversationAnalysisResultsProps> = ({
  data,
  analysisType,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      {analysisType === 'single' ? (
        <SingleConversationResults data={data as SingleConversationAnalysis} />
      ) : (
        <MultipleConversationsResults data={data as MultipleConversationsAnalysis} />
      )}
    </Box>
  );
};

export default ConversationAnalysisResults;

