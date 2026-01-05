// src/components/ChatbotConversations/ChatbotConversationsAnalysisPage.tsx

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Checkbox,
  Chip,
  Stack,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import { PageHeader } from '../common';
import { Conversation, ChatbotDetails } from '../../types/chatbot';
import ConversationAnalysisModal from './ConversationAnalysisModal';

// Extended conversation with enriched data
interface EnrichedConversation extends Conversation {
  chatbotTitle?: string;
  courseTitle?: string;
  materialTitle?: string;
  userName?: string;
}

/**
 * Dedicated page for Conversation Analysis
 * 
 * This page provides a clean, focused interface for analyzing chatbot conversations
 * using the RAG Flask API. It supports both single and batch analysis.
 * 
 * Features:
 * - Clean conversation list optimized for analysis
 * - Batch selection (up to 50 conversations)
 * - Filtering by chatbot, user, and date range
 * - Search functionality
 * - Quick single conversation analysis
 * - Comprehensive batch analysis
 */
const ChatbotConversationsAnalysisPage: React.FC = () => {
  const db = getFirestore();
  
  // Data state
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<EnrichedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [chatbotIds, setChatbotIds] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string>('All');
  const [selectedUserId, setSelectedUserId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Selection state
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  
  // Analysis modal state
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [conversationsToAnalyze, setConversationsToAnalyze] = useState<string[]>([]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Fetch conversations and enrich with metadata
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Fetch conversations
        const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
        const conversationsData = conversationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];

        // Fetch chatbot details for enrichment
        const chatbotsSnapshot = await getDocs(collection(db, 'chatbots'));
        const chatbotsMap = new Map<string, ChatbotDetails>();
        chatbotsSnapshot.forEach((doc) => {
          const data = doc.data() as ChatbotDetails;
          chatbotsMap.set(data.chatbotId, data);
        });

        // Enrich conversations with chatbot metadata
        const enrichedData: EnrichedConversation[] = conversationsData.map((conv) => {
          const chatbot = chatbotsMap.get(conv.chatbotId);
          return {
            ...conv,
            chatbotTitle: chatbot?.title || 'Unknown Chatbot',
            courseTitle: chatbot?.courseId?.title || 'Unknown Course',
            materialTitle: chatbot?.material?.title || 'Unknown Material',
          };
        });

        // Sort by most recent first
        enrichedData.sort((a, b) => 
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );

        setConversations(enrichedData);

        const uniqueChatbotIds = Array.from(new Set(enrichedData.map((item) => item.chatbotId)));
        setChatbotIds(['All', ...uniqueChatbotIds]);

        const uniqueUserIds = Array.from(new Set(enrichedData.map((item) => item.userId)));
        setUserIds(['All', ...uniqueUserIds]);

        setFilteredConversations(enrichedData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [db]);

  // Apply filters
  useEffect(() => {
    let filtered = conversations;

    // Filter by chatbot
    if (selectedChatbotId !== 'All') {
      filtered = filtered.filter((conv) => conv.chatbotId === selectedChatbotId);
    }

    // Filter by user
    if (selectedUserId !== 'All') {
      filtered = filtered.filter((conv) => conv.userId === selectedUserId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.id.toLowerCase().includes(query) ||
          conv.chatbotId.toLowerCase().includes(query) ||
          conv.userId.toLowerCase().includes(query) ||
          conv.chatbotTitle?.toLowerCase().includes(query) ||
          conv.courseTitle?.toLowerCase().includes(query) ||
          conv.materialTitle?.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((conv) => {
        const convDate = new Date(conv.startedAt);
        return convDate >= startDate;
      });
    }

    if (endDate) {
      // Set end date to end of day for inclusive filtering
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter((conv) => {
        const convDate = new Date(conv.startedAt);
        return convDate <= endOfDay;
      });
    }

    setFilteredConversations(filtered);
  }, [conversations, selectedChatbotId, selectedUserId, searchQuery, startDate, endDate]);

  // Selection handlers
  const handleToggleConversation = (conversationId: string) => {
    setSelectedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        if (newSet.size >= 50) {
          setSnackbar({
            open: true,
            message: 'Maximum 50 conversations can be analyzed at once.',
            type: 'error',
          });
          return prev;
        }
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedConversations.size === filteredConversations.length) {
      setSelectedConversations(new Set());
    } else {
      const toSelect = filteredConversations.slice(0, 50).map((conv) => conv.id);
      setSelectedConversations(new Set(toSelect));
      
      if (filteredConversations.length > 50) {
        setSnackbar({
          open: true,
          message: 'Selected first 50 conversations (maximum limit).',
          type: 'info',
        });
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedConversations(new Set());
  };

  // Analysis handlers
  const handleAnalyzeSingle = (conversationId: string) => {
    setConversationsToAnalyze([conversationId]);
    setAnalysisModalOpen(true);
  };

  const handleAnalyzeBatch = () => {
    if (selectedConversations.size === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one conversation to analyze.',
        type: 'error',
      });
      return;
    }

    setConversationsToAnalyze(Array.from(selectedConversations));
    setAnalysisModalOpen(true);
  };

  const handleCloseAnalysisModal = () => {
    setAnalysisModalOpen(false);
    // Optionally clear selection after analysis
    // setSelectedConversations(new Set());
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-container" sx={{ p: 4 }}>
      <PageHeader 
        title="Conversation Analysis" 
        subtitle="Analyze chatbot conversations to understand learning patterns, Bloom's Taxonomy progression, and engagement metrics"
      />

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Total Conversations
              </Typography>
              <Typography variant="h4">{conversations.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Filtered Results
              </Typography>
              <Typography variant="h4">{filteredConversations.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Selected
              </Typography>
              <Typography variant="h4">{selectedConversations.size}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Max Batch Size
              </Typography>
              <Typography variant="h4">50</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={() => {
              setSearchQuery('');
              setSelectedChatbotId('All');
              setSelectedUserId('All');
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Clear All Filters
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Chatbot</InputLabel>
                <Select
                  value={selectedChatbotId}
                  onChange={(e) => setSelectedChatbotId(e.target.value)}
                  label="Filter by Chatbot"
                >
                  {chatbotIds.map((id) => (
                    <MenuItem key={id} value={id}>
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by User</InputLabel>
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  label="Filter by User"
                >
                  {userIds.map((id) => (
                    <MenuItem key={id} value={id}>
                      {id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
        
        {(startDate || endDate || searchQuery || selectedChatbotId !== 'All' || selectedUserId !== 'All') && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" icon={<InfoIcon />}>
              <Typography variant="body2">
                Active filters: 
                {searchQuery && ` Search: "${searchQuery}"`}
                {selectedChatbotId !== 'All' && ` | Chatbot ID`}
                {selectedUserId !== 'All' && ` | User ID`}
                {startDate && ` | From: ${startDate.toLocaleDateString()}`}
                {endDate && ` | To: ${endDate.toLocaleDateString()}`}
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>

      {/* Batch Analysis Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Checkbox checked={selectedConversations.size === filteredConversations.length && filteredConversations.length > 0} />}
            onClick={handleSelectAll}
          >
            {selectedConversations.size === filteredConversations.length && filteredConversations.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </Button>

          <Chip
            label={`${selectedConversations.size} / 50 selected`}
            color={selectedConversations.size > 0 ? 'primary' : 'default'}
          />

          {selectedConversations.size > 0 && (
            <>
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={handleAnalyzeBatch}
                color="success"
              >
                Analyze Selected ({selectedConversations.size})
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearSelection}
                color="error"
              >
                Clear Selection
              </Button>
            </>
          )}
        </Stack>

        {selectedConversations.size > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {selectedConversations.size === 1
              ? 'Single conversation selected for analysis'
              : `Batch analysis mode: ${selectedConversations.size} conversations selected`}
          </Alert>
        )}
      </Paper>

      {/* Conversations List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Conversations ({filteredConversations.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {filteredConversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No conversations found matching your filters.
            </Typography>
          </Box>
        ) : (
          <Box>
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                sx={{
                  mb: 2,
                  border: 2,
                  borderColor: selectedConversations.has(conversation.id)
                    ? 'primary.main'
                    : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => handleToggleConversation(conversation.id)}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Checkbox
                        checked={selectedConversations.has(conversation.id)}
                        onChange={() => handleToggleConversation(conversation.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Grid>
                    <Grid item xs>
                      {/* Display descriptive information prominently */}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {conversation.chatbotTitle}
                        </Typography>
                        <Typography variant="body1" color="text.primary">
                          {conversation.courseTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Material: {conversation.materialTitle}
                        </Typography>
                      </Box>
                      
                      {/* Show IDs in smaller, secondary text with tooltips */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                        <Tooltip title="Conversation ID">
                          <Chip 
                            label={`Conv: ${conversation.id.substring(0, 8)}...`}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="User ID">
                          <Chip 
                            label={`User: ${conversation.userId.substring(0, 8)}...`}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Chatbot ID">
                          <Chip 
                            label={`Bot: ${conversation.chatbotId.substring(0, 8)}...`}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Started
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(conversation.startedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(conversation.startedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        startIcon={<AnalyticsIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeSingle(conversation.id);
                        }}
                        size="medium"
                        color="primary"
                      >
                        Analyze
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Analysis Modal */}
      <ConversationAnalysisModal
        open={analysisModalOpen}
        onClose={handleCloseAnalysisModal}
        conversationIds={conversationsToAnalyze}
        autoAnalyze={true}
      />

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Alert
          severity={snackbar.type}
          onClose={handleSnackbarClose}
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 9999,
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default ChatbotConversationsAnalysisPage;

