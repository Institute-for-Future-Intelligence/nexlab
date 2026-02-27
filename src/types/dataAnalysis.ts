// src/types/dataAnalysis.ts

/**
 * Data Analysis Types for Lab Notebook
 * Supports CSV data import, statistical analysis, and visualization
 */

// ============================================================================
// Core Data Types
// ============================================================================

export interface DataPoint {
  [key: string]: string | number | null;
}

export interface DataColumn {
  key: string;
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  stats?: ColumnStatistics | null;
}

export interface ColumnStatistics {
  count: number;
  nullCount: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  uniqueValues?: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
  fileUrl: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  data: DataPoint[]; // Only used in memory, not saved to Firestore
  tags: string[];
}

// Dataset metadata stored in Firestore (without heavy data array)
export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
  fileUrl: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: DataColumn[];
  tags: string[];
  // Note: data array NOT included to stay under 1MB Firestore limit
}

// Convert Dataset to metadata (for Firestore storage)
export function toDatasetMetadata(dataset: Dataset): DatasetMetadata {
  const { data, ...metadata } = dataset;
  return metadata;
}

// ============================================================================
// Analysis Types
// ============================================================================

export type AnalysisType = 
  | 'linear_regression' 
  | 'multiple_regression'
  | 'logistic_regression'
  | 'polynomial_regression'
  | 'correlation'
  | 'descriptive_stats'
  | 'hypothesis_test'
  | 'anova'
  | 'classification'
  | 'ml_classification'      // ML: Decision Tree, Random Forest, etc.
  | 'ml_regression';          // ML: Supervised regression models

export interface AnalysisConfig {
  type: AnalysisType;
  datasetId: string;
  targetVariable?: string;  // Y variable
  featureVariables: string[];  // X variable(s)
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  polynomialDegree?: number;
  confidenceLevel?: number;
  testType?: 'tTest' | 'zTest' | 'chiSquare';
  includeIntercept?: boolean;
  splitRatio?: number;  // For train/test split (default: 0.8 = 80% training)
  splitStrategy?: 'random' | 'stratified';  // Stratified for classification
  randomSeed?: number;  // For reproducibility
  removeOutliers?: boolean;
  normalizeData?: boolean;
  
  // ML-specific options
  mlAlgorithm?: 'decision_tree' | 'random_forest' | 'logistic' | 'naive_bayes' | 'knn';
  maxDepth?: number;  // For tree-based models
  nEstimators?: number;  // For random forest (default: 100)
  kNeighbors?: number;  // For KNN (default: 5)
  minSamplesLeaf?: number;  // For decision trees (default: 1)
  crossValidationFolds?: number;  // K-fold cross-validation
}

// ============================================================================
// Analysis Results
// ============================================================================

export interface LinearRegressionResult {
  type: 'linear_regression';
  equation: string;
  slope: number;
  intercept: number;
  rSquared: number;
  adjustedRSquared?: number;
  correlation: number;
  pValue: number;
  standardError: number;
  predictions: Array<{ x: number; y: number; yPredicted: number; residual: number }>;
  residuals: number[];
  summary: string;
  significanceLevel: 'highly_significant' | 'significant' | 'not_significant';
}

export interface MultipleRegressionResult {
  type: 'multiple_regression';
  equation: string;
  coefficients: Array<{ variable: string; coefficient: number; pValue: number; significant: boolean }>;
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  fPValue: number;
  predictions: Array<{ actual: number; predicted: number; residual: number }>;
  residualPlot: Array<{ predicted: number; residual: number }>;
  summary: string;
}

export interface LogisticRegressionResult {
  type: 'logistic_regression';
  equation: string;
  coefficients: Array<{ variable: string; coefficient: number; oddsRatio: number; pValue: number }>;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  rocCurve?: Array<{ fpr: number; tpr: number }>;
  auc?: number;
  summary: string;
}

export interface CorrelationResult {
  type: 'correlation';
  correlationMatrix: Array<{ var1: string; var2: string; correlation: number; pValue: number }>;
  heatmapData: Array<{ x: string; y: string; value: number }>;
  strongCorrelations: Array<{ pair: string; correlation: number; interpretation: string }>;
  summary: string;
}

export interface DescriptiveStatsResult {
  type: 'descriptive_stats';
  variables: Array<{
    name: string;
    count: number;
    mean: number;
    median: number;
    mode?: number;
    std: number;
    variance: number;
    min: number;
    max: number;
    range: number;
    q1: number;
    q3: number;
    iqr: number;
    skewness?: number;
    kurtosis?: number;
  }>;
  summary: string;
}

// ============================================================================
// Machine Learning Results
// ============================================================================

export interface MLClassificationResult {
  type: 'ml_classification';
  algorithm: string;
  trainingSize: number;
  testSize: number;
  splitRatio: number;
  
  // Model Performance
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  
  // Confusion Matrix
  confusionMatrix: {
    matrix: number[][];
    labels: string[];
  };
  
  // Classification Report
  classificationReport: Array<{
    class: string;
    precision: number;
    recall: number;
    f1Score: number;
    support: number;
  }>;
  
  // Feature Importance (if available)
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
  
  // Predictions
  predictions: {
    training: Array<{ actual: string | number; predicted: string | number }>;
    testing: Array<{ actual: string | number; predicted: string | number }>;
  };
  
  // Cross-validation results (if performed)
  crossValidation?: {
    folds: number;
    scores: number[];
    meanScore: number;
    stdScore: number;
  };
  
  summary: string;
  recommendations: string[];
}

export interface MLRegressionResult {
  type: 'ml_regression';
  algorithm: string;
  trainingSize: number;
  testSize: number;
  splitRatio: number;
  
  // Model Performance
  rSquared: {
    training: number;
    testing: number;
  };
  mse: {
    training: number;
    testing: number;
  };
  rmse: {
    training: number;
    testing: number;
  };
  mae: {
    training: number;
    testing: number;
  };
  
  // Feature Importance (if available)
  featureImportance?: Array<{
    feature: string;
    importance: number;
  }>;
  
  // Predictions
  predictions: {
    training: Array<{ actual: number; predicted: number; residual: number }>;
    testing: Array<{ actual: number; predicted: number; residual: number }>;
  };
  
  // Residual plots data
  residualPlots: {
    training: Array<{ predicted: number; residual: number }>;
    testing: Array<{ predicted: number; residual: number }>;
  };
  
  // Cross-validation results (if performed)
  crossValidation?: {
    folds: number;
    scores: number[];
    meanScore: number;
    stdScore: number;
  };
  
  summary: string;
  recommendations: string[];
}

export type AnalysisResult = 
  | LinearRegressionResult 
  | MultipleRegressionResult
  | LogisticRegressionResult
  | CorrelationResult
  | DescriptiveStatsResult
  | MLClassificationResult
  | MLRegressionResult;

// ============================================================================
// Saved Analysis
// ============================================================================

export interface SavedAnalysis {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  datasetId: string;
  config: AnalysisConfig;
  result: AnalysisResult;
  notes?: string;
  tags?: string[];
}

// ============================================================================
// Data Analysis State (for Designs, Builds, Tests)
// ============================================================================

export interface DataAnalysisSection {
  datasets: DatasetMetadata[]; // Metadata only (no heavy data arrays)
  analyses: SavedAnalysis[];
}

// ============================================================================
// Visualization Types
// ============================================================================

export interface ChartConfig {
  type: 'scatter' | 'line' | 'bar' | 'histogram' | 'box' | 'heatmap' | 'residual';
  title: string;
  xAxis: {
    label: string;
    variable: string;
  };
  yAxis: {
    label: string;
    variable: string;
  };
  series?: Array<{
    name: string;
    data: Array<{ x: number; y: number }>;
    color?: string;
  }>;
  regressionLine?: {
    data: Array<{ x: number; y: number }>;
    equation: string;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface DataValidationError {
  row?: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface DataValidationResult {
  isValid: boolean;
  errors: DataValidationError[];
  warnings: DataValidationError[];
  summary: string;
}

export interface DataTransformation {
  type: 'normalize' | 'standardize' | 'log' | 'sqrt' | 'removeOutliers' | 'fillMissing';
  column: string;
  parameters?: Record<string, any>;
}

// ============================================================================
// Export Format
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  includeRawData: boolean;
  includeVisualizations: boolean;
  includeStatistics: boolean;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isLinearRegression(result: AnalysisResult): result is LinearRegressionResult {
  return result.type === 'linear_regression';
}

export function isMultipleRegression(result: AnalysisResult): result is MultipleRegressionResult {
  return result.type === 'multiple_regression';
}

export function isLogisticRegression(result: AnalysisResult): result is LogisticRegressionResult {
  return result.type === 'logistic_regression';
}

export function isCorrelation(result: AnalysisResult): result is CorrelationResult {
  return result.type === 'correlation';
}

export function isDescriptiveStats(result: AnalysisResult): result is DescriptiveStatsResult {
  return result.type === 'descriptive_stats';
}

export function isMLClassification(result: AnalysisResult): result is MLClassificationResult {
  return result.type === 'ml_classification';
}

export function isMLRegression(result: AnalysisResult): result is MLRegressionResult {
  return result.type === 'ml_regression';
}
