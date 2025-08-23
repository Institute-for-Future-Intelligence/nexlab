// src/components/Supplemental/MaterialImport/AISettingsPanel.tsx

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Chip
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  Settings as SettingsIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import { useMaterialImportActions, useMaterialImportStatus, useIsReadyForAI } from '../../../stores/materialImportStore';

interface AISettingsPanelProps {
  courseId: string;
  authorId: string;
  disabled?: boolean;
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({ 
  courseId, 
  authorId, 
  disabled = false 
}) => {
  const { processWithAI, setProcessingOptions } = useMaterialImportActions();
  const { processingOptions: storeOptions } = useMaterialImportStatus();
  const isReadyForAI = useIsReadyForAI();
  
  // Provide default options if store options are not available
  // Conservative settings for document analysis and information extraction
  const processingOptions = storeOptions || {
    maxOutputTokens: 4096,     // Reduced to prevent truncation issues
    topK: 1,                   // Very conservative - pick most likely token
    topP: 0.1,                 // Low creativity - stick to factual content
    preserveFormatting: true,
    extractImages: true,
    extractLinks: true
  };
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStartProcessing = async () => {
    try {
      await processWithAI(courseId, authorId);
    } catch (error) {
      console.error('Failed to start AI processing:', error);
    }
  };

  const handleOptionChange = (option: string, value: any) => {
    setProcessingOptions({ [option]: value });
  };

  const isAPIKeyConfigured = () => {
    return !!(import.meta.env.VITE_GEMINI_MATERIAL_API_KEY || import.meta.env.VITE_GEMINI_API_KEY);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <AIIcon color="primary" />
        <Typography variant="h6">
          AI Processing Settings
        </Typography>
      </Box>

      {/* API Key Status */}
      {!isAPIKeyConfigured() && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>API Key Required:</strong> Please configure VITE_GEMINI_MATERIAL_API_KEY 
            or VITE_GEMINI_API_KEY in your environment variables to use AI processing.
          </Typography>
        </Alert>
      )}

      {/* Quick Settings */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={processingOptions.preserveFormatting || false}
              onChange={(e) => handleOptionChange('preserveFormatting', e.target.checked)}
              disabled={disabled}
            />
          }
          label="Preserve Original Formatting"
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
          Maintain text formatting and structure from the original document
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={processingOptions.extractImages || false}
              onChange={(e) => handleOptionChange('extractImages', e.target.checked)}
              disabled={disabled}
            />
          }
          label="Extract Image References"
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
          Identify and note image locations and descriptions
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={processingOptions.extractLinks || false}
              onChange={(e) => handleOptionChange('extractLinks', e.target.checked)}
              disabled={disabled}
            />
          }
          label="Extract Links and Resources"
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
          Find and organize URLs and external references
        </Typography>
      </Box>

      {/* Advanced Settings */}
      <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon fontSize="small" />
            <Typography>Advanced AI Settings</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Output Tokens */}
            <Box>
              <Typography gutterBottom>Max Output Tokens</Typography>
              <Slider
                value={processingOptions.maxOutputTokens || 4096}
                onChange={(_, value) => handleOptionChange('maxOutputTokens', value)}
                min={2048}
                max={8192}
                step={1024}
                marks={[
                  { value: 2048, label: '2K' },
                  { value: 4096, label: '4K' },
                  { value: 8192, label: '8K' }
                ]}
                valueLabelDisplay="auto"
                disabled={disabled}
              />
              <Typography variant="caption" color="text.secondary">
                Higher values allow more detailed processing but may take longer
              </Typography>
            </Box>

            {/* Temperature equivalent (TopP) */}
            <Box>
              <Typography gutterBottom>Creativity Level (TopP)</Typography>
              <Slider
                value={processingOptions.topP || 0.1}
                onChange={(_, value) => handleOptionChange('topP', value)}
                min={0.1}
                max={0.5}
                step={0.05}
                marks={[
                  { value: 0.1, label: 'Factual' },
                  { value: 0.3, label: 'Balanced' },
                  { value: 0.5, label: 'Flexible' }
                ]}
                valueLabelDisplay="auto"
                disabled={disabled}
              />
              <Typography variant="caption" color="text.secondary">
                Lower values prioritize factual extraction, higher values allow more interpretation
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 2 }} />

      {/* Process Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleStartProcessing}
          disabled={disabled || !isReadyForAI || !isAPIKeyConfigured()}
          startIcon={<MagicIcon />}
          sx={{ 
            px: 4, 
            py: 1.5,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
            }
          }}
        >
          🤖 Process with AI
        </Button>
        
        {!isReadyForAI && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Upload and extract text from a file first
          </Typography>
        )}
      </Box>

      {/* Processing Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>What AI Processing Does:</strong>
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
          <Typography component="li" variant="body2">
            Automatically structures content into sections and subsections
          </Typography>
          <Typography component="li" variant="body2">
            Identifies key topics and creates logical organization
          </Typography>
          <Typography component="li" variant="body2">
            Extracts educational objectives and learning points
          </Typography>
          <Typography component="li" variant="body2">
            Formats content with proper HTML for rich display
          </Typography>
          <Typography component="li" variant="body2">
            Preserves source file reference for debugging
          </Typography>
        </Box>
      </Alert>

      {/* Feature Tags */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
        <Chip label="Smart Structuring" size="small" color="primary" variant="outlined" />
        <Chip label="Content Analysis" size="small" color="secondary" variant="outlined" />
        <Chip label="Auto-Formatting" size="small" color="success" variant="outlined" />
        <Chip label="Source Tracking" size="small" color="info" variant="outlined" />
      </Box>
    </Paper>
  );
};

export default AISettingsPanel;
