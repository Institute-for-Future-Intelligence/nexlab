// src/components/Chatbot/ChatbotManagementPage.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ChatbotRequestsDisplay from './ChatbotRequestsDisplay';

const ChatbotManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box className="profile-container" sx={{ p: 4 }}>
      <Typography className="webpage_title" sx={{ mb: 2 }}>
        Chatbot Management
      </Typography>

      <Typography variant="body1" className="profile-text" sx={{ mb: 3 }}>
        Manage your chatbots or create new chatbot requests.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/request-chatbot')}
        sx={{ mt: 2 }}
        className="submit-button"
      >
        Request a New Chatbot
      </Button>
      
      {/* Display the submitted chatbot requests */}
      <ChatbotRequestsDisplay />
    </Box>
  );
};

export default ChatbotManagementPage;