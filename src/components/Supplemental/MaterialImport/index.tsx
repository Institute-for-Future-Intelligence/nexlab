// src/components/Supplemental/MaterialImport/index.tsx

import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { useMaterialImportStatus } from '../../../stores/materialImportStore';
import FileUploadZone from './FileUploadZone';
import ProcessingIndicator from './ProcessingIndicator';
import MaterialPreview from './MaterialPreview';
import AISettingsPanel from './AISettingsPanel';

interface MaterialImportProps {
  courseId: string;
  authorId: string;
  onMaterialReady?: (materialData: any) => void;
  onCancel?: () => void;
  imageUploadProgress?: { completed: number; total: number } | null;
  isSaving?: boolean;
}

const MaterialImport: React.FC<MaterialImportProps> = ({
  courseId,
  authorId,
  onMaterialReady,
  onCancel,
  imageUploadProgress,
  isSaving = false
}) => {
  const { 
    uploadedFile, 
    extractedText, 
    aiExtractedData, 
    convertedMaterial,
    isProcessing, 
    error 
  } = useMaterialImportStatus();

  // Determine current step
  const getCurrentStep = () => {
    if (convertedMaterial) return 'preview';
    if (aiExtractedData) return 'processed';
    if (extractedText) return 'extracted';
    if (uploadedFile) return 'uploaded';
    return 'upload';
  };

  const currentStep = getCurrentStep();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
          🤖 AI-Powered Material Import
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload your presentation slides, documents, or materials and let AI automatically structure them 
          into course content with sections, subsections, and organized information.
        </Typography>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          <Typography variant="body2">
            <strong>Import Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Progress Indicator */}
      {isProcessing && (
        <ProcessingIndicator />
      )}

      {/* Main Content Based on Step */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column - Upload and Processing */}
        <Box sx={{ flex: 1, minWidth: 400 }}>
          {/* File Upload Zone */}
          <FileUploadZone disabled={isProcessing} />

          {/* AI Settings Panel */}
          {(currentStep === 'extracted' || currentStep === 'upload') && !isProcessing && (
            <Box sx={{ mt: 3 }}>
              <AISettingsPanel 
                courseId={courseId}
                authorId={authorId}
                disabled={!extractedText}
              />
            </Box>
          )}

          {/* Step Information */}
          <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Import Progress
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <StepIndicator 
                step={1} 
                title="Upload File" 
                completed={!!uploadedFile} 
                active={currentStep === 'upload'} 
              />
              <StepIndicator 
                step={2} 
                title="Extract Text" 
                completed={!!extractedText} 
                active={currentStep === 'uploaded'} 
              />
              <StepIndicator 
                step={3} 
                title="AI Processing" 
                completed={!!aiExtractedData} 
                active={currentStep === 'extracted'} 
              />
              <StepIndicator 
                step={4} 
                title="Review & Save" 
                completed={!!convertedMaterial} 
                active={currentStep === 'processed'} 
              />
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Preview */}
        {(extractedText || convertedMaterial) && (
          <Box sx={{ flex: 1, minWidth: 500 }}>
            <MaterialPreview 
              extractedText={extractedText}
              convertedMaterial={convertedMaterial}
              onMaterialReady={onMaterialReady}
              onCancel={onCancel}
              imageUploadProgress={imageUploadProgress}
              isSaving={isSaving}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Step Indicator Component
interface StepIndicatorProps {
  step: number;
  title: string;
  completed: boolean;
  active: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, title, completed, active }) => {
  const getStepColor = () => {
    if (completed) return 'success.main';
    if (active) return 'primary.main';
    return 'grey.400';
  };

  const getStepIcon = () => {
    if (completed) return '✅';
    if (active) return '🔄';
    return '⏳';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box 
        sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          bgcolor: getStepColor(),
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {completed ? '✓' : step}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: active ? 'bold' : 'normal',
            color: getStepColor()
          }}
        >
          {getStepIcon()} {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default MaterialImport;
