// src/components/ChatbotConversations/DeleteConfirmationDialog.tsx

import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Button to maintain consistent size
const FixedSizeButton = styled(Button)({
    width: 100, // Fixed width for consistency
    height: 40, // Fixed height for consistency
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    conversationId: string;
    deleting: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    conversationId,
    deleting,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete the conversation with ID: <strong>{conversationId}</strong>? This
                    action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <FixedSizeButton onClick={onClose} color="primary" variant="outlined">
                    Cancel
                </FixedSizeButton>
                <FixedSizeButton
                    onClick={onConfirm}
                    color="error"
                    disabled={deleting}
                >
                    {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                </FixedSizeButton>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmationDialog;