// src/components/SelectionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, CardActionArea, CardContent, Typography, Tooltip, Button, Divider, Snackbar, Alert, SnackbarCloseReason } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // Import the mail icon

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

import MessagesDisplay from './Messages/MessagesDisplay';
import { useUser } from '../contexts/UserContext';

const SelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { userDetails, isSuperAdmin } = useUser();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(collection(db, 'messages'), orderBy('postedOn', 'desc'));
      const querySnapshot = await getDocs(q);
      const messagesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesList);
    };
    fetchMessages();
  }, [db]);

  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(message => message.id !== id));
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}> {/* Left side menu */}
          <Box className="menu-container">
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12}>
                <Card className="menu-item">
                  <CardActionArea onClick={() => navigate('/my-profile')}>
                    <CardContent>
                      <Typography className="menu-item-typography" variant="h6" component="div">
                        My Account
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card className="menu-item">
                  {userDetails && !userDetails.isAdmin && (!userDetails.class || !userDetails.class.some(course => course !== "Public-Source")) ? (
                    <Tooltip title="The Laboratory Notebook is accessible to users enrolled in an academic course. Please enroll in a course via 'My Account' by following the instructions provided by your academic instructor.">
                      <span>
                        <CardActionArea disabled>
                          <CardContent>
                            <Typography className="menu-item-typography" variant="h6" component="div" sx={{ color: '#9e9e9e', opacity: 0.5 }}>
                              Laboratory Notebook
                              <span style={{ marginLeft: 8 }}>🔒</span>
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </span>
                    </Tooltip>
                  ) : (
                    <CardActionArea onClick={() => navigate('/laboratory-notebooks')}>
                      <CardContent>
                        <Typography className="menu-item-typography" variant="h6" component="div">
                          Laboratory Notebook
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card className="menu-item">
                  <CardActionArea onClick={() => navigate('/supplemental-materials')}>
                    <CardContent>
                      <Typography className="menu-item-typography" variant="h6" component="div">
                        Course Materials
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              
              {userDetails?.isAdmin && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} /> {/* Divider between Course Materials and Educator */}
                    <Typography className="general-menu-title" variant="h6" align="center" component="h2">
                      Educator
                    </Typography>
                    <Card className="menu-item">
                      <CardActionArea onClick={() => navigate('/course-management')}>
                        <CardContent>
                          <Typography className="menu-item-typography" variant="h6" component="div">
                            Course Management
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                </>
              )}

              {isSuperAdmin && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} /> {/* Divider between Course Materials and Educator */}
                    <Typography className="general-menu-title" variant="h6" align="center" component="h2">
                      Super-Admin
                    </Typography>
                    <Card className="menu-item">
                      <CardActionArea onClick={() => navigate('/user-management')}>
                        <CardContent>
                          <Typography className="menu-item-typography" variant="h6" component="div">
                            User Management
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card className="menu-item">
                      <CardActionArea onClick={() => navigate('/educator-requests')}>
                        <CardContent>
                          <Typography className="menu-item-typography" variant="h6" component="div">
                            Educator Requests
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card className="menu-item">
                      <CardActionArea onClick={() => navigate('/course-requests')}>
                        <CardContent>
                          <Typography className="menu-item-typography" variant="h6" component="div">
                            Course Requests
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}> {/* Main content area */}
          <Box className="messages-container"> {/* Wrap the messages in a container box */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              {/* Left side: Inbox text with icon */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlineIcon sx={{ mr: 1 }} /> {/* Margin right for spacing between icon and text */}
                <Typography variant="h5" component="h4" className="inbox-text">
                  Inbox
                </Typography>
              </Box>

              {/* Right side: + Add Message button */}
              {userDetails?.isAdmin && (
                <Button
                  variant="contained"
                  onClick={() => navigate('/add-message')}
                  sx={{
                    backgroundColor: '#ADBC9F',
                    color: '#FBFADA',
                    fontFamily: 'Staatliches, sans-serif',
                    fontSize: '1.25rem',
                    '&:hover': {
                      backgroundColor: '#12372A',
                      border: '0px solid #12372A',
                    },
                  }}
                >
                  + Add Message
                </Button>
              )}
            </Box>
            <MessagesDisplay
              messages={messages}
              userDetails={userDetails}
              navigate={navigate}
              handleDeleteMessage={handleDeleteMessage}
              setMessages={setMessages}
            />
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          User ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SelectionPage;