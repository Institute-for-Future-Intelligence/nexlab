// src/components/common/CopyableChatbotID.tsx
import React, { useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface CopyableChatbotIDProps {
  chatbotId: string;
  maxLength?: number;
}

const CopyableChatbotID: React.FC<CopyableChatbotIDProps> = ({
  chatbotId,
  maxLength = 999,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click if inside a table
    try {
      await navigator.clipboard.writeText(chatbotId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayText = chatbotId.length > maxLength 
    ? `${chatbotId.substring(0, maxLength)}...` 
    : chatbotId;

  return (
    <Tooltip title={copied ? 'Copied!' : 'Click to Copy'}>
      <Box
        onClick={handleCopy}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: colors.info + '15',
          color: colors.info,
          border: `1px solid ${colors.info}40`,
          borderRadius: borderRadius.md,
          padding: `${spacing[2]} ${spacing[3]}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          '&:hover': {
            backgroundColor: colors.info + '25',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            fontSize: 'inherit',
            color: 'inherit',
            fontWeight: 'inherit',
            userSelect: 'none',
          }}
          title={chatbotId}
        >
          {displayText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default CopyableChatbotID;
