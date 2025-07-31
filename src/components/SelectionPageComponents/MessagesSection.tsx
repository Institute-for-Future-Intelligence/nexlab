import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MessagesDisplay from '../Messages/MessagesDisplay';
import { UserDetails } from '../../contexts/UserContext';
import { Message } from '../../services/messageService';

interface MessagesSectionProps {
  messages: Message[];
  loading: boolean;
  userDetails: UserDetails | null;
  handleDeleteMessage: (id: string) => void;
  togglePinMessage: (messageId: string, currentPinStatus: boolean) => Promise<void>;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({
  messages,
  loading,
  userDetails,
  handleDeleteMessage,
  togglePinMessage
}) => {
  const navigate = useNavigate();

  return (
    <Box className="messages-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {/* Left side: Inbox text with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MailOutlineIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="h4" className="inbox-text">
            Inbox
          </Typography>
        </Box>

        {/* Right side: + Add Message button */}
        {userDetails?.isAdmin && (
          <Button
            variant="contained"
            onClick={() => navigate('/add-message')}
            sx={{
              backgroundColor: '#CDDAFF',
              color: '#FFFFFF',
              fontFamily: 'Staatliches, sans-serif',
              fontSize: '1.25rem',
              '&:hover': {
                backgroundColor: '#0B53C0',
                border: '0px solid #0B53C0',
              },
            }}
          >
            + Add Message
          </Button>
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <MessagesDisplay
          messages={messages}
          userDetails={userDetails}
          navigate={navigate}
          handleDeleteMessage={handleDeleteMessage}
          togglePinMessage={togglePinMessage}
        />
      )}
    </Box>
  );
};

export default MessagesSection; 