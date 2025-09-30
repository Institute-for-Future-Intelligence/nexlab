// src/components/LaboratoryNotebookV2/ConfirmationDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { colors, typography, spacing, borderRadius } from '../../config/designSystem';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: borderRadius.xl,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          {isDestructive && (
            <WarningIcon sx={{ color: colors.error, fontSize: 28 }} />
          )}
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.fontFamily.display,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            color: colors.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: spacing[3], gap: spacing[2] }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: borderRadius.md,
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            backgroundColor: isDestructive ? colors.error : colors.primary[500],
            '&:hover': {
              backgroundColor: isDestructive ? '#C62828' : colors.primary[600],
            },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;

