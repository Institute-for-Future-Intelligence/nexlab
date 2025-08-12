import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { getAIConfig, validateAIConfig, type AIConfig } from '../../../config/aiConfig';
import { useSyllabusStore } from '../../../stores/syllabusStore';

interface AISettingsPanelProps {
  onConfigChange?: (config: AIConfig & { apiKey?: string }) => void;
  compact?: boolean;
}

const AISettingsPanel: React.FC<AISettingsPanelProps> = ({
  onConfigChange,
  compact = false
}) => {
  const { useAIProcessing, setUseAIProcessing } = useSyllabusStore();
  
  // Remove API key state - it's handled by environment variables
  const [configStatus, setConfigStatus] = useState<{
    isValid: boolean;
    errors: string[];
    config: AIConfig;
  } | null>(null);

  useEffect(() => {
    // Load initial configuration
    const { config, isValid, errors } = getAIConfig();
    setConfigStatus({ config, isValid, errors });
    
    // API key is handled by environment variables
  }, []);

  // API key handling removed - using environment variables

  const handleToggleAI = (enabled: boolean) => {
    setUseAIProcessing(enabled);
    
    if (configStatus) {
      const newConfig = {
        ...configStatus.config,
        enableAIProcessing: enabled
      };
      
      const validation = validateAIConfig(newConfig);
      setConfigStatus({
        config: newConfig,
        ...validation
      });
      
      onConfigChange?.(newConfig);
    }
  };

  const getStatusIcon = () => {
    if (!configStatus) return <SettingsIcon color="action" />;
    
    if (configStatus.isValid && useAIProcessing) {
      return <CheckCircleIcon color="success" />;
    } else if (!configStatus.isValid && useAIProcessing) {
      return <ErrorIcon color="error" />;
    } else {
      return <SettingsIcon color="action" />;
    }
  };

  const getStatusMessage = () => {
    if (!useAIProcessing) {
      return 'AI processing disabled - using pattern-based parsing';
    }
    
    if (!configStatus) {
      return 'Loading configuration...';
    }
    
    if (configStatus.isValid) {
      return 'AI processing ready - enhanced syllabus analysis enabled';
    } else {
      return `Configuration issues: ${configStatus.errors.join(', ')}`;
    }
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!useAIProcessing) return 'warning';
    if (!configStatus) return 'info';
    return configStatus.isValid ? 'success' : 'error';
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {getStatusIcon()}
        <FormControlLabel
          control={
            <Switch
              checked={useAIProcessing}
              onChange={(e) => handleToggleAI(e.target.checked)}
              size="small"
            />
          }
          label="AI Processing"
        />
        <Tooltip title={getStatusMessage()}>
          <InfoIcon fontSize="small" color="action" />
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {getStatusIcon()}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                AI-Powered Processing Settings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getStatusMessage()}
              </Typography>
            </Box>
            <Chip
              label={useAIProcessing ? 'Enabled' : 'Disabled'}
              color={useAIProcessing ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* AI Processing Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useAIProcessing}
                    onChange={(e) => handleToggleAI(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Enable AI-Powered Analysis
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use Google Gemini to extract structured information from syllabi
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* API Key Status */}
            {useAIProcessing && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: configStatus?.isValid ? 'success.50' : 'error.50', border: '1px solid', borderColor: configStatus?.isValid ? 'success.200' : 'error.200' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: configStatus?.isValid ? 'success.main' : 'error.main' }}>
                    {configStatus?.isValid ? '✅ API Configuration' : '❌ API Configuration'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {configStatus?.isValid ? 
                      'Gemini API key is configured and ready for use.' :
                      'Gemini API key is required. Please add VITE_GEMINI_API_KEY to your environment variables.'
                    }
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Status Alert */}
            <Grid item xs={12}>
              <Alert severity={getStatusColor()} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {getStatusMessage()}
                </Typography>
                {configStatus?.errors && configStatus.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {configStatus.errors.map((error, index) => (
                      <Typography key={index} variant="caption" display="block">
                        • {error}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            </Grid>

            {/* AI Features Info */}
            {useAIProcessing && configStatus?.isValid && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                    🚀 Enhanced Features with AI:
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block">
                        ✓ Intelligent course information extraction
                      </Typography>
                      <Typography variant="caption" display="block">
                        ✓ Automatic learning objectives identification
                      </Typography>
                      <Typography variant="caption" display="block">
                        ✓ Smart schedule parsing and organization
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" display="block">
                        ✓ Grading policy analysis
                      </Typography>
                      <Typography variant="caption" display="block">
                        ✓ Assignment and due date extraction
                      </Typography>
                      <Typography variant="caption" display="block">
                        ✓ Enhanced material generation
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Pattern-Based Fallback Info */}
            {!useAIProcessing && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.main' }}>
                    📝 Pattern-Based Processing:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Using traditional text parsing methods. Results may be less accurate than AI processing.
                    Enable AI processing for better extraction accuracy.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AISettingsPanel;
