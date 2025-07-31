// src/components/Messages/MessagesDisplay.tsx
import React, { useState } from 'react';
import { Card, Typography, Link, Box, IconButton, Grid, Button, Paper, Chip } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteMessage from './DeleteMessage';

import PinMessage from './PinMessage';
import PushPinIcon from '@mui/icons-material/PushPin';

import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { FirebaseTimestamp, formatFirebaseTimestamp } from '../../types/firebase';

export interface Message {
  id: string;
  postedOn: FirebaseTimestamp;
  lastUpdatedOn?: FirebaseTimestamp;
  title: string;
  description: string;
  links: { title: string; url: string }[];
  course: string;
  isPinned?: boolean;
}

interface Props {
  messages: Message[];
  userDetails: {
    uid: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    classes?: Record<string, { number: string; title: string; isCourseAdmin?: boolean }>;
  } | null;
  navigate: (path: string) => void;
  handleDeleteMessage: (id: string) => void;
  togglePinMessage: (messageId: string, currentPinStatus: boolean) => Promise<void>;
}

const MessagesDisplay: React.FC<Props> = ({ messages, userDetails, navigate, handleDeleteMessage, togglePinMessage }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const messagesPerPage = 3;

  // Filter messages based on user's accessible courses
  const filteredMessages = messages.filter(message =>
    userDetails?.classes && message.course in userDetails.classes
  );  

  // Separate pinned and unpinned messages
  const pinnedMessages = filteredMessages.filter(message => message.isPinned);
  const unpinnedMessages = filteredMessages.filter(message => !message.isPinned); 

  // Pagination logic
  const indexOfLastMessage = (currentPage + 1) * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = unpinnedMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const totalPages = Math.ceil(unpinnedMessages.length / messagesPerPage);

  // Handle next and previous page
  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () => setCurrentPage((prev) => prev - 1);
  
  // Determine if the user can edit a message
  const canEditMessage = (message: Message) =>
    !!(userDetails?.isSuperAdmin || userDetails?.classes?.[message.course]?.isCourseAdmin);  

  // Get course label
  const getCourseLabel = (courseId: string) => {
    const course = userDetails?.classes?.[courseId];
    return course ? `${course.number}` : 'Unknown Course';
  };  

  return (
    <Box className="messages-display-container"> {/* Naming the main container box */}
      {pinnedMessages.length > 0 && (
        <Paper elevation={3} sx={{ mb: 3, p: 2, backgroundColor: '#FBFADA', borderRadius: '15px' }}>
          <Box className="pinned-section">
            <PushPinIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" className="pinned-title">
              Pinned
            </Typography>
          </Box>
          {pinnedMessages.map((message) => (
            <Card key={message.id} className="messages-card">
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${message.id}-content`}
                  id={`panel-${message.id}-header`}
                >
                  <Grid container justifyContent="space-between" alignItems="flex-start">
                    <Grid item>
                      <Box display="flex" alignItems="center">
                        <Chip 
                          label={getCourseLabel(message.course)}
                          color="primary"
                          variant="outlined"
                          className="message-chip"
                          sx={{ marginRight: 1 }}
                        />
                        <Typography variant="subtitle2" className="message-posted-on">
                          Posted On: {formatFirebaseTimestamp(message.postedOn)} |
                        </Typography>
                        {message.lastUpdatedOn && (
                          <Typography variant="subtitle2" className="message-updated-on">
                            | Last Updated: {formatFirebaseTimestamp(message.lastUpdatedOn)}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="h6" className="message-title">
                        Subject: {message.title}
                      </Typography>
                    </Grid>
                    {canEditMessage(message) && (
                      <Grid item>
                        <PinMessage message={message} togglePinMessage={togglePinMessage} />
                        <IconButton onClick={() => navigate(`/edit-message/${message.id}`)} sx={{ marginRight: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <DeleteMessage messageId={message.id} onDelete={handleDeleteMessage} />
                      </Grid>
                    )}
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '4px', backgroundColor: '#fafafa', marginBottom: '16px' }}>
                    <Typography variant="body1" className="message-description">
                      {message.description}
                    </Typography>
                    {message.links && message.links.some((link) => link.title && link.url) && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" className="message-links-title">Links:</Typography>
                        {message.links.map((link, index) => (
                          link.title && link.url && (
                            <Box key={index} sx={{ mt: 1 }}>
                              <Typography variant="body2" component="span" className="message-link">🔗 {link.title}: </Typography>
                              <Link href={link.url} target="_blank" rel="noopener">{link.url}</Link>
                            </Box>
                          )
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Paper>
      )}

      <Paper elevation={3} sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: '15px' }}>
        {currentMessages.map((message) => (
          <Card key={message.id} className="messages-card">
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${message.id}-content`}
                id={`panel-${message.id}-header`}
              >
                <Grid container justifyContent="space-between" alignItems="flex-start">
                  <Grid item>
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={getCourseLabel(message.course)}
                        color="primary"
                        variant="outlined"
                        className="message-chip"
                        sx={{ marginRight: 1 }}
                      />
                      <Typography variant="subtitle2" className="message-posted-on">
                        Posted On: {formatFirebaseTimestamp(message.postedOn)}
                      </Typography>
                      {message.lastUpdatedOn && (
                        <Typography variant="subtitle2" className="message-updated-on">
                          Last Updated: {formatFirebaseTimestamp(message.lastUpdatedOn)}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="h6" className="message-title">
                      Subject: {message.title}
                    </Typography>
                  </Grid>
                  {canEditMessage(message) && (
                    <Grid item>
                      <PinMessage message={message} togglePinMessage={togglePinMessage} />
                      <IconButton onClick={() => navigate(`/edit-message/${message.id}`)} sx={{ marginRight: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <DeleteMessage messageId={message.id} onDelete={handleDeleteMessage} />
                    </Grid>
                  )}
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '4px', backgroundColor: '#fafafa', marginBottom: '16px' }}>
                  <Typography variant="body1" className="message-description">
                    {message.description}
                  </Typography>
                  {message.links && message.links.some((link) => link.title && link.url) && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" className="message-links-title">Links:</Typography>
                      {message.links.map((link, index) => (
                        link.title && link.url && (
                          <Box key={index} sx={{ mt: 1 }}>
                            <Typography variant="body2" component="span" className="message-link">🔗 {link.title}: </Typography>
                            <Link href={link.url} target="_blank" rel="noopener">{link.url}</Link>
                          </Box>
                        )
                      ))}
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Card>
        ))}
      </Paper>

      <Box className="pagination-container"> {/* Naming the pagination container box */}
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="pagination-button"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
          className="pagination-button"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default MessagesDisplay;