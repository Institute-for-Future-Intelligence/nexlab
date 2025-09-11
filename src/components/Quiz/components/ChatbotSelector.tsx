import React from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { ChatbotWithQuiz } from '../../../types/quiz';

interface ChatbotSelectorProps {
  chatbots: ChatbotWithQuiz[];
  selectedChatbot: ChatbotWithQuiz | null;
  onSelect: (chatbot: ChatbotWithQuiz | null) => void;
  loading?: boolean;
}

const ChatbotSelector: React.FC<ChatbotSelectorProps> = ({
  chatbots,
  selectedChatbot,
  onSelect,
  loading = false
}) => {
  return (
    <Box>
      <Autocomplete
        value={selectedChatbot}
        onChange={(_, newValue) => onSelect(newValue)}
        options={chatbots}
        getOptionLabel={(option) => option.title}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Chatbot & Material"
            placeholder="Choose a chatbot to view its quiz data..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Gabarito, sans-serif',
                '& fieldset': {
                  borderColor: '#CDDAFF',
                  borderWidth: 2
                },
                '&:hover fieldset': {
                  borderColor: '#0B53C0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0B53C0',
                  borderWidth: 2
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Gabarito, sans-serif',
                color: '#0B53C0',
                fontWeight: 'bold',
                '&.Mui-focused': {
                  color: '#0B53C0'
                }
              }
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box 
              component="li" 
              key={option.chatbotId} 
              {...otherProps}
              sx={{
                '&:hover': {
                  backgroundColor: '#F0F4FF !important'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 2 }}>
                <QuizIcon 
                  sx={{ 
                    mr: 2, 
                    flexShrink: 0, 
                    color: '#0B53C0',
                    fontSize: 28
                  }} 
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="subtitle1" 
                    noWrap
                    sx={{
                      fontFamily: 'Staatliches, sans-serif',
                      fontSize: '1.1rem',
                      color: '#0B53C0',
                      fontWeight: 'bold'
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    noWrap
                    sx={{
                      fontFamily: 'Gabarito, sans-serif',
                      color: '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 0.5
                    }}
                  >
                    <ArticleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {option.materialTitle}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    noWrap
                    sx={{
                      fontFamily: 'Gabarito, sans-serif',
                      color: '#888888',
                      display: 'flex',
                      alignItems: 'center',
                      mt: 0.25
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {option.courseTitle}
                  </Typography>
                </Box>
                <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  {option.quizId && (
                    <Chip
                      label="Quiz Available"
                      size="small"
                      sx={{ 
                        backgroundColor: '#C8E6C9',
                        color: '#2E7D32',
                        fontFamily: 'Gabarito, sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{
                      fontFamily: 'monospace',
                      color: option.quizId ? '#0B53C0' : '#888888',
                      fontSize: '0.7rem',
                      backgroundColor: option.quizId ? '#F0F4FF' : '#F5F5F5',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${option.quizId ? '#CDDAFF' : '#E0E0E0'}`
                    }}
                  >
                    Quiz: {option.quizId ? option.quizId.substring(0, 8) + '...' : 'N/A'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{
                      fontFamily: 'monospace',
                      color: '#888888',
                      fontSize: '0.65rem'
                    }}
                  >
                    ChatBot: {option.chatbotId.substring(0, 8)}...
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
        PaperComponent={(props) => (
          <Paper 
            {...props} 
            sx={{ 
              mt: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: '1px solid #CDDAFF',
              backgroundColor: '#FFFFFF'
            }} 
          />
        )}
        isOptionEqualToValue={(option, value) => option.chatbotId === value.chatbotId}
        noOptionsText={
          loading ? "Loading chatbots..." : "No chatbots found. Create a chatbot first to see quiz data."
        }
        clearOnBlur
        handleHomeEndKeys
      />
      
      {chatbots.length === 0 && !loading && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>No chatbots available.</strong> You need to create chatbots first before you can manage quiz sessions. 
            Each chatbot automatically has an associated quiz with predefined questions.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatbotSelector;
