// src/components/Supplemental/AddMaterialButtonModern.tsx
import React from 'react';
import { Button, Box, Typography, Fade } from '@mui/material';
import { Add as AddIcon, AutoAwesome as AIIcon, Edit as ManualIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { designSystemTheme, borderRadius } from '../../config/designSystem';

interface AddMaterialButtonModernProps {
  selectedCourse: string | null;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  showModeToggle?: boolean;
  onModeChange?: (mode: 'manual' | 'ai') => void;
  currentMode?: 'manual' | 'ai';
}

const AddMaterialButtonModern: React.FC<AddMaterialButtonModernProps> = ({
  selectedCourse,
  variant = 'contained',
  size = 'large',
  showModeToggle = false,
  onModeChange,
  currentMode = 'manual',
}) => {
  const navigate = useNavigate();

  const handleAddMaterial = () => {
    if (selectedCourse) {
      const mode = showModeToggle ? currentMode : 'manual';
      navigate(`/add-material?course=${selectedCourse}&mode=${mode}`);
    }
  };

  const handleModeToggle = (mode: 'manual' | 'ai') => {
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  if (showModeToggle) {
    return (
      <Fade in={true} timeout={500}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 3,
            backgroundColor: designSystemTheme.palette.background.paper,
            borderRadius: borderRadius['2xl'],
            border: `1px solid ${designSystemTheme.palette.divider}`,
            boxShadow: designSystemTheme.shadows[2],
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: designSystemTheme.typography.h6.fontFamily,
              fontWeight: designSystemTheme.typography.h6.fontWeight,
              color: designSystemTheme.palette.text.primary,
              textAlign: 'center',
              mb: 1,
            }}
          >
            Create New Material
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: designSystemTheme.palette.text.secondary,
              textAlign: 'center',
              mb: 2,
            }}
          >
            Choose how you'd like to create your material
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Manual Mode Button */}
            <Button
              variant={currentMode === 'manual' ? 'contained' : 'outlined'}
              startIcon={<ManualIcon />}
              onClick={() => handleModeToggle('manual')}
              disabled={!selectedCourse}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: borderRadius.xl,
                textTransform: 'none',
                fontWeight: 600,
                ...(currentMode === 'manual' && {
                  backgroundColor: designSystemTheme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.primary.dark,
                  },
                }),
                ...(currentMode !== 'manual' && {
                  borderColor: designSystemTheme.palette.primary.main,
                  color: designSystemTheme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.primary.light,
                    borderColor: designSystemTheme.palette.primary.dark,
                  },
                }),
              }}
            >
              Manual Entry
            </Button>

            {/* AI Mode Button */}
            <Button
              variant={currentMode === 'ai' ? 'contained' : 'outlined'}
              startIcon={<AIIcon />}
              onClick={() => handleModeToggle('ai')}
              disabled={!selectedCourse}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: borderRadius.xl,
                textTransform: 'none',
                fontWeight: 600,
                ...(currentMode === 'ai' && {
                  backgroundColor: designSystemTheme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.secondary.dark,
                  },
                }),
                ...(currentMode !== 'ai' && {
                  borderColor: designSystemTheme.palette.secondary.main,
                  color: designSystemTheme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: designSystemTheme.palette.secondary.light,
                    borderColor: designSystemTheme.palette.secondary.dark,
                  },
                }),
              }}
            >
              AI Import
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMaterial}
            disabled={!selectedCourse}
            size={size}
            sx={{
              width: '100%',
              py: 2,
              borderRadius: borderRadius.xl,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: currentMode === 'ai' 
                ? designSystemTheme.palette.secondary.main 
                : designSystemTheme.palette.primary.main,
              '&:hover': {
                backgroundColor: currentMode === 'ai' 
                  ? designSystemTheme.palette.secondary.dark 
                  : designSystemTheme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: designSystemTheme.shadows[4],
              },
              transition: designSystemTheme.transitions.create(['all'], {
                duration: designSystemTheme.transitions.duration.short,
              }),
            }}
          >
            {currentMode === 'ai' ? 'Import with AI' : 'Create Material'}
          </Button>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={300}>
      <Button
        variant={variant}
        startIcon={<AddIcon />}
        onClick={handleAddMaterial}
        disabled={!selectedCourse}
        size={size}
        sx={{
          borderRadius: designSystemTheme.shape.borderRadius,
          textTransform: 'none',
          fontWeight: 600,
          py: size === 'large' ? 2 : size === 'medium' ? 1.5 : 1,
          px: size === 'large' ? 4 : size === 'medium' ? 3 : 2,
          transition: designSystemTheme.transitions.create(['all'], {
            duration: designSystemTheme.transitions.duration.short,
          }),
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: designSystemTheme.shadows[4],
          },
          ...(variant === 'contained' && {
            backgroundColor: designSystemTheme.palette.primary.main,
            '&:hover': {
              backgroundColor: designSystemTheme.palette.primary.dark,
            },
          }),
          ...(variant === 'outlined' && {
            borderColor: designSystemTheme.palette.primary.main,
            color: designSystemTheme.palette.primary.main,
            '&:hover': {
              backgroundColor: designSystemTheme.palette.primary.light,
              borderColor: designSystemTheme.palette.primary.dark,
            },
          }),
        }}
      >
        Add Material
      </Button>
    </Fade>
  );
};

export default AddMaterialButtonModern;
