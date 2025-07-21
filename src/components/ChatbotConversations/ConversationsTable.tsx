// src/components/ChatbotConversations/ConversationsTable.tsx
import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Paper,
    IconButton, 
    Tooltip
} from '@mui/material';
import { styled } from '@mui/system';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Conversation {
    id: string;
    userId: string;
    chatbotId: string;
    startedAt: string;
}

interface ConversationsTableProps {
    conversations: Conversation[];
    onViewHistory: (chatbotId: string, conversationId: string, userId: string, startedAt: string) => void;
    onDeleteConversation: (conversationId: string) => void;
    loadingMap: { [key: string]: boolean };
}

// Styled Components
const StyledTableCell = styled(TableCell)({
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#123372', // Customize header background
    fontSize: '1rem',
    textAlign: 'center',
});

const StyledTableRow = styled(TableRow)({
  '& td, & th': {
      padding: '12px 16px',
  },
  '&:nth-of-type(odd)': {
      backgroundColor: '#f9f9f9', // Light background for odd rows
  },
  '&:hover': {
      backgroundColor: '#e0e0e0', // Hover effect
  },
});

// Custom IconButton for consistent size
const FixedSizeIconButton = styled(IconButton)({
    width: 40, // Fixed width
    height: 40, // Fixed height
    padding: 0, // Remove default padding
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textTransform: 'capitalize',
    borderRadius: '8px',
    color: '#123372',
});

const ConversationsTable: React.FC<ConversationsTableProps> = ({ conversations, onViewHistory, onDeleteConversation, loadingMap }) => {
    if (conversations.length === 0) {
        return (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                No conversations available to display.
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper} sx={{ boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Conversation ID</StyledTableCell>
                            <StyledTableCell>User ID</StyledTableCell>
                            <StyledTableCell>Chatbot ID</StyledTableCell>
                            <StyledTableCell>Timestamp (Started At)</StyledTableCell>
                            <StyledTableCell>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {conversations.length > 0 ? (
                            conversations.map((conversation) => (
                                <StyledTableRow key={conversation.id}>
                                    <TableCell align="center">{conversation.id}</TableCell>
                                    <TableCell align="center">{conversation.userId}</TableCell>
                                    <TableCell align="center">{conversation.chatbotId}</TableCell>
                                    <TableCell align="center">
                                        {conversation.startedAt
                                            ? new Date(conversation.startedAt).toLocaleString()
                                            : 'Invalid date'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Data">
                                                <FixedSizeIconButton
                                                    onClick={() =>
                                                        onViewHistory(
                                                            conversation.chatbotId,
                                                            conversation.id,
                                                            conversation.userId,
                                                            conversation.startedAt
                                                        )
                                                    }
                                                    color="primary"
                                                    disabled={loadingMap[conversation.id]}
                                                >
                                                    {loadingMap[conversation.id] ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        <VisibilityIcon />
                                                    )}
                                                </FixedSizeIconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Conversation">
                                                <FixedSizeIconButton
                                                    onClick={() => onDeleteConversation(conversation.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </FixedSizeIconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </StyledTableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No conversations available for the selected filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ConversationsTable;