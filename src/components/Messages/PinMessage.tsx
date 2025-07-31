// src/components/Messages/PinMessage.tsx
import React from 'react';
import { IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { Message } from './MessagesDisplay';

interface PinMessageProps {
  message: Message;
  togglePinMessage: (messageId: string, currentPinStatus: boolean) => Promise<void>;
}

const PinMessage: React.FC<PinMessageProps> = ({ message, togglePinMessage }) => {
  const handlePinMessage = async () => {
    try {
      await togglePinMessage(message.id, message.isPinned || false);
    } catch (error) {
      console.error("Error updating pin status: ", error);
    }
  };

  return (
    <IconButton onClick={handlePinMessage} sx={{ marginRight: 1 }}>
      <PushPinIcon color={message.isPinned ? 'primary' : 'inherit'} />
    </IconButton>
  );
};

export default PinMessage;