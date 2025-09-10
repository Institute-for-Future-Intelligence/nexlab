import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Paper
} from '@mui/material';
import {
  Quiz as QuizIcon,
  ExpandLess as ExpandLessIcon,
  School as EasyIcon,
  Psychology as MediumIcon,
  Rocket as HardIcon
} from '@mui/icons-material';
import { QuizDifficulty } from '../../types/quiz';

interface QuizDifficultySelectorProps {
  onStartQuiz: (difficulty: QuizDifficulty) => void;
  disabled?: boolean;
}

const QuizDifficultySelector: React.FC<QuizDifficultySelectorProps> = ({
  onStartQuiz,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDifficultySelect = (difficulty: QuizDifficulty) => {
    onStartQuiz(difficulty);
    handleClose();
  };

  const difficultyOptions = [
    {
      value: 'easy' as QuizDifficulty,
      description: '~5 questions',
      icon: <EasyIcon color="success" />,
      color: 'success'
    },
    {
      value: 'medium' as QuizDifficulty,
      description: '~8 questions',
      icon: <MediumIcon color="warning" />,
      color: 'warning'
    },
    {
      value: 'hard' as QuizDifficulty,
      description: 'Up to 10 questions',
      icon: <HardIcon color="error" />,
      color: 'error'
    }
  ];

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        disabled={disabled}
        startIcon={open ? <ExpandLessIcon /> : <QuizIcon />}
        sx={{
          background: '#0B53C0',
          color: 'white',
          fontFamily: 'Staatliches, sans-serif',
          fontSize: '1rem',
          fontWeight: 'bold',
          px: 3,
          py: 1.5,
          borderRadius: 3,
          textTransform: 'none',
          '&:hover': {
            background: '#064a9e',
            boxShadow: '0px 4px 12px rgba(11, 83, 192, 0.3)',
          },
          '&:disabled': {
            background: '#ccc',
            color: '#999'
          },
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        Start Quiz
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 300,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: '#f5f5f5',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              },
              '&:last-child': {
                mb: 1
              }
            }
          }
        }}
      >
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#CDDAFF'
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontFamily: 'Staatliches, sans-serif',
              color: '#0B53C0',
              fontSize: '1.1rem',
              textAlign: 'center'
            }}
          >
            Select Quiz Difficulty
          </Typography>
        </Box>
        
        {difficultyOptions.map((option) => (
          <MenuItem 
            key={option.value}
            onClick={() => handleDifficultySelect(option.value)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontFamily: 'Staatliches, sans-serif',
                    fontSize: '1.1rem',
                    color: '#333',
                    fontWeight: 'bold'
                  }}
                >
                  {option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'Gabarito, sans-serif',
                    color: '#666',
                    fontSize: '0.875rem'
                  }}
                >
                  {option.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default QuizDifficultySelector;
