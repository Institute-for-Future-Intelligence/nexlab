import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Alert,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import { useSyllabusStore, ParsedCourseInfo, GeneratedMaterial } from '../../../stores/syllabusStore';
import { getAIConfig, type AIConfig } from '../../../config/aiConfig';
import SyllabusUploadZone from './SyllabusUploadZone';
import CourseInfoPreview from './CourseInfoPreview';
import MaterialsPreview from './MaterialsPreview';
import AISettingsPanel from './AISettingsPanel';

interface SyllabusImportProps {
  onComplete?: (data: {
    courseInfo: ParsedCourseInfo;
    materials: GeneratedMaterial[];
  }) => void;
  onCancel?: () => void;
  educatorUid?: string; // For file storage
}

const SyllabusImport: React.FC<SyllabusImportProps> = ({
  onComplete,
  onCancel,
  educatorUid
}) => {
  const {
    currentStep,
    setCurrentStep,
    parsedCourseInfo,
    generatedMaterials,
    isProcessing,
    error,
    useAIProcessing,
    processingProgress,
    reset
  } = useSyllabusStore();
  
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);

  // Load initial AI configuration
  React.useEffect(() => {
    const { config } = getAIConfig();
    setAiConfig(config);
  }, []);

  const steps = [
    {
      label: 'Upload Syllabus',
      description: 'Upload your syllabus document'
    },
    {
      label: 'Review Course Info',
      description: 'Verify and edit course information'
    },
    {
      label: 'Review Materials',
      description: 'Customize generated course materials'
    }
  ];

  const getActiveStep = (): number => {
    switch (currentStep) {
      case 'upload':
      case 'processing':
        return 0;
      case 'review':
        return 1;
      case 'editing':
        return 2;
      case 'complete':
        return 2;
      default:
        return 0;
    }
  };

  const handleContinueToMaterials = () => {
    setCurrentStep('editing');
  };

  const handleBackToCourseInfo = () => {
    setCurrentStep('review');
  };

  const handleComplete = () => {
    if (parsedCourseInfo && generatedMaterials.length > 0) {
      const publishedMaterials = generatedMaterials.filter(m => m.published);
      onComplete?.({
        courseInfo: parsedCourseInfo,
        materials: publishedMaterials
      });
    }
  };

  const handleCancel = () => {
    reset(); // Clear the syllabus store state
    onCancel?.(); // Call the parent cancel handler
  };

  const handleAIConfigChange = (config: AIConfig) => {
    setAiConfig(config);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
      case 'processing':
        return (
          <SyllabusUploadZone
            onUploadComplete={() => {
              // Upload completion is handled by the store
            }}
            educatorUid={educatorUid}
          />
        );

      case 'review':
        return (
          <CourseInfoPreview
            onContinue={handleContinueToMaterials}
          />
        );

      case 'editing':
      case 'complete':
        return (
          <MaterialsPreview
            onContinue={handleComplete}
            onBack={handleBackToCourseInfo}
          />
        );

      default:
        return (
          <SyllabusUploadZone
            onUploadComplete={() => {
              // Upload completion is handled by the store
            }}
            educatorUid={educatorUid}
          />
        );
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Import Course from Syllabus
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Upload your syllabus document and we&apos;ll automatically create a course structure 
          with organized materials based on your content.
        </Typography>

        {/* Progress Stepper */}
        <Stepper activeStep={getActiveStep()} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* AI Settings Panel - Show before upload */}
      {currentStep === 'upload' && (
        <AISettingsPanel 
          onConfigChange={handleAIConfigChange}
          compact={false}
        />
      )}

      {/* Global Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => {
            // Clear error - handled by store
          }}
        >
          {error}
        </Alert>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {useAIProcessing ? 
              '🤖 AI is analyzing your syllabus for enhanced data extraction... This usually takes 10-30 seconds.' :
              '🔄 Processing your syllabus with pattern-based analysis... This usually takes a moment.'
            }
          </Typography>
        </Alert>
      )}

      {/* Current Step Content */}
      <Box sx={{ minHeight: 400 }}>
        {renderCurrentStep()}
      </Box>

      {/* Cancel Button - Show after upload starts */}
      {currentStep !== 'upload' && onCancel && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleCancel}
            size="small"
          >
            Cancel & Return to Manual Entry
          </Button>
        </Box>
      )}

    </Box>
  );
};

export default SyllabusImport; 