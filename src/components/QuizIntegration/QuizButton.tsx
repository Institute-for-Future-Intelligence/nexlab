import React from 'react';
import { Button, Tooltip } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import { useQuizStore } from '../../stores/quizStore';
import { QuizButtonProps } from '../../types/quiz';

const QuizButton: React.FC<QuizButtonProps> = ({
  chatbotId,
  difficulty = 'medium',
  variant = 'contained',
  size = 'medium',
  disabled = false,
  children
}) => {
  const { openQuizModal, loading } = useQuizStore();

  const handleClick = () => {
    if (chatbotId) {
      openQuizModal(chatbotId, difficulty);
    } else {
      console.warn('QuizButton: No chatbotId provided');
    }
  };

  const isDisabled = disabled || loading || !chatbotId;

  const buttonContent = children || (
    <>
      <QuizIcon sx={{ mr: 1 }} />
      Start Quiz
    </>
  );

  const tooltipTitle = !chatbotId 
    ? 'No chatbot available for quiz'
    : loading 
    ? 'Loading...'
    : `Start ${difficulty} quiz`;

  return (
    <Tooltip title={tooltipTitle}>
      <span>
        <Button
          variant={variant}
          size={size}
          disabled={isDisabled}
          onClick={handleClick}
          sx={{
            minWidth: 120,
            ...(variant === 'contained' && {
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            })
          }}
        >
          {buttonContent}
        </Button>
      </span>
    </Tooltip>
  );
};

export default QuizButton;
