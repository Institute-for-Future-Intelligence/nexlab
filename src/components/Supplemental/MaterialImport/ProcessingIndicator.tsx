// src/components/Supplemental/MaterialImport/ProcessingIndicator.tsx

import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  TextFields as ExtractIcon,
  Psychology as AnalyzeIcon,
  Build as StructureIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { useMaterialImportStatus } from '../../../stores/materialImportStore';

const ProcessingIndicator: React.FC = () => {
  const { progress } = useMaterialImportStatus();

  if (!progress) return null;

  const getStepIcon = (stage: string) => {
    switch (stage) {
      case 'uploading': return <UploadIcon />;
      case 'extracting': return <ExtractIcon />;
      case 'analyzing': return <AnalyzeIcon />;
      case 'structuring': return <StructureIcon />;
      case 'complete': return <CompleteIcon />;
      default: return <AnalyzeIcon />;
    }
  };

  const getStageTitle = (stage: string) => {
    switch (stage) {
      case 'uploading': return 'Uploading File';
      case 'extracting': return 'Extracting Text';
      case 'analyzing': return 'AI Analysis';
      case 'structuring': return 'Structuring Content';
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      default: return 'Processing';
    }
  };

  const getProgressColor = () => {
    if (progress.stage === 'error') return 'error';
    if (progress.stage === 'complete') return 'success';
    return 'primary';
  };

  const steps = [
    { key: 'uploading', label: 'Upload' },
    { key: 'extracting', label: 'Extract' },
    { key: 'analyzing', label: 'Analyze' },
    { key: 'structuring', label: 'Structure' },
    { key: 'complete', label: 'Complete' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === progress.stage);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {getStepIcon(progress.stage)}
        <Typography variant="h6" color="primary.main">
          {getStageTitle(progress.stage)}
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress.percentage} 
          color={getProgressColor()}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {progress.currentOperation}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress.percentage)}%
          </Typography>
        </Box>
      </Box>

      {/* Sub-steps if available */}
      {progress.subSteps && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Step {progress.subSteps.current} of {progress.subSteps.total}: {progress.subSteps.description}
          </Typography>
        </Alert>
      )}

      {/* Step Indicator */}
      <Stepper activeStep={getCurrentStepIndex()} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.key} completed={getCurrentStepIndex() > index}>
            <StepLabel>
              <Typography variant="caption">
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Processing Tips */}
      {progress.stage === 'analyzing' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>AI Processing:</strong> The system is analyzing your content structure, 
            identifying sections, and extracting educational information. This usually takes a moment 
            for larger files.
          </Typography>
        </Alert>
      )}

      {progress.stage === 'structuring' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Content Structuring:</strong> Creating organized sections, subsections, 
            and formatting the material for optimal learning experience.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default ProcessingIndicator;
