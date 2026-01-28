// src/components/LaboratoryNotebookV2/DataAnalysis/AnalysisVisualization.tsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { colors, typography, borderRadius } from '../../../config/designSystem';
import {
  AnalysisResult,
  LinearRegressionResult,
  DescriptiveStatsResult,
  CorrelationResult,
  MLClassificationResult,
  MLRegressionResult,
  isLinearRegression,
  isDescriptiveStats,
  isCorrelation,
  isMLClassification,
  isMLRegression,
} from '../../../types/dataAnalysis';

interface AnalysisVisualizationProps {
  result: AnalysisResult;
}

const AnalysisVisualization: React.FC<AnalysisVisualizationProps> = ({ result }) => {
  if (isLinearRegression(result)) {
    return <LinearRegressionView result={result} />;
  }
  
  if (isDescriptiveStats(result)) {
    return <DescriptiveStatsView result={result} />;
  }
  
  if (isCorrelation(result)) {
    return <CorrelationView result={result} />;
  }

  if (isMLRegression(result)) {
    return <MLRegressionView result={result} />;
  }

  if (isMLClassification(result)) {
    return <MLClassificationView result={result} />;
  }

  return (
    <Box>
      <Typography>Visualization not yet implemented for this analysis type</Typography>
    </Box>
  );
};

// ============================================================================
// Linear Regression Visualization
// ============================================================================

const LinearRegressionView: React.FC<{ result: LinearRegressionResult }> = ({ result }) => {
  // Prepare scatter plot data with regression line
  const scatterData = result.predictions.map((p) => ({
    x: p.x,
    y: p.y,
    yPredicted: p.yPredicted,
  }));

  // Prepare residual plot data
  const residualData = result.predictions.map((p, idx) => ({
    index: idx + 1,
    residual: p.residual,
    predicted: p.yPredicted,
  }));

  const getSignificanceColor = () => {
    if (result.significanceLevel === 'highly_significant') return colors.success;
    if (result.significanceLevel === 'significant') return colors.warning;
    return colors.error;
  };

  const getSignificanceIcon = () => {
    if (result.significanceLevel === 'highly_significant') return <CheckIcon />;
    if (result.significanceLevel === 'significant') return <WarningIcon />;
    return <InfoIcon />;
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: borderRadius.md }}>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              R² Value
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary[500] }}>
              {result.rSquared.toFixed(4)}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              {(result.rSquared * 100).toFixed(1)}% variance explained
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: borderRadius.md }}>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Correlation
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colors.secondary[500] }}>
              {result.correlation.toFixed(4)}
            </Typography>
            <Chip
              label={result.slope > 0 ? 'Positive' : 'Negative'}
              size="small"
              icon={result.slope > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              sx={{ mt: 0.5 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: borderRadius.md }}>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Slope
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {result.slope.toFixed(4)}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Intercept: {result.intercept.toFixed(4)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: borderRadius.md }}>
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>
              Significance
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: getSignificanceColor(),
                textTransform: 'capitalize',
              }}
            >
              {result.significanceLevel.replace('_', ' ')}
            </Typography>
            <Chip
              label={`p = ${result.pValue < 0.001 ? '<0.001' : result.pValue.toFixed(3)}`}
              size="small"
              icon={getSignificanceIcon()}
              sx={{ mt: 0.5 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Equation */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: colors.primary[50],
          borderRadius: borderRadius.md,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mb: 1 }}>
          Regression Equation
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            color: colors.primary[700],
          }}
        >
          {result.equation}
        </Typography>
      </Paper>

      {/* Scatter Plot with Regression Line */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontFamily: typography.fontFamily.display, fontWeight: 600 }}
        >
          Scatter Plot with Regression Line
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              stroke={colors.text.secondary}
              label={{ value: 'X Variable', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              stroke={colors.text.secondary}
              label={{ value: 'Y Variable', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: colors.background.primary,
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: borderRadius.sm,
              }}
            />
            <Legend />
            <Scatter name="Actual Data" data={scatterData} fill={colors.primary[500]} />
            <Scatter
              name="Regression Line"
              data={scatterData}
              fill={colors.secondary[500]}
              line
              lineType="fitting"
              dataKey="yPredicted"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>

      {/* Residual Plot */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontFamily: typography.fontFamily.display, fontWeight: 600 }}
        >
          Residual Plot
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
            <XAxis
              type="number"
              dataKey="predicted"
              name="Predicted"
              stroke={colors.text.secondary}
              label={{ value: 'Predicted Values', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="residual"
              name="Residual"
              stroke={colors.text.secondary}
              label={{ value: 'Residuals', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: colors.background.primary,
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: borderRadius.sm,
              }}
            />
            <ReferenceLine y={0} stroke={colors.error} strokeDasharray="3 3" />
            <Scatter name="Residuals" data={residualData} fill={colors.warning} />
          </ScatterChart>
        </ResponsiveContainer>
        <Typography variant="caption" sx={{ color: colors.text.secondary, display: 'block', mt: 1 }}>
          Residuals should be randomly scattered around zero for a good fit
        </Typography>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 3, borderRadius: borderRadius.md }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontFamily: typography.fontFamily.display, fontWeight: 600 }}
        >
          Interpretation
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary, lineHeight: 1.6 }}>
          {result.summary}
        </Typography>
      </Paper>
    </Box>
  );
};

// ============================================================================
// Descriptive Statistics Visualization
// ============================================================================

const DescriptiveStatsView: React.FC<{ result: DescriptiveStatsResult }> = ({ result }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontFamily: typography.fontFamily.display, fontWeight: 600 }}
      >
        Descriptive Statistics
      </Typography>

      {result.variables.map((variable, idx) => (
        <Paper key={variable.name} sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {variable.name}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                  Mean
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {variable.mean.toFixed(3)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                  Median
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {variable.median.toFixed(3)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                  Std Dev
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {variable.std.toFixed(3)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                  Count
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {variable.count}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                Min: <strong>{variable.min.toFixed(3)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                Q1: <strong>{variable.q1.toFixed(3)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                Q3: <strong>{variable.q3.toFixed(3)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                Max: <strong>{variable.max.toFixed(3)}</strong>
              </Typography>
            </Grid>
          </Grid>

          {/* Box Plot Visualization */}
          <Box sx={{ mt: 3, height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[variable]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="mean" fill={colors.primary[500]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      ))}

      {/* Summary */}
      <Paper sx={{ p: 3, borderRadius: borderRadius.md, backgroundColor: colors.primary[50] }}>
        <Typography variant="body2" sx={{ color: colors.text.primary }}>
          {result.summary}
        </Typography>
      </Paper>
    </Box>
  );
};

// ============================================================================
// Correlation Visualization
// ============================================================================

const CorrelationView: React.FC<{ result: CorrelationResult }> = ({ result }) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontFamily: typography.fontFamily.display, fontWeight: 600 }}
      >
        Correlation Analysis
      </Typography>

      {/* Strong Correlations */}
      {result.strongCorrelations.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Strong Correlations (|r| &gt; 0.7)
          </Typography>
          <Stack spacing={2}>
            {result.strongCorrelations.map((corr, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  backgroundColor:
                    corr.correlation > 0 ? colors.success + '15' : colors.error + '15',
                  borderRadius: borderRadius.sm,
                  borderLeft: `4px solid ${corr.correlation > 0 ? colors.success : colors.error}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {corr.pair}
                  </Typography>
                  <Chip
                    label={`r = ${corr.correlation.toFixed(3)}`}
                    size="small"
                    sx={{
                      backgroundColor: corr.correlation > 0 ? colors.success : colors.error,
                      color: '#fff',
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: colors.text.secondary, mt: 0.5 }}>
                  {corr.interpretation}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Correlation Matrix Table */}
      <Paper sx={{ borderRadius: borderRadius.md, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.neutral[100] }}>
                <TableCell sx={{ fontWeight: 700 }}>Variable 1</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Variable 2</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Correlation
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  p-value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.correlationMatrix.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>{row.var1}</TableCell>
                  <TableCell>{row.var2}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={row.correlation.toFixed(3)}
                      size="small"
                      sx={{
                        backgroundColor:
                          Math.abs(row.correlation) > 0.7
                            ? row.correlation > 0
                              ? colors.success + '30'
                              : colors.error + '30'
                            : colors.neutral[100],
                        fontFamily: 'monospace',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {row.pValue < 0.001 ? '<0.001' : row.pValue.toFixed(3)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 3, mt: 3, borderRadius: borderRadius.md, backgroundColor: colors.primary[50] }}>
        <Typography variant="body2" sx={{ color: colors.text.primary }}>
          {result.summary}
        </Typography>
      </Paper>
    </Box>
  );
};

// ============================================================================
// Machine Learning Visualizations
// ============================================================================

const MLRegressionView: React.FC<{ result: MLRegressionResult }> = ({ result }) => {
  return (
    <Box>
      {/* Model Info Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.primary[50], borderRadius: borderRadius.md }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
          <Chip label={result.algorithm} color="primary" />
          <Chip label={`Train/Test: ${(result.splitRatio * 100).toFixed(0)}/${(100 - result.splitRatio * 100).toFixed(0)}`} variant="outlined" />
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Training Samples</Typography>
            <Typography variant="h5" fontWeight="bold">{result.trainingSize}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Testing Samples</Typography>
            <Typography variant="h5" fontWeight="bold">{result.testSize}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Model Performance Metrics */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Model Performance
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Training</TableCell>
                <TableCell align="right">Testing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>R² Score</TableCell>
                <TableCell align="right">{result.rSquared.training.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{result.rSquared.testing.toFixed(4)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>MSE</TableCell>
                <TableCell align="right">{result.mse.training.toFixed(4)}</TableCell>
                <TableCell align="right">{result.mse.testing.toFixed(4)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>RMSE</TableCell>
                <TableCell align="right">{result.rmse.training.toFixed(4)}</TableCell>
                <TableCell align="right">{result.rmse.testing.toFixed(4)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>MAE</TableCell>
                <TableCell align="right">{result.mae.training.toFixed(4)}</TableCell>
                <TableCell align="right">{result.mae.testing.toFixed(4)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Feature Importance */}
      {result.featureImportance && result.featureImportance.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
            Feature Importance
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: colors.text.secondary }}>
            Based on correlation with target variable (higher = more important)
          </Typography>

          <ResponsiveContainer width="100%" height={Math.max(200, result.featureImportance.length * 50)}>
            <BarChart data={result.featureImportance} layout="vertical" margin={{ left: 150, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
              <XAxis type="number" domain={[0, 1]} label={{ value: 'Importance Score', position: 'bottom' }} />
              <YAxis type="category" dataKey="feature" width={140} />
              <Tooltip />
              <Bar dataKey="importance">
                {result.featureImportance.map((entry, index) => {
                  // Calculate color intensity based on importance (0-1)
                  const importance = entry.importance;
                  const maxImportance = result.featureImportance![0].importance; // Highest (already sorted)
                  const relativeImportance = maxImportance > 0 ? importance / maxImportance : 0;
                  
                  // Color scale: High importance = darker/more saturated
                  let fillColor;
                  if (relativeImportance > 0.85) {
                    fillColor = colors.success; // Top tier: Green (>85% of max)
                  } else if (relativeImportance > 0.65) {
                    fillColor = colors.primary[600]; // High tier: Dark blue (65-85%)
                  } else if (relativeImportance > 0.45) {
                    fillColor = colors.primary[500]; // Medium tier: Blue (45-65%)
                  } else if (relativeImportance > 0.25) {
                    fillColor = colors.primary[400]; // Low tier: Light blue (25-45%)
                  } else {
                    fillColor = colors.neutral[300]; // Very low: Gray (<25%)
                  }
                  
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.success, borderRadius: 1 }} />
              <Typography variant="caption">Top (&gt;85%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.primary[600], borderRadius: 1 }} />
              <Typography variant="caption">High (65-85%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.primary[500], borderRadius: 1 }} />
              <Typography variant="caption">Medium (45-65%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.primary[400], borderRadius: 1 }} />
              <Typography variant="caption">Low (25-45%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.neutral[300], borderRadius: 1 }} />
              <Typography variant="caption">Very Low (&lt;25%)</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Cross-Validation Results */}
      {result.crossValidation && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md, backgroundColor: colors.secondary[50] }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
            {result.crossValidation.folds}-Fold Cross-Validation Results
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#fff', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Mean R² Score</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {result.crossValidation.meanScore.toFixed(4)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, backgroundColor: '#fff', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Standard Deviation</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ± {result.crossValidation.stdScore.toFixed(4)}
                </Typography>
                {result.crossValidation.stdScore > 0.1 && (
                  <Chip label="High Variance" color="warning" size="small" sx={{ mt: 1 }} />
                )}
              </Paper>
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Individual Fold Scores:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {result.crossValidation.scores.map((score, idx) => (
              <Chip
                key={idx}
                label={`Fold ${idx + 1}: ${score.toFixed(4)}`}
                size="small"
                color={score > result.crossValidation!.meanScore ? 'success' : 'default'}
              />
            ))}
          </Stack>

          <Alert severity="info">
            <Typography variant="caption">
              <strong>What is Cross-Validation?</strong> Instead of one train/test split, CV creates {result.crossValidation.folds} different splits.
              Each fold is tested once while training on the others. This gives a more reliable estimate of how well your model will perform on new data.
              {result.crossValidation.stdScore > 0.1 && ' High standard deviation indicates the model&apos;s performance varies significantly depending on which data is used for training.'}
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Summary & Recommendations */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{result.summary}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Recommendations</Typography>
        <Stack spacing={1}>
          {result.recommendations.map((rec, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 18, color: colors.primary[500], mt: 0.3 }} />
              <Typography variant="body2">{rec}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

const MLClassificationView: React.FC<{ result: MLClassificationResult }> = ({ result }) => {
  // Deserialize confusion matrix if it was serialized for Firestore
  const confusionMatrix = React.useMemo(() => {
    const matrix = result.confusionMatrix.matrix as any;
    
    // Check if matrix was serialized (has _type: 'nested_array')
    if (matrix && typeof matrix === 'object' && matrix._type === 'nested_array') {
      // Deserialize: {_type: 'nested_array', rows: [{values: [1,0]}, {values: [0,1]}]} → [[1,0], [0,1]]
      return matrix.rows.map((row: any) => row.values);
    }
    
    // Already in correct format
    return matrix;
  }, [result.confusionMatrix.matrix]);

  // Format confusion matrix for heatmap visualization
  const confusionData = confusionMatrix.flatMap((row: number[], i: number) =>
    row.map((value, j) => ({
      actual: result.confusionMatrix.labels[i],
      predicted: result.confusionMatrix.labels[j],
      count: value,
    }))
  );

  return (
    <Box>
      {/* Model Info Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.primary[50], borderRadius: borderRadius.md }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
          <Chip label={result.algorithm} color="primary" />
          <Chip label={`Train/Test: ${(result.splitRatio * 100).toFixed(0)}/${(100 - result.splitRatio * 100).toFixed(0)}`} variant="outlined" />
          <Chip
            label={`Accuracy: ${(result.accuracy * 100).toFixed(2)}%`}
            color={result.accuracy > 0.7 ? 'success' : 'warning'}
            icon={result.accuracy > 0.7 ? <CheckIcon /> : <WarningIcon />}
          />
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Training Samples</Typography>
            <Typography variant="h5" fontWeight="bold">{result.trainingSize}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Testing Samples</Typography>
            <Typography variant="h5" fontWeight="bold">{result.testSize}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Metrics */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Model Performance Metrics
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: colors.primary[50] }}>
              <Typography variant="body2" color="text.secondary">Accuracy</Typography>
              <Typography variant="h5" fontWeight="bold">{(result.accuracy * 100).toFixed(2)}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: colors.secondary[50] }}>
              <Typography variant="body2" color="text.secondary">Precision</Typography>
              <Typography variant="h5" fontWeight="bold">{(result.precision * 100).toFixed(2)}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: colors.success[50] }}>
              <Typography variant="body2" color="text.secondary">Recall</Typography>
              <Typography variant="h5" fontWeight="bold">{(result.recall * 100).toFixed(2)}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: colors.warning[50] }}>
              <Typography variant="body2" color="text.secondary">F1 Score</Typography>
              <Typography variant="h5" fontWeight="bold">{(result.f1Score * 100).toFixed(2)}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Classification Report */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Per-Class Performance
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell align="right">Precision</TableCell>
                <TableCell align="right">Recall</TableCell>
                <TableCell align="right">F1 Score</TableCell>
                <TableCell align="right">Support</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.classificationReport.map((row) => (
                <TableRow key={row.class}>
                  <TableCell>{row.class}</TableCell>
                  <TableCell align="right">{(row.precision * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{(row.recall * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{(row.f1Score * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{row.support}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confusion Matrix */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Confusion Matrix
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Actual \ Predicted</TableCell>
                {result.confusionMatrix.labels.map((label) => (
                  <TableCell key={label} align="center">{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {confusionMatrix.map((row: number[], i: number) => (
                <TableRow key={i}>
                  <TableCell>{result.confusionMatrix.labels[i]}</TableCell>
                  {row.map((value: number, j: number) => (
                    <TableCell
                      key={j}
                      align="center"
                      sx={{
                        backgroundColor: i === j ? colors.success[50] : colors.neutral[50],
                        fontWeight: i === j ? 600 : 400,
                      }}
                    >
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Feature Importance */}
      {result.featureImportance && result.featureImportance.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
            Feature Importance
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: colors.text.secondary }}>
            Which features contribute most to predicting the outcome
          </Typography>

          <ResponsiveContainer width="100%" height={Math.max(200, result.featureImportance.length * 50)}>
            <BarChart data={result.featureImportance} layout="vertical" margin={{ left: 150, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[200]} />
              <XAxis type="number" domain={[0, 1]} label={{ value: 'Importance Score', position: 'bottom' }} />
              <YAxis type="category" dataKey="feature" width={140} />
              <Tooltip />
              <Bar dataKey="importance">
                {result.featureImportance.map((entry, index) => {
                  // Calculate color intensity based on importance (0-1)
                  const importance = entry.importance;
                  const maxImportance = result.featureImportance![0].importance; // Highest (already sorted)
                  const relativeImportance = maxImportance > 0 ? importance / maxImportance : 0;
                  
                  // Color scale: High importance = darker/more saturated
                  let fillColor;
                  if (relativeImportance > 0.85) {
                    fillColor = colors.success; // Top tier: Green (>85% of max)
                  } else if (relativeImportance > 0.65) {
                    fillColor = colors.secondary[600]; // High tier: Dark color (65-85%)
                  } else if (relativeImportance > 0.45) {
                    fillColor = colors.secondary[500]; // Medium tier: Medium color (45-65%)
                  } else if (relativeImportance > 0.25) {
                    fillColor = colors.secondary[400]; // Low tier: Light color (25-45%)
                  } else {
                    fillColor = colors.neutral[300]; // Very low: Gray (<25%)
                  }
                  
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="caption">
              <strong>Key Insight:</strong> Focus on the top features for the most predictive power.
              Features with importance &gt; 0.7 have strong predictive value.
            </Typography>
          </Alert>
          
          {/* Legend */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.success, borderRadius: 1 }} />
              <Typography variant="caption">Top (&gt;85%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.secondary[600], borderRadius: 1 }} />
              <Typography variant="caption">High (65-85%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.secondary[500], borderRadius: 1 }} />
              <Typography variant="caption">Medium (45-65%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.secondary[400], borderRadius: 1 }} />
              <Typography variant="caption">Low (25-45%)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 16, height: 16, backgroundColor: colors.neutral[300], borderRadius: 1 }} />
              <Typography variant="caption">Very Low (&lt;25%)</Typography>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Summary & Recommendations */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: borderRadius.md }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: typography.fontFamily.display }}>
          Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{result.summary}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Recommendations</Typography>
        <Stack spacing={1}>
          {result.recommendations.map((rec, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <InfoIcon sx={{ fontSize: 18, color: colors.primary[500], mt: 0.3 }} />
              <Typography variant="body2">{rec}</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default AnalysisVisualization;
