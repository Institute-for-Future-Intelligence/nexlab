// src/components/common/CopyableConversationID.tsx
import React, { useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface CopyableConversationIDProps {
  conversationId: string;
  maxLength?: number;
}

const CopyableConversationID: React.FC<CopyableConversationIDProps> = ({
  conversationId,
  maxLength = 999,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click if inside a table
    try {
      await navigator.clipboard.writeText(conversationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayText = conversationId.length > maxLength ? `${conversationId.substring(0, maxLength)}...` : conversationId;

  return (
    <Tooltip title={copied ? 'Copied!' : 'Click to Copy'}>
      <Box
        onClick={handleCopy}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: colors.warning + '15',
          color: colors.warning,
          border: `1px solid ${colors.warning}40`,
          borderRadius: borderRadius.full,
          padding: `${spacing[2]} ${spacing[3]}`,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          fontFamily: 'monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
          '&:hover': {
            backgroundColor: colors.warning + '25',
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
          title={conversationId}
        >
          {displayText}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default CopyableConversationID;
