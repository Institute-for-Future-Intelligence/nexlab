// src/components/ChatbotConversations/ChatbotConversationsPage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Button, Select, MenuItem, FormControl, InputLabel, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import ConversationsTable from './ConversationsTable';
import axios from 'axios';
import ConversationHistoryModal from './ConversationHistoryModal';

import Pagination from './Pagination';
import ChatbotDetails from './ChatbotDetails';

import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface Conversation {
    id: string;
    userId: string;
    chatbotId: string;
    startedAt: string;
}

const ChatbotConversationsPage: React.FC = () => {
    const db = getFirestore();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [conversationsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [conversationHistory, setConversationHistory] = useState<any[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<{
        chatbotId: string;
        conversationId: string;
    } | null>(null);
    const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});

    const apiURL = 'https://rag-flask-api.onrender.com';

    const [chatbotIds, setChatbotIds] = useState<string[]>([]);
    const [userIds, setUserIds] = useState<string[]>([]);
    const [selectedChatbotId, setSelectedChatbotId] = useState<string>('All');
    const [selectedUserId, setSelectedUserId] = useState<string>('All');

    const [chatbotDetails, setChatbotDetails] = useState<{
        chatbotId: string;
        chatbotTitle: string;
        courseTitle: string;
        courseId: string;
        materialTitle: string;
        materialId: string;
        materialLink: string;
        chatbotCreatedBy: string;
        chatbotCreatedAt: string;
    } | null>(null);
    
    const [selectedMetadata, setSelectedMetadata] = useState<{
        userId: string;
        startedAt: string;
    } | null>(null);    

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

    const [deleting, setDeleting] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
        open: false,
        message: '',
        type: 'success',
    });
    
    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'conversations'));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Conversation[];
    
                setConversations(data);
    
                const uniqueChatbotIds = Array.from(new Set(data.map((item) => item.chatbotId)));
                setChatbotIds(data.length > 0 ? ['All', ...uniqueChatbotIds] : []);
    
                const uniqueUserIds = Array.from(new Set(data.map((item) => item.userId)));
                setUserIds(data.length > 0 ? ['All', ...uniqueUserIds] : []);
    
                setFilteredConversations(data);
            } catch (error) {
                console.error('Error fetching chatbot conversations:', error);
                setError('Failed to load conversations. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchConversations();
    }, [db]);        

    const handleFilterChange = (filterType: 'chatbot' | 'user', value: string) => {
        if (filterType === 'chatbot') {
            setSelectedChatbotId(value);
        } else {
            setSelectedUserId(value);
        }
    
        const newChatbotId = filterType === 'chatbot' ? value : selectedChatbotId;
        const newUserId = filterType === 'user' ? value : selectedUserId;
    
        let filtered = conversations;
    
        if (newChatbotId !== 'All') {
            filtered = filtered.filter((conv) => conv.chatbotId === newChatbotId);
        }
    
        if (newUserId !== 'All') {
            filtered = filtered.filter((conv) => conv.userId === newUserId);
        }
    
        setFilteredConversations(filtered);
        if (newChatbotId === 'All' && newUserId === 'All') {
            setFilteredConversations(conversations);
        }
        setCurrentPage(1); // Reset to the first page
    };          

    const fetchConversationHistory = async (chatbotId: string, conversationId: string, userId: string, startedAt: string) => {
        setLoadingMap((prev) => ({ ...prev, [conversationId]: true }));
        setApiError(null);
    
        try {
            // Fetch conversation history
            const response = await axios.get(`${apiURL}/conversations/${chatbotId}/${conversationId}`);
            setConversationHistory(response.data);
    
            // Fetch chatbot details
            const fetchChatbots = async () => {
                try {
                    const chatbotsMap = new Map();
                    const snapshot = await getDocs(collection(db, 'chatbots'));
                    snapshot.forEach(doc => {
                        chatbotsMap.set(doc.data().chatbotId, doc.data());
                    });
                    return chatbotsMap;
                } catch (error) {
                    console.error('Error fetching chatbots:', error);
                    return new Map(); // Return an empty map to avoid further issues
                }
            };                     
    
            const chatbotsMap = await fetchChatbots();
            const chatbotData = chatbotsMap.get(chatbotId);
            if (chatbotData) {
                setChatbotDetails({
                    chatbotId,
                    chatbotTitle: chatbotData.title || 'N/A',
                    courseTitle: chatbotData.courseId?.title || 'N/A',
                    courseId: chatbotData.courseId?.id || 'N/A',
                    materialTitle: chatbotData.material?.title || 'N/A',
                    materialId: chatbotData.material?.id || 'N/A',
                    materialLink: `https://institute-for-future-intelligence.github.io/nexlab/view-material/${chatbotData.material?.id || ''}`,
                    chatbotCreatedBy: chatbotData.createdBy || 'Unknown',
                    chatbotCreatedAt: chatbotData.timestamp || 'N/A',
                });
            } else {
                setChatbotDetails(null);
            }
    
            // Set metadata for the selected conversation
            setSelectedMetadata({
                userId,
                startedAt,
            });
    
            setSelectedConversation({ chatbotId, conversationId });
            setOpenModal(true);
        } catch (error) {
            console.error('Error fetching conversation or chatbot details:', error);
            setApiError('Failed to fetch conversation history or chatbot details.');
        } finally {
            setLoadingMap((prev) => ({ ...prev, [conversationId]: false }));
        }
    };    

    // Pagination Logic
    const indexOfLastConversation = currentPage * conversationsPerPage;
    const indexOfFirstConversation = indexOfLastConversation - conversationsPerPage;
    const currentConversations = filteredConversations.slice(indexOfFirstConversation, indexOfLastConversation);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    const handleOpenDeleteDialog = (conversationId: string) => {
        setConversationToDelete(conversationId);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setConversationToDelete(null);
    };

    const handleDeleteConversation = async () => {
        if (!conversationToDelete) return;
    
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'conversations', conversationToDelete));
            setConversations((prev) =>
                prev.filter((conversation) => conversation.id !== conversationToDelete)
            );
            setFilteredConversations((prev) =>
                prev.filter((conversation) => conversation.id !== conversationToDelete)
            );
            setSnackbar({ open: true, message: 'Conversation deleted successfully.', type: 'success' });
            handleCloseDeleteDialog(); // Close dialog only after success
        } catch (error) {
            console.error('Error deleting conversation:', error);
            setSnackbar({ open: true, message: 'Failed to delete the conversation. Please try again.', type: 'error' });
        } finally {
            setDeleting(false);
            handleCloseDeleteDialog();
        }
    };

    return (
        <Box className="profile-container" sx={{ p: 4 }}>
            <Button
                variant="text"
                onClick={() => navigate('/')}
                className="profile-button"
            >
                &larr; Home Page
            </Button>

            <Typography variant="h5" className="webpage_title" sx={{ mb: 2 }}>
                Chatbot Conversations
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {/* Filter by Chatbot ID */}
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="filter-chatbot-id">Filter by Chatbot ID</InputLabel>
                    <Select
                        labelId="filter-chatbot-id"
                        value={selectedChatbotId}
                        onChange={(e) => handleFilterChange('chatbot', e.target.value)}
                    >
                        {chatbotIds.length > 0 ? (
                            chatbotIds.map((id) => (
                                <MenuItem key={id} value={id}>
                                    {id}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="" disabled>
                                No Chatbots Available
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>

                {/* Filter by User ID */}
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="filter-user-id">Filter by User ID</InputLabel>
                    <Select
                        labelId="filter-user-id"
                        value={selectedUserId}
                        onChange={(e) => handleFilterChange('user', e.target.value)}
                    >
                        {userIds.map((id) => (
                            <MenuItem key={id} value={id}>
                                {id}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Chatbot Details */}
            {selectedChatbotId !== 'All' && (
                <ChatbotDetails chatbotId={selectedChatbotId} />
            )}

            <Box className="profile-container" sx={{ p: 4 }}>
                {/* Conversations Table */}
                <ConversationsTable
                    conversations={currentConversations}
                    onViewHistory={(chatbotId, conversationId, userId, startedAt) =>
                        fetchConversationHistory(chatbotId, conversationId, userId, startedAt)
                    }
                    onDeleteConversation={handleOpenDeleteDialog}
                    loadingMap={loadingMap}
                />

                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={handleDeleteConversation}
                    conversationId={conversationToDelete || ''}
                    deleting={deleting}
                />
            </Box>

            {/* Pagination */}
            <Pagination
                totalItems={filteredConversations.length}
                itemsPerPage={conversationsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {selectedConversation && chatbotDetails && selectedMetadata && (
                <ConversationHistoryModal
                    open={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setSelectedConversation(null);
                    }}
                    conversationHistory={conversationHistory}
                    conversationId={selectedConversation.conversationId}
                    conversationHistoryError={apiError}
                    chatbotDetails={chatbotDetails}
                    userId={selectedMetadata.userId}
                    startedAt={selectedMetadata.startedAt}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbar.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{
                    style: { backgroundColor: snackbar.type === 'success' ? '#4caf50' : '#f44336' },
                }}
            />
        </Box>
    );
};

export default ChatbotConversationsPage;