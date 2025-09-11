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
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.chatbotId}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: 1 }}>
              <QuizIcon color="primary" sx={{ mr: 2, flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  <ArticleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  {option.materialTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  <SchoolIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                  {option.courseTitle}
                </Typography>
              </Box>
              <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {option.hasQuiz && (
                  <Chip
                    label="Quiz Available"
                    color="success"
                    size="small"
                    sx={{ mb: 0.5 }}
                  />
                )}
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {option.chatbotId.substring(0, 8)}...
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        PaperComponent={(props) => (
          <Paper {...props} sx={{ mt: 1 }} />
        )}
        isOptionEqualToValue={(option, value) => option.chatbotId === value.chatbotId}
        noOptionsText={
          loading ? "Loading chatbots..." : "No chatbots found. Create a chatbot first to see quiz data."
        }
        clearOnBlur
        selectOnFocus
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
