// src/components/Messages/LinksSection.tsx
import React from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

export interface Link {
  id: string;
  title: string;
  url: string;
}

interface LinksSectionProps {
  links: Link[];
  onLinkChange: (index: number, field: keyof Link, value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

const LinksSection: React.FC<LinksSectionProps> = ({ 
  links, 
  onLinkChange, 
  onAddLink,
  onRemoveLink
}) => {
  return (
    <Box sx={{ mt: spacing[5] }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: spacing[3],
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.primary[700],
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: borderRadius.sm,
            backgroundColor: colors.primary[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}
        >
          🔗
        </Box>
        Links & Resources
      </Typography>
      
      {links.map((link, index) => (
        <Paper
          key={link.id}
          elevation={0}
          sx={{
            p: spacing[3],
            mb: spacing[3],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.neutral[200]}`,
            position: 'relative',
            '&:hover': {
              borderColor: colors.primary[300],
              backgroundColor: colors.primary[25],
              '& .remove-button': {
                opacity: 1,
                visibility: 'visible',
              },
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {/* Remove Button - appears on hover */}
          <Tooltip title="Remove this link" arrow placement="top">
            <IconButton
              className="remove-button"
              onClick={() => onRemoveLink(index)}
              sx={{
                position: 'absolute',
                top: spacing[2],
                right: spacing[2],
                width: 32,
                height: 32,
                backgroundColor: colors.error[50],
                border: `1px solid ${colors.error[200]}`,
                borderRadius: borderRadius.sm,
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: colors.error[100],
                  borderColor: colors.error[300],
                  transform: 'scale(1.05)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '16px',
                  color: colors.error[600],
                },
              }}
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing[2] }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: typography.fontFamily.secondary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.secondary,
              }}
            >
              Link {index + 1}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: spacing[3], alignItems: 'flex-start' }}>
            <TextField
              label="Link Title"
              fullWidth
              value={link.title}
              onChange={(e) => onLinkChange(index, 'title', e.target.value)}
              placeholder="Enter a descriptive title for this link"
              sx={{ 
                flex: '0 0 65%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.surface.primary,
                },
              }}
            />
            <TextField
              label="URL"
              fullWidth
              value={link.url}
              onChange={(e) => onLinkChange(index, 'url', e.target.value)}
              placeholder="https://example.com"
              sx={{ 
                flex: '0 0 35%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.surface.primary,
                },
              }}
            />
          </Box>
        </Paper>
      ))}
      
      <Button
        variant="outlined"
        onClick={onAddLink}
        startIcon={
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: borderRadius.sm,
              backgroundColor: colors.primary[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: typography.fontWeight.semibold,
              color: colors.primary[700],
            }}
          >
            +
          </Box>
        }
        sx={{
          fontFamily: typography.fontFamily.secondary,
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.medium,
          color: colors.primary[600],
          borderColor: colors.primary[300],
          borderRadius: borderRadius.lg,
          padding: `${spacing[2]} ${spacing[4]}`,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: colors.primary[50],
            borderColor: colors.primary[400],
            color: colors.primary[700],
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        Add Link
      </Button>
    </Box>
  );
};

export default LinksSection;
