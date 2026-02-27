// src/components/LaboratoryNotebookV2/DataAnalysis/DataAnalysisPanel.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Chip,
  Checkbox,
  ListItemText,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  TableChart as TableIcon,
  Science as ScienceIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import { colors, typography, borderRadius } from '../../../config/designSystem';
import { Dataset, DatasetMetadata, AnalysisType, SavedAnalysis, AnalysisResult } from '../../../types/dataAnalysis';
import { dataAnalysisService } from '../../../services/dataAnalysisService';
import CSVUploadSection from './CSVUploadSection';
import AnalysisVisualization from './AnalysisVisualization';

interface DataAnalysisPanelProps {
  userId: string;
  nodeId: string;
  nodeType: 'design' | 'build' | 'test';
  existingDatasets?: DatasetMetadata[]; // Metadata only from Firestore
  existingAnalyses?: SavedAnalysis[];
  onSaveDataset: (dataset: Dataset) => void;
  onSaveAnalysis: (analysis: SavedAnalysis) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const DataAnalysisPanel: React.FC<DataAnalysisPanelProps> = ({
  userId,
  nodeId,
  nodeType,
  existingDatasets = [],
  existingAnalyses = [],
  onSaveDataset,
  onSaveAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata[]>(existingDatasets);
  const [loadedDatasets, setLoadedDatasets] = useState<Map<string, Dataset>>(new Map());
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>(existingAnalyses);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);

  // Sync local state with props when they change (after Firestore refresh)
  React.useEffect(() => {
    console.log('DataAnalysisPanel: Received updated datasets from props:', existingDatasets);
    setDatasetMetadata(existingDatasets);
  }, [existingDatasets]);

  React.useEffect(() => {
    console.log('DataAnalysisPanel: Received updated analyses from props:', existingAnalyses);
    setAnalyses(existingAnalyses);
  }, [existingAnalyses]);

  // Analysis configuration state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('linear_regression');
  const [targetVariable, setTargetVariable] = useState<string>('');
  const [featureVariables, setFeatureVariables] = useState<string[]>([]);
  const [analysisName, setAnalysisName] = useState<string>('');
  const [analysisDescription, setAnalysisDescription] = useState<string>('');
  
  // ML-specific configuration
  const [trainTestSplit, setTrainTestSplit] = useState<number>(80); // 80% training, 20% testing
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [useCrossValidation, setUseCrossValidation] = useState<boolean>(false);
  const [cvFolds, setCvFolds] = useState<number>(5);
  
  // ML algorithm selection and hyperparameters
  const [selectedMLAlgorithm, setSelectedMLAlgorithm] = useState<string>('logistic');
  const [nEstimators, setNEstimators] = useState<number>(100);
  const [maxDepth, setMaxDepth] = useState<number>(10);
  const [kNeighbors, setKNeighbors] = useState<number>(5);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState<number>(1);

  // Analysis results state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Snackbar state for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Helper to convert Firestore Timestamp to Date
  const toDate = (timestamp: unknown): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDatasetUploaded = (dataset: Dataset) => {
    // Add to loaded datasets cache
    setLoadedDatasets((prev) => new Map(prev).set(dataset.id, dataset));
    setSelectedDatasetId(dataset.id);
    onSaveDataset(dataset); // This saves metadata to Firestore
    setActiveTab(1); // Switch to analysis tab
  };

  // Load dataset from URL when selected
  const loadDatasetIfNeeded = React.useCallback(async (datasetId: string): Promise<Dataset | null> => {
    // Check if already loaded in cache
    if (loadedDatasets.has(datasetId)) {
      return loadedDatasets.get(datasetId)!;
    }

    // Find metadata
    const metadata = datasetMetadata.find((d) => d.id === datasetId);
    if (!metadata) return null;

    // Load from Storage URL
    setIsLoadingDataset(true);
    try {
      const fullDataset = await dataAnalysisService.loadDatasetFromURL(metadata);
      setLoadedDatasets((prev) => new Map(prev).set(datasetId, fullDataset));
      return fullDataset;
    } catch (error) {
      console.error('Error loading dataset:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to load dataset');
      return null;
    } finally {
      setIsLoadingDataset(false);
    }
  }, [loadedDatasets, datasetMetadata]);

  // Auto-load dataset when selected
  React.useEffect(() => {
    if (selectedDatasetId && !loadedDatasets.has(selectedDatasetId)) {
      console.log('Auto-loading selected dataset:', selectedDatasetId);
      loadDatasetIfNeeded(selectedDatasetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatasetId]);

  const selectedDataset = selectedDatasetId ? loadedDatasets.get(selectedDatasetId) : undefined;

  // Get available variables with optional filtering
  const getAvailableVariables = (numericOnly: boolean = true): string[] => {
    if (!selectedDatasetId) return [];
    
    // Try to get from loaded dataset first
    const dataset = loadedDatasets.get(selectedDatasetId);
    if (dataset) {
      return numericOnly 
        ? dataset.columns.filter((c) => c.type === 'numeric').map((c) => c.key)
        : dataset.columns.map((c) => c.key);
    }
    
    // Fallback to metadata (columns are stored in metadata)
    const metadata = datasetMetadata.find((d) => d.id === selectedDatasetId);
    if (metadata) {
      return numericOnly
        ? metadata.columns.filter((c) => c.type === 'numeric').map((c) => c.key)
        : metadata.columns.map((c) => c.key);
    }
    
    return [];
  };

  const handleRunAnalysis = async () => {
    if (!selectedDatasetId) {
      setAnalysisError('Please select a dataset first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      // Load dataset if not already loaded
      const dataset = await loadDatasetIfNeeded(selectedDatasetId);
      if (!dataset) {
        throw new Error('Failed to load dataset');
      }

      let result: AnalysisResult;

      switch (analysisType) {
        case 'linear_regression': {
          if (!targetVariable || featureVariables.length === 0) {
            throw new Error('Please select both X and Y variables for linear regression');
          }

          // Validation: Check if both X and Y are numeric
          const xValues = dataset.data.map((row) => Number(row[featureVariables[0]]));
          const yValues = dataset.data.map((row) => Number(row[targetVariable]));
          const validXCount = xValues.filter((v) => !isNaN(v) && isFinite(v)).length;
          const validYCount = yValues.filter((v) => !isNaN(v) && isFinite(v)).length;
          
          if (validXCount < dataset.data.length * 0.9 || validYCount < dataset.data.length * 0.9) {
            throw new Error(
              `⚠️ Linear regression requires NUMERIC variables for both X and Y. ` +
              `One or both selected variables contain non-numeric values.` +
              `\n\nFor categorical targets like "diagnosis", use Classification instead.`
            );
          }

          result = dataAnalysisService.performLinearRegression(
            dataset,
            featureVariables[0],
            targetVariable
          );
          break;
        }

        case 'descriptive_stats':
          if (featureVariables.length === 0) {
            throw new Error('Please select at least one variable for descriptive statistics');
          }
          result = dataAnalysisService.calculateDescriptiveStats(dataset, featureVariables);
          break;

        case 'correlation':
          if (featureVariables.length < 2) {
            throw new Error('Please select at least two variables for correlation analysis');
          }
          result = dataAnalysisService.calculateCorrelations(dataset, featureVariables);
          break;

        case 'ml_regression': {
          if (!targetVariable || featureVariables.length === 0) {
            throw new Error('Please select feature and target variables for ML regression');
          }

          // Validation: Check if target variable is numeric for regression
          const targetValues = dataset.data.map((row) => row[targetVariable]);
          const numericTargetValues = targetValues.filter((v) => {
            const num = Number(v);
            return !isNaN(num) && isFinite(num);
          });
          
          if (numericTargetValues.length < dataset.data.length * 0.9) {
            // Less than 90% of values are numeric - likely categorical
            const sampleValues = Array.from(new Set(targetValues)).slice(0, 5);
            throw new Error(
              `⚠️ The target variable "${targetVariable}" appears to be categorical or text (sample values: ${sampleValues.join(', ')}).` +
              `\n\nRegression requires a NUMERIC target variable.` +
              `\n\nFor categorical targets like "diagnosis" (M/B), use "ML: Classification" instead.` +
              `\n\nFor regression, select a numeric column like: ${dataset.columns.filter(c => c.type === 'numeric').map(c => c.name).slice(0, 5).join(', ')}`
            );
          }

          result = dataAnalysisService.performMLRegression(dataset, featureVariables, targetVariable, {
            splitRatio: trainTestSplit / 100,
            randomSeed,
            crossValidationFolds: useCrossValidation ? cvFolds : undefined,
          });
          break;
        }

        case 'ml_classification': {
          if (!targetVariable || featureVariables.length === 0) {
            throw new Error('Please select feature and target variables for ML classification');
          }

          // Validation: Check if target variable is categorical
          const uniqueTargetValues = new Set(dataset.data.map((row) => row[targetVariable]));
          if (uniqueTargetValues.size > 50) {
            throw new Error(
              `⚠️ The target variable "${targetVariable}" has ${uniqueTargetValues.size} unique values. ` +
              `Classification requires a categorical variable with a small number of classes (typically 2-10). ` +
              `\n\nFor cancer diagnosis, select the "diagnosis" column (with M/B values), not a measurement column like "${targetVariable}".` +
              `\n\nAvailable columns: ${dataset.columns.map(c => c.name).join(', ')}`
            );
          }
          if (uniqueTargetValues.size < 2) {
            throw new Error(
              `⚠️ The target variable "${targetVariable}" has only ${uniqueTargetValues.size} unique value(s). ` +
              `Classification requires at least 2 different classes.`
            );
          }

          result = dataAnalysisService.performMLClassification(dataset, featureVariables, targetVariable, {
            splitRatio: trainTestSplit / 100,
            randomSeed,
            mlAlgorithm: selectedMLAlgorithm as any,
            nEstimators,
            maxDepth,
            kNeighbors,
            minSamplesLeaf,
          });
          break;
        }

        default:
          throw new Error(`Analysis type "${analysisType}" is not yet implemented`);
      }

      setAnalysisResult(result);
      setActiveTab(2); // Switch to results tab
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = () => {
    if (!analysisResult || !selectedDataset) return;

    const savedAnalysis: SavedAnalysis = {
      id: crypto.randomUUID(),
      name: analysisName || `${analysisType} - ${new Date().toLocaleDateString()}`,
      description: analysisDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      datasetId: selectedDatasetId,
      config: {
        type: analysisType,
        datasetId: selectedDatasetId,
        targetVariable,
        featureVariables,
      },
      result: analysisResult,
    };

    const updatedAnalyses = [...analyses, savedAnalysis];
    setAnalyses(updatedAnalyses);
    onSaveAnalysis(savedAnalysis);

    // Reset form
    setAnalysisName('');
    setAnalysisDescription('');
    
    // Show success notification
    setSnackbarMessage('Analysis saved successfully!');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontFamily: typography.fontFamily.display, fontWeight: 700, mb: 1 }}
        >
          Data Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Upload CSV datasets and perform statistical analyses including linear regression,
          descriptive statistics, correlation analysis, and machine learning (Random Forest, Decision Trees, KNN, and more).
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: borderRadius.lg, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${colors.neutral[200]}`,
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
              px: 3,
              mx: 1,
              borderRadius: `${borderRadius.md}px ${borderRadius.md}px 0 0`,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: colors.primary[50],
              },
              '&.Mui-selected': {
                backgroundColor: colors.primary[50],
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<UploadIcon />} iconPosition="start" label="Upload Data" />
          <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Run Analysis" />
          <Tab icon={<TableIcon />} iconPosition="start" label="Results" />
          <Tab icon={<ScienceIcon />} iconPosition="start" label="Saved Analyses" />
        </Tabs>

        {/* Tab 1: Upload Data */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <CSVUploadSection
              userId={userId}
              nodeId={nodeId}
              nodeType={nodeType}
              onDatasetUploaded={handleDatasetUploaded}
              existingDatasets={datasetMetadata}
            />
          </Box>
        </TabPanel>

        {/* Tab 2: Configure Analysis */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            {datasetMetadata.length === 0 ? (
              <Alert severity="info">
                Please upload a dataset first to run analyses.
              </Alert>
            ) : (
              <Stack spacing={3}>
                {/* Dataset Selection */}
                <FormControl fullWidth>
                  <InputLabel>Select Dataset</InputLabel>
                  <Select
                    value={selectedDatasetId}
                    onChange={(e) => {
                      setSelectedDatasetId(e.target.value);
                      setTargetVariable('');
                      setFeatureVariables([]);
                    }}
                    label="Select Dataset"
                  >
                    {datasetMetadata.map((dataset) => (
                      <MenuItem key={dataset.id} value={dataset.id}>
                        {dataset.name} ({dataset.rowCount} rows × {dataset.columnCount} columns)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDataset && (
                  <>
                    <Divider />

                    {/* Analysis Type */}
                    <FormControl fullWidth>
                      <InputLabel>Analysis Type</InputLabel>
                      <Select
                        value={analysisType}
                        onChange={(e) => {
                          setAnalysisType(e.target.value as AnalysisType);
                          setTargetVariable('');
                          setFeatureVariables([]);
                        }}
                        label="Analysis Type"
                      >
                        <MenuItem value="linear_regression">Linear Regression</MenuItem>
                        <MenuItem value="descriptive_stats">Descriptive Statistics</MenuItem>
                        <MenuItem value="correlation">Correlation Analysis</MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 600 }}>
                          Machine Learning (Train/Test Split)
                        </MenuItem>
                        <MenuItem value="ml_regression">ML: Regression with Train/Test</MenuItem>
                        <MenuItem 
                          value="ml_classification"
                          onClick={() => {
                            setAnalysisType('ml_classification');
                            setSelectedMLAlgorithm('logistic');
                          }}
                        >
                          ML: Classification - Logistic Regression
                        </MenuItem>
                        <MenuItem 
                          value="ml_classification_rf"
                          onClick={() => {
                            setAnalysisType('ml_classification');
                            setSelectedMLAlgorithm('random_forest');
                          }}
                        >
                          ML: Classification - Random Forest ⭐
                        </MenuItem>
                        <MenuItem 
                          value="ml_classification_dt"
                          onClick={() => {
                            setAnalysisType('ml_classification');
                            setSelectedMLAlgorithm('decision_tree');
                          }}
                        >
                          ML: Classification - Decision Tree
                        </MenuItem>
                        <MenuItem 
                          value="ml_classification_knn"
                          onClick={() => {
                            setAnalysisType('ml_classification');
                            setSelectedMLAlgorithm('knn');
                          }}
                        >
                          ML: Classification - K-Nearest Neighbors
                        </MenuItem>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem value="multiple_regression" disabled>
                          Multiple Regression (Coming Soon)
                        </MenuItem>
                        <MenuItem value="logistic_regression" disabled>
                          Logistic Regression (Coming Soon)
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {/* Variable Selection */}
                    {analysisType === 'linear_regression' && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel>X Variable (Independent)</InputLabel>
                          <Select
                            value={featureVariables[0] || ''}
                            onChange={(e) => setFeatureVariables([e.target.value])}
                            label="X Variable (Independent)"
                          >
                            {getAvailableVariables(true).map((varName) => (
                              <MenuItem key={varName} value={varName}>
                                {varName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Y Variable (Dependent)</InputLabel>
                          <Select
                            value={targetVariable}
                            onChange={(e) => setTargetVariable(e.target.value)}
                            label="Y Variable (Dependent)"
                          >
                            {getAvailableVariables(true).map((varName) => (
                              <MenuItem key={varName} value={varName}>
                                {varName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    )}

                    {(analysisType === 'descriptive_stats' || analysisType === 'correlation') && (
                      <FormControl fullWidth>
                        <InputLabel>Select Variables (Multiple)</InputLabel>
                        <Select
                          multiple
                          value={featureVariables}
                          onChange={(e) => setFeatureVariables(e.target.value as string[])}
                          label="Select Variables (Multiple)"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {(selected as string[]).map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {getAvailableVariables(true).map((varName) => (
                            <MenuItem key={varName} value={varName}>
                              <Checkbox checked={featureVariables.indexOf(varName) > -1} />
                              <ListItemText primary={varName} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {/* ML Analysis Variable Selection */}
                    {(analysisType === 'ml_regression' || analysisType === 'ml_classification') && (
                      <>
                        <FormControl fullWidth>
                          <InputLabel>Feature Variables (X)</InputLabel>
                          <Select
                            multiple
                            value={featureVariables}
                            onChange={(e) => setFeatureVariables(e.target.value as string[])}
                            label="Feature Variables (X)"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {getAvailableVariables(true).map((varName) => (
                              <MenuItem key={varName} value={varName}>
                                <Checkbox checked={featureVariables.indexOf(varName) > -1} />
                                <ListItemText primary={varName} />
                              </MenuItem>
                            ))}
                          </Select>
                          <Typography variant="caption" sx={{ mt: 0.5, color: colors.text.secondary }}>
                            Numeric columns only (for features)
                          </Typography>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Target Variable (Y)</InputLabel>
                          <Select
                            value={targetVariable}
                            onChange={(e) => setTargetVariable(e.target.value)}
                            label="Target Variable (Y)"
                          >
                            {getAvailableVariables(false).map((varName) => (
                              <MenuItem key={varName} value={varName}>
                                {varName}
                              </MenuItem>
                            ))}
                          </Select>
                          <Typography variant="caption" sx={{ mt: 0.5, color: colors.text.secondary }}>
                            {analysisType === 'ml_classification' 
                              ? 'All columns available (select categorical column like "diagnosis")' 
                              : analysisType === 'ml_regression'
                              ? 'All columns available (select numeric column for prediction)'
                              : 'All columns available'}
                          </Typography>
                          {targetVariable && selectedDataset && analysisType === 'ml_classification' && (
                            <Box sx={{ mt: 1 }}>
                              {(() => {
                                const uniqueValues = new Set(selectedDataset.data.map((row) => row[targetVariable]));
                                const uniqueCount = uniqueValues.size;
                                const sampleValues = Array.from(uniqueValues).slice(0, 5);
                                const isValidCategorical = uniqueCount >= 2 && uniqueCount <= 50;

                                return (
                                  <Alert severity={isValidCategorical ? 'success' : 'warning'}>
                                    <Typography variant="caption">
                                      <strong>{targetVariable}:</strong> {uniqueCount} unique value(s)
                                      {uniqueCount <= 10 && ` (${sampleValues.join(', ')}${uniqueCount > 5 ? '...' : ''})`}
                                    </Typography>
                                    {!isValidCategorical && (
                                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        {uniqueCount > 50
                                          ? '⚠️ Too many unique values for classification! Select a categorical column (e.g., "diagnosis" with M/B values).'
                                          : '⚠️ Need at least 2 classes for classification.'}
                                      </Typography>
                                    )}
                                  </Alert>
                                );
                              })()}
                            </Box>
                          )}
                          {targetVariable && selectedDataset && analysisType === 'ml_regression' && (
                            <Box sx={{ mt: 1 }}>
                              {(() => {
                                const targetValues = selectedDataset.data.map((row) => row[targetVariable]);
                                const numericValues = targetValues.filter((v) => {
                                  const num = Number(v);
                                  return !isNaN(num) && isFinite(num);
                                });
                                const isNumeric = numericValues.length >= targetValues.length * 0.9;
                                const sampleValues = Array.from(new Set(targetValues)).slice(0, 5);

                                return (
                                  <Alert severity={isNumeric ? 'success' : 'error'}>
                                    <Typography variant="caption">
                                      <strong>{targetVariable}:</strong> {isNumeric ? 'Numeric variable ✓' : 'Categorical/Text variable ✗'}
                                      {!isNumeric && ` (sample values: ${sampleValues.join(', ')})`}
                                    </Typography>
                                    {!isNumeric && (
                                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        ⚠️ Regression requires a NUMERIC target! For categorical targets like &quot;diagnosis&quot; (M/B), use &quot;ML: Classification&quot; instead.
                                      </Typography>
                                    )}
                                  </Alert>
                                );
                              })()}
                            </Box>
                          )}
                        </FormControl>

                        <Alert severity="info" icon={<ScienceIcon />}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Machine Learning: Train/Test Split
                          </Typography>
                          <Typography variant="caption" display="block">
                            Data will be split into training and testing sets to evaluate model performance
                          </Typography>
                        </Alert>

                        <Box sx={{ px: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Training/Testing Split: {trainTestSplit}% / {100 - trainTestSplit}%
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" sx={{ minWidth: '60px' }}>
                              Training
                            </Typography>
                            <input
                              type="range"
                              min="50"
                              max="90"
                              step="5"
                              value={trainTestSplit}
                              onChange={(e) => setTrainTestSplit(Number(e.target.value))}
                              style={{ flex: 1 }}
                            />
                            <Typography variant="caption" sx={{ minWidth: '50px' }}>
                              Testing
                            </Typography>
                          </Box>
                        </Box>

                        <TextField
                          label="Random Seed (for reproducibility)"
                          type="number"
                          value={randomSeed}
                          onChange={(e) => setRandomSeed(Number(e.target.value))}
                          helperText="Set a fixed seed to get consistent train/test splits"
                          fullWidth
                        />

                        {/* Algorithm-Specific Hyperparameters */}
                        {analysisType === 'ml_classification' && (
                          <Paper sx={{ p: 2, backgroundColor: colors.neutral[50], borderRadius: borderRadius.sm }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                              Algorithm: {selectedMLAlgorithm === 'random_forest' ? 'Random Forest' : 
                                         selectedMLAlgorithm === 'decision_tree' ? 'Decision Tree' :
                                         selectedMLAlgorithm === 'knn' ? 'K-Nearest Neighbors' :
                                         'Logistic Regression'}
                            </Typography>

                            {/* Random Forest Hyperparameters */}
                            {selectedMLAlgorithm === 'random_forest' && (
                              <Stack spacing={2}>
                                <TextField
                                  label="Number of Trees"
                                  type="number"
                                  value={nEstimators}
                                  onChange={(e) => setNEstimators(Number(e.target.value))}
                                  inputProps={{ min: 10, max: 500, step: 10 }}
                                  helperText="More trees = better accuracy but slower (default: 100)"
                                  fullWidth
                                  size="small"
                                />
                                <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                                  Random Forest builds multiple decision trees and combines their predictions for better accuracy and reduced overfitting.
                                </Alert>
                              </Stack>
                            )}

                            {/* Decision Tree Hyperparameters */}
                            {selectedMLAlgorithm === 'decision_tree' && (
                              <Stack spacing={2}>
                                <TextField
                                  label="Max Tree Depth"
                                  type="number"
                                  value={maxDepth}
                                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                                  inputProps={{ min: 1, max: 50 }}
                                  helperText="Deeper trees = more complex model (default: 10)"
                                  fullWidth
                                  size="small"
                                />
                                <TextField
                                  label="Min Samples per Leaf"
                                  type="number"
                                  value={minSamplesLeaf}
                                  onChange={(e) => setMinSamplesLeaf(Number(e.target.value))}
                                  inputProps={{ min: 1, max: 100 }}
                                  helperText="Higher values prevent overfitting (default: 1)"
                                  fullWidth
                                  size="small"
                                />
                                <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                                  Decision Trees create interpretable rules by splitting data at each node. Great for understanding feature relationships.
                                </Alert>
                              </Stack>
                            )}

                            {/* KNN Hyperparameters */}
                            {selectedMLAlgorithm === 'knn' && (
                              <Stack spacing={2}>
                                <TextField
                                  label="Number of Neighbors (K)"
                                  type="number"
                                  value={kNeighbors}
                                  onChange={(e) => setKNeighbors(Number(e.target.value))}
                                  inputProps={{ min: 1, max: 50 }}
                                  helperText="Higher K = smoother decision boundary (default: 5)"
                                  fullWidth
                                  size="small"
                                />
                                <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                                  KNN classifies samples based on the K nearest neighbors. Lower K is more sensitive to noise, higher K is smoother.
                                </Alert>
                              </Stack>
                            )}

                            {/* Logistic Regression Info */}
                            {selectedMLAlgorithm === 'logistic' && (
                              <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
                                Logistic Regression uses gradient descent (1000 iterations) with feature normalization for binary classification.
                              </Alert>
                            )}
                          </Paper>
                        )}

                        {/* Cross-Validation Options (for ML Regression only) */}
                        {analysisType === 'ml_regression' && (
                          <Paper sx={{ p: 2, backgroundColor: colors.primary[50], borderRadius: borderRadius.sm }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                              <Checkbox
                                checked={useCrossValidation}
                                onChange={(e) => setUseCrossValidation(e.target.checked)}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Enable K-Fold Cross-Validation
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                                  More robust model evaluation across {cvFolds} folds
                                </Typography>
                              </Box>
                            </Stack>

                            {useCrossValidation && (
                              <FormControl fullWidth>
                                <InputLabel>Number of Folds</InputLabel>
                                <Select
                                  value={cvFolds}
                                  onChange={(e) => setCvFolds(Number(e.target.value))}
                                  label="Number of Folds"
                                  size="small"
                                >
                                  <MenuItem value={3}>3-Fold</MenuItem>
                                  <MenuItem value={5}>5-Fold (Recommended)</MenuItem>
                                  <MenuItem value={10}>10-Fold</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Paper>
                        )}
                      </>
                    )}

                    <Divider />

                    {/* Run Analysis Button */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleRunAnalysis}
                      disabled={
                        isAnalyzing ||
                        isLoadingDataset ||
                        (analysisType === 'linear_regression' && (!targetVariable || featureVariables.length === 0)) ||
                        (analysisType === 'descriptive_stats' && featureVariables.length === 0) ||
                        (analysisType === 'correlation' && featureVariables.length < 2) ||
                        ((analysisType === 'ml_regression' || analysisType === 'ml_classification') && (!targetVariable || featureVariables.length === 0))
                      }
                      startIcon={(isAnalyzing || isLoadingDataset) ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      {isLoadingDataset ? 'Loading Dataset...' : isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                    </Button>

                    {/* Helper text for disabled button */}
                    {!isAnalyzing && (
                      <>
                        {analysisType === 'linear_regression' && (!targetVariable || featureVariables.length === 0) && (
                          <Alert severity="info">
                            Please select both X and Y variables to run linear regression
                          </Alert>
                        )}
                        {analysisType === 'descriptive_stats' && featureVariables.length === 0 && (
                          <Alert severity="info">
                            Please select at least one variable for descriptive statistics
                          </Alert>
                        )}
                        {analysisType === 'correlation' && featureVariables.length < 2 && (
                          <Alert severity="info">
                            Please select at least two variables for correlation analysis
                          </Alert>
                        )}
                        {(analysisType === 'ml_regression' || analysisType === 'ml_classification') && (!targetVariable || featureVariables.length === 0) && (
                          <Alert severity="info">
                            Please select feature variables (X) and target variable (Y) for ML analysis
                          </Alert>
                        )}
                      </>
                    )}

                    {analysisError && (
                      <Alert severity="error" onClose={() => setAnalysisError(null)}>
                        {analysisError}
                      </Alert>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Results */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            {analysisResult ? (
              <>
                <AnalysisVisualization result={analysisResult} />

                <Divider sx={{ my: 4 }} />

                {/* Save Analysis */}
                <Paper sx={{ p: 3, backgroundColor: colors.neutral[50], borderRadius: borderRadius.md }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Save This Analysis
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Analysis Name"
                      value={analysisName}
                      onChange={(e) => setAnalysisName(e.target.value)}
                      placeholder={`${analysisType} - ${new Date().toLocaleDateString()}`}
                      fullWidth
                    />
                    <TextField
                      label="Description (Optional)"
                      value={analysisDescription}
                      onChange={(e) => setAnalysisDescription(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleSaveAnalysis}
                      startIcon={<SaveIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Save Analysis
                    </Button>
                  </Stack>
                </Paper>
              </>
            ) : (
              <Alert severity="info">
                No analysis results yet. Configure and run an analysis from the &quot;Run Analysis&quot; tab.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab 4: Saved Analyses */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            {analyses.length === 0 ? (
              <Alert severity="info">
                No saved analyses yet. Run and save analyses from the previous tabs.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {analyses.map((analysis) => (
                  <Paper
                    key={analysis.id}
                    sx={{
                      p: 2,
                      border: `1px solid ${colors.neutral[200]}`,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: colors.primary[500],
                        boxShadow: `0 2px 8px ${colors.primary[500]}30`,
                      },
                    }}
                    onClick={() => {
                      setAnalysisResult(analysis.result);
                      setActiveTab(2); // Switch to Results tab to show the analysis
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {analysis.name}
                    </Typography>
                    {analysis.description && (
                      <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.5 }}>
                        {analysis.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                        {toDate(analysis.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                        • {analysis.config.type.replace('_', ' ')}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Success Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataAnalysisPanel;
