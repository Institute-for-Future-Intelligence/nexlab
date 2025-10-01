// src/components/LaboratoryNotebookV2/RichTextDisplay.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import { Box } from '@mui/material';
import { colors, typography, spacing } from '../../config/designSystem';

interface RichTextDisplayProps {
  content: string;
  maxLines?: number; // For truncating in node cards
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, maxLines }) => {
  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content || '');

  return (
    <Box
      sx={{
        '& p': {
          margin: 0,
          marginBottom: spacing[2],
          color: colors.text.primary,
          fontSize: typography.fontSize.base,
          fontFamily: typography.fontFamily.secondary,
          lineHeight: 1.6,
        },
        '& p:last-child': {
          marginBottom: 0,
        },
        '& h1, & h2, & h3': {
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginTop: spacing[3],
          marginBottom: spacing[2],
        },
        '& h1': {
          fontSize: typography.fontSize['2xl'],
        },
        '& h2': {
          fontSize: typography.fontSize.xl,
        },
        '& h3': {
          fontSize: typography.fontSize.lg,
        },
        '& strong': {
          fontWeight: typography.fontWeight.semibold,
        },
        '& em': {
          fontStyle: 'italic',
        },
        '& u': {
          textDecoration: 'underline',
        },
        '& s': {
          textDecoration: 'line-through',
        },
        '& a': {
          color: colors.primary[500],
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& ul, & ol': {
          paddingLeft: spacing[6],
          marginBottom: spacing[2],
          fontFamily: typography.fontFamily.secondary,
        },
        '& li': {
          marginBottom: spacing[1],
          fontFamily: typography.fontFamily.secondary,
        },
        '& blockquote': {
          borderLeft: `4px solid ${colors.primary[500]}`,
          paddingLeft: spacing[4],
          marginLeft: 0,
          marginBottom: spacing[2],
          fontStyle: 'italic',
          color: colors.text.secondary,
          fontFamily: typography.fontFamily.secondary,
        },
        '& code': {
          backgroundColor: colors.background.secondary,
          padding: `${spacing[0.5]} ${spacing[1.5]}`,
          borderRadius: '4px',
          fontSize: typography.fontSize.sm,
          fontFamily: 'monospace',
        },
        '& pre': {
          backgroundColor: colors.background.secondary,
          padding: spacing[3],
          borderRadius: '8px',
          overflow: 'auto',
          marginBottom: spacing[2],
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
          },
        },
        ...(maxLines && {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }),
      }}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default RichTextDisplay;

